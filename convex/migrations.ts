import { v } from 'convex/values'
import type { Doc, Id } from './_generated/dataModel'
import { mutation, query } from './_generated/server'
import type { MutationCtx, QueryCtx } from './_generated/server'
import { ensureAdmin } from './admin'

type LegacyProgressStatus = Doc<'libraryEntries'>['progressStatus']
type UserGameStatus = Doc<'userGames'>['status']
type GameRunStatus = Doc<'gameRuns'>['status']
type LegacyPlatform = Doc<'libraryEntries'>['platforms'][number]
type AccessPlatform = Doc<'gameAccess'>['platform']
type AccessSource = Doc<'gameAccess'>['source']
type AccessType = Doc<'gameAccess'>['accessType']

const migratedStatuses = new Set<LegacyProgressStatus>([
    'playing',
    'completed',
    'done',
    'dropped',
])

const toUserGameStatus = (status: LegacyProgressStatus): UserGameStatus => {
    switch (status) {
        case 'backlog':
            return 'owned'
        case 'playing':
            return 'playing'
        case 'completed':
            return 'completed'
        case 'done':
            return 'mastered'
        case 'dropped':
            return 'dropped'
    }
}

const toGameRunStatus = (status: LegacyProgressStatus): GameRunStatus | null => {
    switch (status) {
        case 'backlog':
            return null
        case 'playing':
            return 'playing'
        case 'completed':
            return 'completed'
        case 'done':
            return 'mastered'
        case 'dropped':
            return 'dropped'
    }
}

const toBackfilledRunStatus = (
    status: LegacyProgressStatus,
): Doc<'gameRuns'>['status'] => {
    switch (status) {
        case 'backlog':
            return 'planned'
        case 'playing':
            return 'playing'
        case 'completed':
            return 'completed'
        case 'done':
            return 'mastered'
        case 'dropped':
            return 'dropped'
    }
}

const toInterest = (entry: Doc<'libraryEntries'>) =>
    entry.progressStatus === 'backlog' || entry.progressStatus === 'playing'
        ? entry.wantsToPlay
        : 0

const toAccess = (
    platform: LegacyPlatform,
): {
    platform: AccessPlatform
    source: AccessSource
    accessType: AccessType
    isAvailable: boolean
} => {
    switch (platform) {
        case 'ps_disc':
            return {
                platform: 'playstation',
                source: 'ps_disc',
                accessType: 'owned',
                isAvailable: true,
            }
        case 'ps_store':
            return {
                platform: 'playstation',
                source: 'ps_store',
                accessType: 'owned',
                isAvailable: true,
            }
        case 'ps_plus':
            return {
                platform: 'playstation',
                source: 'ps_plus',
                accessType: 'subscription',
                isAvailable: true,
            }
        case 'pc_disc':
            return {
                platform: 'pc',
                source: 'pc_disc',
                accessType: 'owned',
                isAvailable: true,
            }
        case 'steam':
        case 'epic':
        case 'ea_app':
        case 'gog':
        case 'amazon_gaming':
        case 'ubisoft_connect':
            return {
                platform: 'pc',
                source: platform,
                accessType: 'owned',
                isAvailable: true,
            }
        case 'xbox':
            return {
                platform: 'xbox',
                source: 'xbox_store',
                accessType: 'owned',
                isAvailable: true,
            }
        case 'switch':
            return {
                platform: 'switch',
                source: 'switch_eshop',
                accessType: 'owned',
                isAvailable: true,
            }
        case 'other':
            return {
                platform: 'other',
                source: 'other',
                accessType: 'unknown',
                isAvailable: true,
            }
    }
}

const getExistingUserGame = async (
    ctx: QueryCtx | MutationCtx,
    entry: Doc<'libraryEntries'>,
) =>
    await ctx.db
        .query('userGames')
        .withIndex('by_user_game', (q) =>
            q.eq('userId', entry.userId).eq('gameId', entry.gameId),
        )
        .unique()

const countMissingAccessRecordsForEntry = async (
    ctx: QueryCtx | MutationCtx,
    entry: Doc<'libraryEntries'>,
    userGameId: Id<'userGames'>,
) => {
    const existingAccessRecords = await ctx.db
        .query('gameAccess')
        .withIndex('by_user_userGame', (q) =>
            q.eq('userId', entry.userId).eq('userGameId', userGameId),
        )
        .collect()

    let missingRecords = 0

    for (const legacyPlatform of entry.platforms) {
        const access = toAccess(legacyPlatform)
        const alreadyExists = existingAccessRecords.some(
            (record) =>
                record.platform === access.platform &&
                record.source === access.source &&
                record.accessType === access.accessType,
        )

        if (!alreadyExists) {
            missingRecords += 1
        }
    }

    return missingRecords
}

