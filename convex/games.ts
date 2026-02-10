import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'

const normalizeTitle = (title: string) => title.trim().toLowerCase().replace(/\s+/g, ' ')

const isValidReleaseYear = (year: number) => {
    if (!Number.isFinite(year)) return false
    if (!Number.isInteger(year)) return false
    if (year < 1957) return false
    if (year > new Date().getFullYear() + 1) return false
    return true
}

export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query('games').collect()
    },
})

export const create = mutation({
    args: {
        title: v.string(),
        releaseYear: v.optional(v.number()),
        coverImageUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const titleNormalized = normalizeTitle(args.title)

        if (titleNormalized.length === 0) {
            throw new ConvexError('TITLE_REQUIRED')
        }

        if (args.releaseYear === undefined) {
            throw new ConvexError('RELEASE_YEAR_REQUIRED')
        }

        if (!isValidReleaseYear(args.releaseYear)) {
            throw new ConvexError('RELEASE_YEAR_INVALID')
        }

        const existing = await ctx.db
            .query('games')
            .withIndex('by_titleYear', (q) =>
                q
                    .eq('titleNormalized', titleNormalized)
                    .eq('releaseYear', args.releaseYear!),
            )
            .unique()

        if (existing) {
            throw new ConvexError('GAME_TITLE_YEAR_ALREADY_EXISTS')
        }

        return await ctx.db.insert('games', {
            title: args.title.trim(),
            titleNormalized,
            releaseYear: args.releaseYear,
            coverImageUrl: args.coverImageUrl,
        })
    },
})

export const update = mutation({
    args: {
        gameId: v.id('games'),
        title: v.string(),
        releaseYear: v.optional(v.number()),
        coverImageUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const game = await ctx.db.get(args.gameId)
        if (!game) {
            throw new ConvexError('GAME_NOT_FOUND')
        }

        const titleNormalized = normalizeTitle(args.title)
        if (titleNormalized.length === 0) {
            throw new ConvexError('TITLE_REQUIRED')
        }

        if (args.releaseYear === undefined) {
            throw new ConvexError('RELEASE_YEAR_REQUIRED')
        }

        if (!isValidReleaseYear(args.releaseYear)) {
            throw new ConvexError('RELEASE_YEAR_INVALID')
        }

        const existing = await ctx.db
            .query('games')
            .withIndex('by_titleYear', (q) =>
                q
                    .eq('titleNormalized', titleNormalized)
                    .eq('releaseYear', args.releaseYear!),
            )
            .unique()

        if (existing && existing._id !== args.gameId) {
            throw new ConvexError('GAME_TITLE_YEAR_ALREADY_EXISTS')
        }

        await ctx.db.patch(args.gameId, {
            title: args.title.trim(),
            titleNormalized,
            releaseYear: args.releaseYear,
            coverImageUrl: args.coverImageUrl,
        })
    },
})

export const remove = mutation({
    args: { gameId: v.id('games') },
    handler: async (ctx, { gameId }) => {
        const game = await ctx.db.get(gameId)
        if (!game) {
            throw new ConvexError('GAME_NOT_FOUND')
        }
        await ctx.db.delete(gameId)
    },
})
