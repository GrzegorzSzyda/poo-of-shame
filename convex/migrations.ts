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

const countPendingEntries = (entries: Array<Doc<'libraryEntries'>>) =>
    entries.filter((entry) => !entry.migratedAt).length

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

export const getLibraryMigrationPreview = query({
    args: {},
    handler: async (ctx) => {
        await ensureAdmin(ctx)
        return await toPreview(ctx)
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