const countPendingEntries = (entries: Array<Doc<'libraryEntries'>>) =>
    entries.filter((entry) => !entry.migratedAt).length

const shouldBackfillWantedStatus = (
    entry: Doc<'libraryEntries'>,
    userGame: Doc<'userGames'> | null,
) =>
    entry.progressStatus === 'backlog' &&
    entry.platforms.length === 0 &&
    userGame !== null &&
    userGame.status !== 'wanted'

const getLegacyRatingBackfillNeed = async (
    ctx: QueryCtx | MutationCtx,
    entry: Doc<'libraryEntries'>,
    userGame: Doc<'userGames'> | null,
) => {
    if (!userGame) {
        return {
            needsBackfill: false,
            runs: [] as Array<Doc<'gameRuns'>>,
        }
    }

    const runs = await ctx.db
        .query('gameRuns')
        .withIndex('by_user_userGame', (q) =>
            q.eq('userId', entry.userId).eq('userGameId', userGame._id),
        )
        .collect()

    const hasRatingOnAnyRun = runs.some((run) => run.rating !== undefined)

    return {
        needsBackfill: !hasRatingOnAnyRun,
        runs,
    }
}

const toPreview = async (ctx: QueryCtx) => {
    const entries = await ctx.db.query('libraryEntries').collect()

    let existingUserGames = 0
    let missingGames = 0
    let userGamesToCreate = 0
    let runsToCreate = 0
    let accessRecordsToCreate = 0

    for (const entry of entries) {
        const [game, existingUserGame] = await Promise.all([
            ctx.db.get(entry.gameId),
            getExistingUserGame(ctx, entry),
        ])

        if (!game) {
            missingGames += 1
        }

        if (existingUserGame) {
            existingUserGames += 1
        } else if (!entry.migratedAt) {
            userGamesToCreate += 1
        }

        if (!entry.migratedAt && migratedStatuses.has(entry.progressStatus)) {
            runsToCreate += 1
        }

        if (!entry.migratedAt) {
            accessRecordsToCreate += entry.platforms.length
        }
    }

    return {
        legacyEntries: entries.length,
        pendingEntries: countPendingEntries(entries),
        migratedEntries: entries.length - countPendingEntries(entries),
        existingUserGames,
        missingGames,
        userGamesToCreate,
        runsToCreate,
        accessRecordsToCreate,
    }
}

const toGameAccessBackfillPreview = async (ctx: QueryCtx | MutationCtx) => {
    const entries = await ctx.db.query('libraryEntries').collect()

    let legacyEntriesWithPlatforms = 0
    let entriesWithResolvableUserGame = 0
    let entriesMissingUserGame = 0
    let accessRecordsMissing = 0

    for (const entry of entries) {
        if (entry.platforms.length === 0) {
            continue
        }

        legacyEntriesWithPlatforms += 1

        const userGame = await getExistingUserGame(ctx, entry)
        if (!userGame) {
            entriesMissingUserGame += 1
            continue
        }

        entriesWithResolvableUserGame += 1
        accessRecordsMissing += await countMissingAccessRecordsForEntry(
            ctx,
            entry,
            userGame._id,
        )
    }

    return {
        legacyEntriesWithPlatforms,
        entriesWithResolvableUserGame,
        entriesMissingUserGame,
        accessRecordsMissing,
    }
}

const toLegacySemanticBackfillPreview = async (ctx: QueryCtx | MutationCtx) => {
    const entries = await ctx.db.query('libraryEntries').collect()

    let wantedStatusCandidates = 0
    let ratingBackfillCandidates = 0
    let entriesMissingUserGame = 0

    for (const entry of entries) {
        const userGame = await getExistingUserGame(ctx, entry)
        if (!userGame) {
            entriesMissingUserGame += 1
            continue
        }

        if (shouldBackfillWantedStatus(entry, userGame)) {
            wantedStatusCandidates += 1
        }

        const { needsBackfill } = await getLegacyRatingBackfillNeed(ctx, entry, userGame)
        if (needsBackfill) {
            ratingBackfillCandidates += 1
        }
    }

    return {
        wantedStatusCandidates,
        ratingBackfillCandidates,
        entriesMissingUserGame,
    }
}

export const getLibraryMigrationPreview = query({
    args: {},
    handler: async (ctx) => {
        await ensureAdmin(ctx)
        return await toPreview(ctx)
    },
})

export const getGameAccessBackfillPreview = query({
    args: {},
    handler: async (ctx) => {
        await ensureAdmin(ctx)
        return await toGameAccessBackfillPreview(ctx)
    },
})

