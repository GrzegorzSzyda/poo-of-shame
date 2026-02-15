import { v } from 'convex/values'
import { paginationOptsValidator } from 'convex/server'
import { mutation, query } from './_generated/server'
import {
    assertTitleRequired,
    assertUniqueGameTitleYear,
    assertValidReleaseYear,
    normalizeGameTitle,
    requireGame,
} from './domain/games'
import {
    canManageGamesIdentity,
    ensureAuthUserId,
    ensureCanManageGames,
} from './common/access'
import {
    createGame,
    deleteGameWithLinkedLibraryEntries,
    findGameByTitleYear,
    getGameById,
    listGames,
    listGamesPage,
    syncLibrarySnapshotsForGame,
    updateGame,
} from './repositories/games'

export const list = query({
    args: { paginationOpts: paginationOptsValidator },
    handler: async (ctx, args) => {
        await ensureAuthUserId(ctx)
        return await listGamesPage(ctx, args.paginationOpts)
    },
})

export const canManage = query({
    args: {},
    handler: async (ctx) => {
        await ensureAuthUserId(ctx)
        const identity = await ctx.auth.getUserIdentity()
        return canManageGamesIdentity(identity)
    },
})

export const listAll = query({
    args: {},
    handler: async (ctx) => {
        await ensureAuthUserId(ctx)
        return await listGames(ctx)
    },
})

export const create = mutation({
    args: {
        title: v.string(),
        releaseYear: v.number(),
        coverImageUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { coverImageUrl, releaseYear, title } = args

        await ensureCanManageGames(ctx)

        const titleNormalized = normalizeGameTitle(title)
        assertTitleRequired(titleNormalized)
        assertValidReleaseYear(releaseYear)

        const existing = await findGameByTitleYear(ctx, titleNormalized, releaseYear)
        assertUniqueGameTitleYear(existing)

        return await createGame(ctx, {
            title: title.trim(),
            titleNormalized,
            releaseYear,
            coverImageUrl,
        })
    },
})

export const update = mutation({
    args: {
        gameId: v.id('games'),
        title: v.string(),
        releaseYear: v.number(),
        coverImageUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { coverImageUrl, gameId, releaseYear, title } = args

        await ensureCanManageGames(ctx)

        requireGame(await getGameById(ctx, gameId))

        const titleNormalized = normalizeGameTitle(title)
        assertTitleRequired(titleNormalized)
        assertValidReleaseYear(releaseYear)

        const existing = await findGameByTitleYear(ctx, titleNormalized, releaseYear)
        assertUniqueGameTitleYear(existing, gameId)

        const trimmedTitle = title.trim()

        await updateGame(ctx, gameId, {
            title: trimmedTitle,
            titleNormalized,
            releaseYear,
            coverImageUrl,
        })

        await syncLibrarySnapshotsForGame(ctx, gameId, {
            title: trimmedTitle,
            releaseYear,
            coverImageUrl,
        })
    },
})

export const remove = mutation({
    args: { gameId: v.id('games') },
    handler: async (ctx, { gameId }) => {
        await ensureCanManageGames(ctx)

        requireGame(await getGameById(ctx, gameId))

        await deleteGameWithLinkedLibraryEntries(ctx, gameId)
    },
})
