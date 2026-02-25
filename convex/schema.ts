import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'
import { platformValidator, progressStatusValidator } from './domain/library'

export default defineSchema({
    games: defineTable({
        title: v.string(),
        titleNormalized: v.string(),
        releaseDate: v.optional(v.string()),
        releaseYear: v.optional(v.number()),
        coverImageUrl: v.optional(v.string()),
    }).index('by_titleDate', ['titleNormalized', 'releaseDate']),
    libraryEntries: defineTable({
        userId: v.string(),
        gameId: v.id('games'),
        gameTitle: v.optional(v.string()),
        gameReleaseDate: v.optional(v.string()),
        gameReleaseYear: v.optional(v.number()),
        gameCoverImageUrl: v.optional(v.string()),
        note: v.optional(v.string()),
        platforms: v.array(platformValidator),
        rating: v.number(),
        wantsToPlay: v.number(),
        progressStatus: progressStatusValidator,
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index('by_user', ['userId'])
        .index('by_user_game', ['userId', 'gameId'])
        .index('by_game', ['gameId'])
        .index('by_user_progress', ['userId', 'progressStatus'])
        .index('by_user_wantsToPlay', ['userId', 'wantsToPlay']),
})
