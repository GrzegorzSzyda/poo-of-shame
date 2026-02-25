import { v } from 'convex/values'
import { paginationOptsValidator } from 'convex/server'
import { mutation, query } from './_generated/server'
import {
    assertLibraryEntryNotExists,
    assertLibraryEntryOwner,
    assertValidRating,
    assertValidWantsToPlay,
    assertValidWantsToPlayMin,
    normalizeLibraryPlatforms,
    platformValidator,
    progressStatusValidator,
    requireLibraryEntry,
    requireLibraryGame,
} from './domain/library'
import { ensureAuthUserId } from './common/access'
import {
    deleteLibraryEntry,
    getGameById,
    getLibraryEntryById,
    getLibraryEntryByUserAndGame,
    insertLibraryEntry,
    listFilteredLibraryPageWithGameSnapshotByUser,
    listLibraryPageWithGameSnapshotByUser,
    patchLibraryEntry,
} from './repositories/library'

export const listMyLibrary = query({
    args: { paginationOpts: paginationOptsValidator },
    handler: async (ctx, args) => {
        const userId = await ensureAuthUserId(ctx)
        return await listLibraryPageWithGameSnapshotByUser(ctx, userId, args.paginationOpts)
    },
})

export const listMyLibraryFiltered = query({
    args: {
        paginationOpts: paginationOptsValidator,
        progressStatus: v.optional(progressStatusValidator),
        wantsToPlayMin: v.optional(v.number()),
        platform: v.optional(platformValidator),
    },
    handler: async (ctx, args) => {
        const userId = await ensureAuthUserId(ctx)

        const wantsToPlayMin = args.wantsToPlayMin ?? 0
        assertValidWantsToPlayMin(wantsToPlayMin)

        return await listFilteredLibraryPageWithGameSnapshotByUser(
            ctx,
            userId,
            {
                progressStatus: args.progressStatus,
                wantsToPlayMin,
                platform: args.platform,
            },
            args.paginationOpts,
        )
    },
})

export const addToLibrary = mutation({
    args: {
        gameId: v.id('games'),
        note: v.string(),
        platforms: v.array(platformValidator),
        rating: v.number(),
        wantsToPlay: v.number(),
        progressStatus: progressStatusValidator,
    },
    handler: async (ctx, args) => {
        const { gameId, note, progressStatus, rating, wantsToPlay } = args

        const userId = await ensureAuthUserId(ctx)

        const game = requireLibraryGame(await getGameById(ctx, gameId))

        assertValidRating(rating)
        assertValidWantsToPlay(wantsToPlay)
        const platforms = normalizeLibraryPlatforms(args.platforms)

        const existing = await getLibraryEntryByUserAndGame(ctx, userId, gameId)
        assertLibraryEntryNotExists(existing)

        const now = Date.now()

        return await insertLibraryEntry(ctx, {
            userId,
            gameId,
            gameTitle: game.title,
            gameReleaseDate:
                game.releaseDate ??
                (game.releaseYear !== undefined
                    ? `${game.releaseYear}-01-01`
                    : undefined),
            gameCoverImageUrl: game.coverImageUrl,
            note,
            platforms,
            rating,
            wantsToPlay,
            progressStatus,
            createdAt: now,
            updatedAt: now,
        })
    },
})

export const updateLibraryEntry = mutation({
    args: {
        entryId: v.id('libraryEntries'),
        note: v.string(),
        platforms: v.array(platformValidator),
        rating: v.number(),
        wantsToPlay: v.number(),
        progressStatus: progressStatusValidator,
    },
    handler: async (ctx, args) => {
        const { entryId, note, progressStatus, rating, wantsToPlay } = args

        const userId = await ensureAuthUserId(ctx)

        const entry = requireLibraryEntry(await getLibraryEntryById(ctx, entryId))
        assertLibraryEntryOwner(entry, userId)

        assertValidRating(rating)
        assertValidWantsToPlay(wantsToPlay)
        const platforms = normalizeLibraryPlatforms(args.platforms)

        await patchLibraryEntry(ctx, entryId, {
            note,
            platforms,
            rating,
            wantsToPlay,
            progressStatus,
            updatedAt: Date.now(),
        })
    },
})

export const removeFromLibrary = mutation({
    args: { entryId: v.id('libraryEntries') },
    handler: async (ctx, args) => {
        const { entryId } = args

        const userId = await ensureAuthUserId(ctx)

        const entry = requireLibraryEntry(await getLibraryEntryById(ctx, entryId))
        assertLibraryEntryOwner(entry, userId)

        await deleteLibraryEntry(ctx, entryId)
    },
})
