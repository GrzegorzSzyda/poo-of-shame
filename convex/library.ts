import { ConvexError, v } from 'convex/values'
import type { Doc } from './_generated/dataModel'
import { mutation, query } from './_generated/server'
import type { MutationCtx, QueryCtx } from './_generated/server'

const userGameStatusValidator = v.union(
    v.literal('wanted'),
    v.literal('owned'),
    v.literal('playing'),
    v.literal('completed'),
    v.literal('mastered'),
    v.literal('dropped'),
)

const gameRunStatusValidator = v.union(
    v.literal('planned'),
    v.literal('playing'),
    v.literal('completed'),
    v.literal('mastered'),
    v.literal('dropped'),
)

const gameRunTypeValidator = v.union(
    v.literal('first_playthrough'),
    v.literal('replay'),
    v.literal('new_game_plus'),
    v.literal('dlc'),
    v.literal('challenge'),
    v.literal('coop'),
    v.literal('other'),
)

const runDatePrecisionValidator = v.union(v.literal('exact'), v.literal('unknown'))
const runSuggestionModeValidator = v.union(v.literal('latest'), v.literal('new'))

type UserGameStatus =
    | 'wanted'
    | 'owned'
    | 'playing'
    | 'completed'
    | 'mastered'
    | 'dropped'

type GameRunStatus = 'planned' | 'playing' | 'completed' | 'mastered' | 'dropped'
type RunDatePrecision = 'exact' | 'unknown'

const interestStatuses = new Set<UserGameStatus>(['wanted', 'owned', 'playing'])

const ensureAuthenticated = async (ctx: QueryCtx | MutationCtx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
        throw new ConvexError('UNAUTHORIZED')
    }
    return identity
}

const normalizeGameTitle = (title: string) =>
    title.trim().toLowerCase().replace(/\s+/g, ' ')

const getPrefixEnd = (value: string) => {
    const lastChar = value.charCodeAt(value.length - 1)
    return `${value.slice(0, -1)}${String.fromCharCode(lastChar + 1)}`
}

const assertInterest = (interest: number) => {
    if (!Number.isFinite(interest) || interest < 0 || interest > 100) {
        throw new ConvexError('INTEREST_INVALID')
    }
    return Math.round(interest)
}

const assertRating = (rating: number) => {
    if (!Number.isFinite(rating) || rating < 0 || rating > 100) {
        throw new ConvexError('RATING_INVALID')
    }
    return Math.round(rating)
}

