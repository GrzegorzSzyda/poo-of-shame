import { ConvexError, v } from 'convex/values'
import { mutation, query, type MutationCtx, type QueryCtx } from './_generated/server'
import type { Doc } from './_generated/dataModel'

const platformValidator = v.union(
    v.literal('ps_disc'),
    v.literal('ps_store'),
    v.literal('ps_plus'),
    v.literal('steam'),
    v.literal('epic'),
    v.literal('gog'),
    v.literal('amazon_gaming'),
    v.literal('ubisoft_connect'),
    v.literal('xbox'),
    v.literal('switch'),
    v.literal('other'),
)

const progressStatusValidator = v.union(
    v.literal('backlog'),
    v.literal('playing'),
    v.literal('completed'),
    v.literal('done'),
    v.literal('dropped'),
)

type Platform =
    | 'ps_disc'
    | 'ps_store'
    | 'ps_plus'
    | 'steam'
    | 'epic'
    | 'gog'
    | 'amazon_gaming'
    | 'ubisoft_connect'
    | 'xbox'
    | 'switch'
    | 'other'

const ensureAuthUserId = async (ctx: QueryCtx | MutationCtx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
        throw new ConvexError('UNAUTHORIZED')
    }
    return identity.tokenIdentifier
}

const normalizePlatforms = (platforms: Platform[]) => {
    const unique = [...new Set(platforms)]
    if (unique.length === 0) {
        throw new ConvexError('PLATFORM_REQUIRED')
    }
    return unique
}

const validateRating = (rating: number) => {
    if (!Number.isFinite(rating) || !Number.isInteger(rating) || rating < 0 || rating > 100) {
        throw new ConvexError('RATING_INVALID')
    }
}

const validateWantsToPlay = (wantsToPlay: number) => {
    if (
        !Number.isFinite(wantsToPlay) ||
        !Number.isInteger(wantsToPlay) ||
        wantsToPlay < 0 ||
        wantsToPlay > 100
    ) {
        throw new ConvexError('WANTS_TO_PLAY_INVALID')
    }
}

const withGames = async (ctx: QueryCtx, entries: Array<Doc<'libraryEntries'>>) =>
    Promise.all(
        entries.map(async (entry) => {
            const game = await ctx.db.get(entry.gameId)
            return {
                ...entry,
                game,
            }
        }),
    )

export const listMyLibrary = query({
    args: {},
    handler: async (ctx) => {
        const userId = await ensureAuthUserId(ctx)

        const entries = await ctx.db
            .query('libraryEntries')
            .withIndex('by_user', (q) => q.eq('userId', userId))
            .collect()

        const entriesWithGames = await withGames(ctx, entries)

        return entriesWithGames.sort((a, b) => b.updatedAt - a.updatedAt)
    },
})

export const listMyLibraryFiltered = query({
    args: {
        progressStatus: v.optional(progressStatusValidator),
        wantsToPlayMin: v.optional(v.number()),
        platform: v.optional(platformValidator),
    },
    handler: async (ctx, args) => {
        const userId = await ensureAuthUserId(ctx)

        const entries = await ctx.db
            .query('libraryEntries')
            .withIndex('by_user', (q) => q.eq('userId', userId))
            .collect()

        const wantsToPlayMin = args.wantsToPlayMin ?? 0
        if (!Number.isFinite(wantsToPlayMin) || wantsToPlayMin < 0 || wantsToPlayMin > 100) {
            throw new ConvexError('WANTS_TO_PLAY_MIN_INVALID')
        }

        const filtered = entries.filter((entry) => {
            if (args.progressStatus && entry.progressStatus !== args.progressStatus) {
                return false
            }
            if (entry.wantsToPlay < wantsToPlayMin) return false
            if (args.platform && !entry.platforms.includes(args.platform)) return false
            return true
        })

        const entriesWithGames = await withGames(ctx, filtered)
        return entriesWithGames.sort((a, b) => b.updatedAt - a.updatedAt)
    },
})

export const addToLibrary = mutation({
    args: {
        gameId: v.id('games'),
        platforms: v.array(platformValidator),
        rating: v.number(),
        wantsToPlay: v.number(),
        progressStatus: progressStatusValidator,
    },
    handler: async (ctx, args) => {
        const userId = await ensureAuthUserId(ctx)

        const game = await ctx.db.get(args.gameId)
        if (!game) {
            throw new ConvexError('GAME_NOT_FOUND')
        }

        validateRating(args.rating)
        validateWantsToPlay(args.wantsToPlay)
        const platforms = normalizePlatforms(args.platforms)

        const existing = await ctx.db
            .query('libraryEntries')
            .withIndex('by_user_game', (q) => q.eq('userId', userId).eq('gameId', args.gameId))
            .unique()

        if (existing) {
            throw new ConvexError('LIB_ENTRY_ALREADY_EXISTS')
        }

        const now = Date.now()

        return await ctx.db.insert('libraryEntries', {
            userId,
            gameId: args.gameId,
            platforms,
            rating: args.rating,
            wantsToPlay: args.wantsToPlay,
            progressStatus: args.progressStatus,
            createdAt: now,
            updatedAt: now,
        })
    },
})

export const updateLibraryEntry = mutation({
    args: {
        entryId: v.id('libraryEntries'),
        platforms: v.array(platformValidator),
        rating: v.number(),
        wantsToPlay: v.number(),
        progressStatus: progressStatusValidator,
    },
    handler: async (ctx, args) => {
        const userId = await ensureAuthUserId(ctx)

        const entry = await ctx.db.get(args.entryId)
        if (!entry) {
            throw new ConvexError('LIB_ENTRY_NOT_FOUND')
        }

        if (entry.userId !== userId) {
            throw new ConvexError('FORBIDDEN')
        }

        validateRating(args.rating)
        validateWantsToPlay(args.wantsToPlay)
        const platforms = normalizePlatforms(args.platforms)

        await ctx.db.patch(args.entryId, {
            platforms,
            rating: args.rating,
            wantsToPlay: args.wantsToPlay,
            progressStatus: args.progressStatus,
            updatedAt: Date.now(),
        })
    },
})

export const removeFromLibrary = mutation({
    args: { entryId: v.id('libraryEntries') },
    handler: async (ctx, args) => {
        const userId = await ensureAuthUserId(ctx)

        const entry = await ctx.db.get(args.entryId)
        if (!entry) {
            throw new ConvexError('LIB_ENTRY_NOT_FOUND')
        }

        if (entry.userId !== userId) {
            throw new ConvexError('FORBIDDEN')
        }

        await ctx.db.delete(args.entryId)
    },
})
