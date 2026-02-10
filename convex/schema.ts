import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
    games: defineTable({
        title: v.string(),
        titleNormalized: v.string(),
        releaseYear: v.number(),
        coverImageUrl: v.optional(v.string()),
    }).index('by_titleYear', ['titleNormalized', 'releaseYear']),
    libraryEntries: defineTable({
        userId: v.string(),
        gameId: v.id('games'),
        platforms: v.array(
            v.union(
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
            ),
        ),
        rating: v.number(),
        wantsToPlay: v.number(),
        progressStatus: v.union(
            v.literal('backlog'),
            v.literal('playing'),
            v.literal('completed'),
            v.literal('done'),
            v.literal('dropped'),
        ),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index('by_user', ['userId'])
        .index('by_user_game', ['userId', 'gameId']),
})