const isValidIsoDate = (value: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
    const parsed = new Date(`${value}T00:00:00.000Z`)
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

const toYearMonth = (date: string) => date.slice(0, 7)

const buildRunDateFields = (
    prefix: 'started' | 'finished',
    precision: RunDatePrecision,
    date?: string,
) => {
    if (precision === 'unknown') {
        return {
            [`${prefix}Precision`]: precision,
            [`${prefix}Date`]: undefined,
            [`${prefix}Year`]: undefined,
            [`${prefix}Quarter`]: undefined,
            [`${prefix}Month`]: undefined,
            [`${prefix}Text`]: undefined,
            [`${prefix}YearMonth`]: undefined,
        }
    }

    const trimmedDate = date?.trim() ?? ''
    if (!isValidIsoDate(trimmedDate)) {
        throw new ConvexError(
            prefix === 'started' ? 'STARTED_DATE_INVALID' : 'FINISHED_DATE_INVALID',
        )
    }

    return {
        [`${prefix}Precision`]: precision,
        [`${prefix}Date`]: trimmedDate,
        [`${prefix}Year`]: Number(trimmedDate.slice(0, 4)),
        [`${prefix}Month`]: Number(trimmedDate.slice(5, 7)),
        [`${prefix}YearMonth`]: toYearMonth(trimmedDate),
    }
}

const toLibraryGame = (userGame: Doc<'userGames'>, game: Doc<'games'> | null) => ({
    _id: userGame._id,
    gameId: userGame.gameId,
    status: userGame.status,
    interest: userGame.interest,
    note: userGame.note,
    pinnedRunId: userGame.pinnedRunId,
    lastRunId: userGame.lastRunId,
    updatedAt: userGame.updatedAt,
    game: game
        ? {
              _id: game._id,
              title: game.title,
              releaseDate: game.releaseDate,
              releaseYear: game.releaseYear,
              releaseQuarter: game.releaseQuarter,
              releaseYearMonth: game.releaseYearMonth,
              releaseText: game.releaseText,
              coverImageUrl: game.coverImageUrl,
          }
        : null,
})

const toRunListItem = (run: Doc<'gameRuns'>) => ({
    _id: run._id,
    status: run.status,
    label: run.label,
    runType: run.runType,
    rating: run.rating,
    note: run.note,
    startedPrecision: run.startedPrecision,
    startedDate: run.startedDate,
    finishedPrecision: run.finishedPrecision,
    finishedDate: run.finishedDate,
    createdAt: run.createdAt,
    updatedAt: run.updatedAt,
})

const findLatestRunForUserGame = async (
    ctx: MutationCtx,
    userId: string,
    userGameId: Doc<'userGames'>['_id'],
    excludedRunId?: Doc<'gameRuns'>['_id'],
) => {
    const runs = await ctx.db
        .query('gameRuns')
        .withIndex('by_user_userGame', (q) =>
            q.eq('userId', userId).eq('userGameId', userGameId),
        )
        .order('desc')
        .take(2)

    return runs.find((run) => run._id !== excludedRunId) ?? null
}

const getOwnedRun = async (
    ctx: MutationCtx,
    userId: string,
    runId: Doc<'gameRuns'>['_id'],
) => {
    const run = await ctx.db.get(runId)

    if (!run) {
        throw new ConvexError('GAME_RUN_NOT_FOUND')
    }

    if (run.userId !== userId) {
        throw new ConvexError('FORBIDDEN')
    }

    return run
}

const assertRunBelongsToUserGame = (run: Doc<'gameRuns'>, userGame: Doc<'userGames'>) => {
    if (run.userGameId !== userGame._id || run.gameId !== userGame.gameId) {
        throw new ConvexError('GAME_RUN_MISMATCH')
    }
}

const buildRunPatch = (args: {
    status: GameRunStatus
    label?: string
    runType?: Doc<'gameRuns'>['runType']
    rating?: number
    note?: string
    startedPrecision: RunDatePrecision
    startedDate?: string
    finishedPrecision: RunDatePrecision
    finishedDate?: string
}) => {
    const label = args.label?.trim()
    const note = args.note?.trim()

    return {
        status: args.status,
        label: label && label.length > 0 ? label : undefined,
        runType: args.runType,
        rating: args.rating === undefined ? undefined : assertRating(args.rating),
        note: note && note.length > 0 ? note : undefined,
        ...buildRunDateFields('started', args.startedPrecision, args.startedDate),
        ...buildRunDateFields('finished', args.finishedPrecision, args.finishedDate),
    }
}

export const searchCatalogForLibrary = query({
    args: {
        searchText: v.string(),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const identity = await ensureAuthenticated(ctx)
        const searchText = normalizeGameTitle(args.searchText)

        if (searchText.length < 2) {
            return []
        }

        const limit = Math.min(Math.max(args.limit ?? 10, 1), 25)
        const games = await ctx.db
            .query('games')
            .withIndex('by_titleNormalized', (q) =>
                q
                    .gte('titleNormalized', searchText)
                    .lt('titleNormalized', getPrefixEnd(searchText)),
            )
            .take(limit)

        return await Promise.all(
            games.map(async (game) => {
                const userGame = await ctx.db
                    .query('userGames')
                    .withIndex('by_user_game', (q) =>
                        q.eq('userId', identity.subject).eq('gameId', game._id),
                    )
                    .unique()

                return {
                    _id: game._id,
                    title: game.title,
                    releaseDate: game.releaseDate,
                    releaseYear: game.releaseYear,
                    releaseQuarter: game.releaseQuarter,
                    releaseYearMonth: game.releaseYearMonth,
                    releaseText: game.releaseText,
                    coverImageUrl: game.coverImageUrl,
                    isInLibrary: Boolean(userGame),
                }
            }),
        )
    },
})

export const listMyLibrary = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const identity = await ensureAuthenticated(ctx)
        const limit = Math.min(Math.max(args.limit ?? 50, 1), 100)

        const userGames = await ctx.db
            .query('userGames')
            .withIndex('by_user_updatedAt', (q) => q.eq('userId', identity.subject))
            .order('desc')
            .take(limit)

        return await Promise.all(
            userGames.map(async (userGame) => {
                const game = await ctx.db.get(userGame.gameId)
                return toLibraryGame(userGame, game)
            }),
        )
    },
})

