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

type UserGameStatus =
    | 'wanted'
    | 'owned'
    | 'playing'
    | 'completed'
    | 'mastered'
    | 'dropped'

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

const toLibraryGame = (userGame: Doc<'userGames'>, game: Doc<'games'> | null) => ({
    _id: userGame._id,
    gameId: userGame.gameId,
    status: userGame.status,
    interest: userGame.interest,
    note: userGame.note,
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
