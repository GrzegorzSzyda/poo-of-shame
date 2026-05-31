import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

const platformValidator = v.union(
    v.literal('ps_disc'),
    v.literal('ps_store'),
    v.literal('ps_plus'),
    v.literal('pc_disc'),
    v.literal('steam'),
    v.literal('epic'),
    v.literal('ea_app'),
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

const datePrecisionValidator = v.union(
    v.literal('exact'),
    v.literal('year'),
    v.literal('quarter'),
    v.literal('month'),
    v.literal('text'),
    v.literal('unknown'),
)

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

const accessPlatformValidator = v.union(
    v.literal('pc'),
    v.literal('playstation'),
    v.literal('xbox'),
    v.literal('switch'),
    v.literal('mobile'),
    v.literal('other'),
)

const accessSourceValidator = v.union(
    v.literal('steam'),
    v.literal('gog'),
    v.literal('epic'),
    v.literal('ea_app'),
    v.literal('ubisoft_connect'),
    v.literal('amazon_gaming'),
    v.literal('ps_store'),
    v.literal('ps_plus'),
    v.literal('ps_disc'),
    v.literal('xbox_store'),
    v.literal('game_pass'),
    v.literal('switch_eshop'),
    v.literal('switch_card'),
    v.literal('pc_disc'),
    v.literal('other'),
)

const accessTypeValidator = v.union(
    v.literal('owned'),
    v.literal('subscription'),
    v.literal('borrowed'),
    v.literal('wishlist'),
    v.literal('unknown'),
)

const appUserRoleValidator = v.union(v.literal('user'), v.literal('admin'))

export default defineSchema({
    games: defineTable({
        title: v.string(),
        titleNormalized: v.string(),
        releasePrecision: v.optional(datePrecisionValidator),
        releaseKey: v.optional(v.string()),
        releaseDate: v.optional(v.string()),
        releaseYear: v.optional(v.number()),
        releaseQuarter: v.optional(v.number()),
        releaseMonth: v.optional(v.number()),
        releaseText: v.optional(v.string()),
        releaseYearMonth: v.optional(v.string()),
        coverImageUrl: v.optional(v.string()),
        createdAt: v.optional(v.number()),
        updatedAt: v.optional(v.number()),
    })
        .index('by_titleDate', ['titleNormalized', 'releaseDate'])
        .index('by_titleNormalized', ['titleNormalized'])
        .index('by_titleReleaseKey', ['titleNormalized', 'releaseKey'])
        .index('by_releaseYear', ['releaseYear']),
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
    userGames: defineTable({
        userId: v.string(),
        gameId: v.id('games'),
        status: userGameStatusValidator,
        interest: v.number(),
        note: v.optional(v.string()),
        pinnedRunId: v.optional(v.id('gameRuns')),
        lastRunId: v.optional(v.id('gameRuns')),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index('by_user', ['userId'])
        .index('by_user_game', ['userId', 'gameId'])
        .index('by_user_status', ['userId', 'status'])
        .index('by_user_updatedAt', ['userId', 'updatedAt'])
        .index('by_user_lastRun', ['userId', 'lastRunId']),
    gameAccess: defineTable({
        userId: v.string(),
        userGameId: v.id('userGames'),
        gameId: v.id('games'),
        platform: accessPlatformValidator,
        source: accessSourceValidator,
        accessType: accessTypeValidator,
        isAvailable: v.boolean(),
        note: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index('by_user', ['userId'])
        .index('by_user_userGame', ['userId', 'userGameId'])
        .index('by_user_platform', ['userId', 'platform'])
        .index('by_user_source', ['userId', 'source'])
        .index('by_user_available', ['userId', 'isAvailable']),
    gameRuns: defineTable({
        userId: v.string(),
        userGameId: v.id('userGames'),
        gameId: v.id('games'),
        status: gameRunStatusValidator,
        label: v.optional(v.string()),
        runType: v.optional(gameRunTypeValidator),
        rating: v.optional(v.number()),
        note: v.optional(v.string()),
        startedPrecision: datePrecisionValidator,
        startedDate: v.optional(v.string()),
        startedYear: v.optional(v.number()),
        startedQuarter: v.optional(v.number()),
        startedMonth: v.optional(v.number()),
        startedText: v.optional(v.string()),
        startedYearMonth: v.optional(v.string()),
        finishedPrecision: datePrecisionValidator,
        finishedDate: v.optional(v.string()),
        finishedYear: v.optional(v.number()),
        finishedQuarter: v.optional(v.number()),
        finishedMonth: v.optional(v.number()),
        finishedText: v.optional(v.string()),
        finishedYearMonth: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index('by_user', ['userId'])
        .index('by_user_game', ['userId', 'gameId'])
        .index('by_user_userGame', ['userId', 'userGameId'])
        .index('by_user_status', ['userId', 'status'])
        .index('by_user_startedYear', ['userId', 'startedYear'])
        .index('by_user_startedYearMonth', ['userId', 'startedYearMonth'])
        .index('by_user_finishedYear', ['userId', 'finishedYear'])
        .index('by_user_finishedYearMonth', ['userId', 'finishedYearMonth']),
    appUsers: defineTable({
        subject: v.string(),
        tokenIdentifier: v.string(),
        issuer: v.string(),
        email: v.optional(v.string()),
        name: v.optional(v.string()),
        role: appUserRoleValidator,
        lastSeenAt: v.number(),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index('by_subject', ['subject'])
        .index('by_tokenIdentifier', ['tokenIdentifier'])
        .index('by_role', ['role']),
    integrationSettings: defineTable({
        key: v.literal('igdb'),
        igdbClientId: v.string(),
        igdbClientSecret: v.string(),
        updatedByUserId: v.string(),
        createdAt: v.number(),
        updatedAt: v.number(),
    }).index('by_key', ['key']),
})