export const addGameToLibrary = mutation({
    args: {
        gameId: v.id('games'),
        status: userGameStatusValidator,
        interest: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ensureAuthenticated(ctx)
        const game = await ctx.db.get(args.gameId)

        if (!game) {
            throw new ConvexError('GAME_NOT_FOUND')
        }

        const existing = await ctx.db
            .query('userGames')
            .withIndex('by_user_game', (q) =>
                q.eq('userId', identity.subject).eq('gameId', args.gameId),
            )
            .unique()

        if (existing) {
            throw new ConvexError('USER_GAME_ALREADY_EXISTS')
        }

        const now = Date.now()
        return await ctx.db.insert('userGames', {
            userId: identity.subject,
            gameId: args.gameId,
            status: args.status,
            interest: interestStatuses.has(args.status)
                ? assertInterest(args.interest)
                : 0,
            createdAt: now,
            updatedAt: now,
        })
    },
})

export const updateLibraryGame = mutation({
    args: {
        userGameId: v.id('userGames'),
        status: userGameStatusValidator,
        interest: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ensureAuthenticated(ctx)
        const userGame = await ctx.db.get(args.userGameId)

        if (!userGame) {
            throw new ConvexError('USER_GAME_NOT_FOUND')
        }

        if (userGame.userId !== identity.subject) {
            throw new ConvexError('FORBIDDEN')
        }

        await ctx.db.patch(args.userGameId, {
            status: args.status,
            interest: interestStatuses.has(args.status)
                ? assertInterest(args.interest)
                : 0,
            updatedAt: Date.now(),
        })
    },
})

export const removeGameFromLibrary = mutation({
    args: {
        userGameId: v.id('userGames'),
    },
    handler: async (ctx, args) => {
        const identity = await ensureAuthenticated(ctx)
        const userGame = await ctx.db.get(args.userGameId)

        if (!userGame) {
            throw new ConvexError('USER_GAME_NOT_FOUND')
        }

        if (userGame.userId !== identity.subject) {
            throw new ConvexError('FORBIDDEN')
        }

        const [run, access] = await Promise.all([
            ctx.db
                .query('gameRuns')
                .withIndex('by_user_userGame', (q) =>
                    q.eq('userId', identity.subject).eq('userGameId', args.userGameId),
                )
                .first(),
            ctx.db
                .query('gameAccess')
                .withIndex('by_user_userGame', (q) =>
                    q.eq('userId', identity.subject).eq('userGameId', args.userGameId),
                )
                .first(),
        ])

        if (run || access) {
            throw new ConvexError('USER_GAME_IN_USE')
        }

        await ctx.db.delete(args.userGameId)
    },
})

export const listRunsForUserGame = query({
    args: {
        userGameId: v.id('userGames'),
    },
    handler: async (ctx, args) => {
        const identity = await ensureAuthenticated(ctx)
        const userGame = await ctx.db.get(args.userGameId)

        if (!userGame) {
            throw new ConvexError('USER_GAME_NOT_FOUND')
        }

        if (userGame.userId !== identity.subject) {
            throw new ConvexError('FORBIDDEN')
        }

        const runs = await ctx.db
            .query('gameRuns')
            .withIndex('by_user_userGame', (q) =>
                q.eq('userId', identity.subject).eq('userGameId', args.userGameId),
            )
            .order('desc')
            .take(50)

        return runs.map(toRunListItem)
    },
})

export const createGameRun = mutation({
    args: {
        userGameId: v.id('userGames'),
        status: gameRunStatusValidator,
        label: v.optional(v.string()),
        runType: v.optional(gameRunTypeValidator),
        rating: v.optional(v.number()),
        note: v.optional(v.string()),
        startedPrecision: runDatePrecisionValidator,
        startedDate: v.optional(v.string()),
        finishedPrecision: runDatePrecisionValidator,
        finishedDate: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ensureAuthenticated(ctx)
        const userGame = await ctx.db.get(args.userGameId)

        if (!userGame) {
            throw new ConvexError('USER_GAME_NOT_FOUND')
        }

        if (userGame.userId !== identity.subject) {
            throw new ConvexError('FORBIDDEN')
        }

        const now = Date.now()
        const runId = await ctx.db.insert('gameRuns', {
            userId: identity.subject,
            userGameId: args.userGameId,
            gameId: userGame.gameId,
            ...buildRunPatch(args),
            createdAt: now,
            updatedAt: now,
        })

        await ctx.db.patch(args.userGameId, {
            lastRunId: runId,
            pinnedRunId: userGame.pinnedRunId ?? runId,
            updatedAt: now,
        })

        return runId
    },
})