export const getLegacySemanticBackfillPreview = query({
    args: {},
    handler: async (ctx) => {
        await ensureAdmin(ctx)
        return await toLegacySemanticBackfillPreview(ctx)
    },
})

export const runLibraryMigrationBatch = mutation({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await ensureAdmin(ctx)
        const limit = Math.min(Math.max(args.limit ?? 25, 1), 100)
        const entries = await ctx.db.query('libraryEntries').collect()
        const pendingEntries = entries
            .filter((entry) => !entry.migratedAt)
            .slice(0, limit)

        const result = {
            processed: 0,
            skippedMissingGame: 0,
            createdUserGames: 0,
            reusedUserGames: 0,
            createdRuns: 0,
            createdAccessRecords: 0,
            markedMigrated: 0,
        }

        for (const entry of pendingEntries) {
            const game = await ctx.db.get(entry.gameId)

            if (!game) {
                result.skippedMissingGame += 1
                continue
            }

            const now = Date.now()
            const existingUserGame = await getExistingUserGame(ctx, entry)
            let userGameId: Id<'userGames'>
            let createdUserGame = false

            if (existingUserGame) {
                userGameId = existingUserGame._id
                result.reusedUserGames += 1
            } else {
                userGameId = await ctx.db.insert('userGames', {
                    userId: entry.userId,
                    gameId: entry.gameId,
                    status: toUserGameStatus(entry.progressStatus),
                    interest: toInterest(entry),
                    note:
                        entry.note && entry.note.trim().length > 0
                            ? entry.note.trim()
                            : undefined,
                    createdAt: entry.createdAt,
                    updatedAt: entry.updatedAt,
                })
                createdUserGame = true
                result.createdUserGames += 1
            }

            const runStatus = toGameRunStatus(entry.progressStatus)
            const existingRuns = await ctx.db
                .query('gameRuns')
                .withIndex('by_user_userGame', (q) =>
                    q.eq('userId', entry.userId).eq('userGameId', userGameId),
                )
                .take(1)

            if (runStatus && existingRuns.length === 0) {
                const runId = await ctx.db.insert('gameRuns', {
                    userId: entry.userId,
                    userGameId,
                    gameId: entry.gameId,
                    status: runStatus,
                    runType: 'first_playthrough',
                    rating:
                        entry.progressStatus === 'completed' ||
                        entry.progressStatus === 'done' ||
                        entry.progressStatus === 'dropped'
                            ? entry.rating
                            : undefined,
                    startedPrecision: 'unknown',
                    finishedPrecision: 'unknown',
                    createdAt: entry.createdAt,
                    updatedAt: entry.updatedAt,
                })

                await ctx.db.patch(userGameId, {
                    lastRunId: runId,
                    pinnedRunId: runId,
                    updatedAt: Math.max(entry.updatedAt, now),
                })
                result.createdRuns += 1
            } else if (createdUserGame) {
                await ctx.db.patch(userGameId, {
                    updatedAt: entry.updatedAt,
                })
            }

            const existingAccessRecords = await ctx.db
                .query('gameAccess')
                .withIndex('by_user_userGame', (q) =>
                    q.eq('userId', entry.userId).eq('userGameId', userGameId),
                )
                .collect()

            for (const legacyPlatform of entry.platforms) {
                const access = toAccess(legacyPlatform)
                const alreadyExists = existingAccessRecords.some(
                    (record) =>
                        record.platform === access.platform &&
                        record.source === access.source &&
                        record.accessType === access.accessType,
                )

                if (alreadyExists) continue

                await ctx.db.insert('gameAccess', {
                    userId: entry.userId,
                    userGameId,
                    gameId: entry.gameId,
                    ...access,
                    createdAt: entry.createdAt,
                    updatedAt: entry.updatedAt,
                })
                result.createdAccessRecords += 1
            }

            await ctx.db.patch(entry._id, {
                migratedToUserGameId: userGameId,
                migratedAt: now,
            })

            result.processed += 1
            result.markedMigrated += 1
        }

        return {
            ...result,
            remaining: countPendingEntries(
                await ctx.db.query('libraryEntries').collect(),
            ),
        }
    },
})

