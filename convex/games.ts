import { ConvexError, v } from 'convex/values'
import { query } from './_generated/server'
import type { QueryCtx } from './_generated/server'

const ensureAuthenticated = async (ctx: QueryCtx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
        throw new ConvexError('UNAUTHORIZED')
    }
    return identity
}

export const getCatalogPreview = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await ensureAuthenticated(ctx)

        const limit = Math.min(Math.max(args.limit ?? 10, 1), 25)
        const games = await ctx.db.query('games').order('desc').take(limit)

        return {
            games,
        }
    },
})
