import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
    games: defineTable({
        title: v.string(),
        titleNormalized: v.string(),
        releaseYear: v.number(),
        coverImageUrl: v.optional(v.string()),
    }).index('by_titleYear', ['titleNormalized', 'releaseYear']),
})