export const backfillGameAccessBatch = mutation({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await ensureAdmin(ctx)
        const limit = Math.min(Math.max(args.limit ?? 25, 1), 100)
        const entries = await ctx.db.query('libraryEntries').collect()
        const candidateEntries = entries.filter((entry) => entry.platforms.length > 0)

        const result = {
            inspectedEntries: 0,
            entriesWithCreatedAccess: 0,
            skippedMissingUserGame: 0,
            createdAccessRecords: 0,
        }

        for (const entry of candidateEntries) {
            if (result.inspectedEntries >= limit) {
                break
            }

            result.inspectedEntries += 1

            const userGame = await getExistingUserGame(ctx, entry)
            if (!userGame) {
                result.skippedMissingUserGame += 1
                continue
            }

            const existingAccessRecords = await ctx.db
                .query('gameAccess')
                .withIndex('by_user_userGame', (q) =>
                    q.eq('userId', entry.userId).eq('userGameId', userGame._id),
                )
                .collect()

            let createdForEntry = 0

            for (const legacyPlatform of entry.platforms) {
                const access = toAccess(legacyPlatform)
                const alreadyExists = existingAccessRecords.some(
                    (record) =>
                        record.platform === access.platform &&
                        record.source === access.source &&
                        record.accessType === access.accessType,
                )

                if (alreadyExists) continue

                await ctx.db.insert('gameAccess', {
                    userId: entry.userId,
                    userGameId: userGame._id,
                    gameId: entry.gameId,
                    ...access,
                    createdAt: entry.createdAt,
                    updatedAt: entry.updatedAt,
                })
                existingAccessRecords.push({
                    ...(access as Omit<
                        Doc<'gameAccess'>,
                        | '_id'
                        | '_creationTime'
                        | 'userId'
                        | 'userGameId'
                        | 'gameId'
                        | 'createdAt'
                        | 'updatedAt'
                    >),
                    _id: `${entry._id}-${legacyPlatform}` as Id<'gameAccess'>,
                    _creationTime: entry.createdAt,
                    userId: entry.userId,
                    userGameId: userGame._id,
                    gameId: entry.gameId,
                    createdAt: entry.createdAt,
                    updatedAt: entry.updatedAt,
                    note: undefined,
                })
                createdForEntry += 1
                result.createdAccessRecords += 1
            }

            if (createdForEntry > 0) {
                result.entriesWithCreatedAccess += 1
            }
        }

        const preview = await toGameAccessBackfillPreview(ctx)

        return {
            ...result,
            remainingAccessRecordsMissing: preview.accessRecordsMissing,
        }
    },
})

export const backfillLegacySemanticBatch = mutation({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await ensureAdmin(ctx)
        const limit = Math.min(Math.max(args.limit ?? 25, 1), 100)
        const entries = await ctx.db.query('libraryEntries').collect()

        const result = {
            inspectedEntries: 0,
            updatedWantedStatuses: 0,
            createdRuns: 0,
            patchedRunRatings: 0,
            skippedMissingUserGame: 0,
        }

        for (const entry of entries) {
            if (result.inspectedEntries >= limit) {
                break
            }

            const userGame = await getExistingUserGame(ctx, entry)
            if (!userGame) {
                result.skippedMissingUserGame += 1
                continue
            }

            const needsWantedStatus = shouldBackfillWantedStatus(entry, userGame)
            const ratingState = await getLegacyRatingBackfillNeed(ctx, entry, userGame)

            if (!needsWantedStatus && !ratingState.needsBackfill) {
                continue
            }

            result.inspectedEntries += 1
            const now = Date.now()

            if (needsWantedStatus) {
                await ctx.db.patch(userGame._id, {
                    status: 'wanted',
                    updatedAt: Math.max(now, userGame.updatedAt),
                })
                result.updatedWantedStatuses += 1
            }

            if (ratingState.needsBackfill) {
                const latestRun = ratingState.runs
                    .slice()
                    .sort((left, right) => right.updatedAt - left.updatedAt)[0]

                if (latestRun) {
                    await ctx.db.patch(latestRun._id, {
                        rating: entry.rating,
                        updatedAt: Math.max(now, latestRun.updatedAt),
                    })
                    result.patchedRunRatings += 1
                } else {
                    const runId = await ctx.db.insert('gameRuns', {
                        userId: entry.userId,
                        userGameId: userGame._id,
                        gameId: entry.gameId,
                        status: toBackfilledRunStatus(entry.progressStatus),
                        runType: 'first_playthrough',
                        rating: entry.rating,
                        startedPrecision: 'unknown',
                        finishedPrecision: 'unknown',
                        createdAt: entry.createdAt,
                        updatedAt: entry.updatedAt,
                    })

                    await ctx.db.patch(userGame._id, {
                        lastRunId: userGame.lastRunId ?? runId,
                        pinnedRunId: userGame.pinnedRunId ?? runId,
                        updatedAt: Math.max(now, userGame.updatedAt),
                    })
                    result.createdRuns += 1
                }
            }
        }

        const preview = await toLegacySemanticBackfillPreview(ctx)

        return {
            ...result,
            remainingWantedStatusCandidates: preview.wantedStatusCandidates,
            remainingRatingBackfillCandidates: preview.ratingBackfillCandidates,
        }
    },
})