export const applyRunSuggestion = mutation({
    args: {
        userGameId: v.id('userGames'),
        status: gameRunStatusValidator,
        mode: runSuggestionModeValidator,
    },
    handler: async (ctx, args) => {
        const identity = await ensureAuthenticated(ctx)
        const userGame = await ctx.db.get(args.userGameId)

        if (!userGame) {
            throw new ConvexError('USER_GAME_NOT_FOUND')
        }

        if (userGame.userId !== identity.subject) {
            throw new ConvexError('FORBIDDEN')
        }

        const now = Date.now()

        if (args.mode === 'latest') {
            if (!userGame.lastRunId) {
                throw new ConvexError('GAME_RUN_NOT_FOUND')
            }

            const run = await getOwnedRun(ctx, identity.subject, userGame.lastRunId)
            assertRunBelongsToUserGame(run, userGame)

            await ctx.db.patch(run._id, {
                status: args.status,
                updatedAt: now,
            })

            await ctx.db.patch(userGame._id, {
                updatedAt: now,
            })

            return { mode: args.mode, runId: run._id }
        }

        const runId = await ctx.db.insert('gameRuns', {
            userId: identity.subject,
            userGameId: userGame._id,
            gameId: userGame.gameId,
            status: args.status,
            startedPrecision: 'unknown',
            finishedPrecision: 'unknown',
            createdAt: now,
            updatedAt: now,
        })

        await ctx.db.patch(userGame._id, {
            lastRunId: runId,
            pinnedRunId: userGame.pinnedRunId ?? runId,
            updatedAt: now,
        })

        return { mode: args.mode, runId }
    },
})

export const updateGameRun = mutation({
    args: {
        runId: v.id('gameRuns'),
        status: gameRunStatusValidator,
        label: v.optional(v.string()),
        runType: v.optional(gameRunTypeValidator),
        rating: v.optional(v.number()),
        note: v.optional(v.string()),
        startedPrecision: runDatePrecisionValidator,
        startedDate: v.optional(v.string()),
        finishedPrecision: runDatePrecisionValidator,
        finishedDate: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ensureAuthenticated(ctx)
        const run = await getOwnedRun(ctx, identity.subject, args.runId)
        const userGame = await ctx.db.get(run.userGameId)

        if (!userGame) {
            throw new ConvexError('USER_GAME_NOT_FOUND')
        }

        if (userGame.userId !== identity.subject) {
            throw new ConvexError('FORBIDDEN')
        }

        assertRunBelongsToUserGame(run, userGame)

        const now = Date.now()
        await ctx.db.patch(args.runId, {
            ...buildRunPatch(args),
            updatedAt: now,
        })

        if (userGame.lastRunId === args.runId) {
            await ctx.db.patch(userGame._id, {
                updatedAt: now,
            })
        }
    },
})

export const deleteGameRun = mutation({
    args: {
        runId: v.id('gameRuns'),
    },
    handler: async (ctx, args) => {
        const identity = await ensureAuthenticated(ctx)
        const run = await getOwnedRun(ctx, identity.subject, args.runId)
        const userGame = await ctx.db.get(run.userGameId)

        if (!userGame) {
            throw new ConvexError('USER_GAME_NOT_FOUND')
        }

        if (userGame.userId !== identity.subject) {
            throw new ConvexError('FORBIDDEN')
        }

        assertRunBelongsToUserGame(run, userGame)

        await ctx.db.delete(args.runId)

        if (userGame.lastRunId === args.runId || userGame.pinnedRunId === args.runId) {
            const replacementRun = await findLatestRunForUserGame(
                ctx,
                identity.subject,
                userGame._id,
                args.runId,
            )

            await ctx.db.patch(userGame._id, {
                lastRunId:
                    userGame.lastRunId === args.runId
                        ? (replacementRun?._id ?? undefined)
                        : userGame.lastRunId,
                pinnedRunId:
                    userGame.pinnedRunId === args.runId
                        ? (replacementRun?._id ?? undefined)
                        : userGame.pinnedRunId,
                updatedAt: Date.now(),
            })
        }
    },
})
