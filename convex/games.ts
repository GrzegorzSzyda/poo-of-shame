import { ConvexError, v } from 'convex/values'
import { paginationOptsValidator } from 'convex/server'
import { action, mutation, query } from './_generated/server'
import { ERRORS } from './common/errors'
import {
    assertTitleRequired,
    assertUniqueGameTitleDate,
    assertValidReleaseDate,
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
    findGameByTitleDate,
    getGameById,
    listGames,
    listGamesPage,
    syncLibrarySnapshotsForGame,
    updateGame,
} from './repositories/games'

const MAX_COVER_IMAGE_SIZE_BYTES = 8 * 1024 * 1024
const CONVEX_STORAGE_PATH_SEGMENT = '/api/storage/'

const parseCoverSourceUrl = (sourceUrl: string) => {
    const trimmed = sourceUrl.trim()
    if (trimmed.length === 0) {
        throw new ConvexError(ERRORS.COVER_URL_INVALID)
    }

    try {
        const parsed = new URL(trimmed)
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            throw new ConvexError(ERRORS.COVER_URL_INVALID)
        }
        return parsed
    } catch {
        throw new ConvexError(ERRORS.COVER_URL_INVALID)
    }
}

const isConvexStorageUrl = (sourceUrl: URL) =>
    sourceUrl.pathname.includes(CONVEX_STORAGE_PATH_SEGMENT)

const parseContentLength = (value: string | null) => {
    if (!value) return null
    const parsed = Number(value)
    if (!Number.isFinite(parsed) || parsed < 0) {
        return null
    }
    return parsed
}

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
        releaseDate: v.string(),
        coverImageUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { coverImageUrl, releaseDate, title } = args

        await ensureCanManageGames(ctx)

        const titleNormalized = normalizeGameTitle(title)
        assertTitleRequired(titleNormalized)
        assertValidReleaseDate(releaseDate)

        const existing = await findGameByTitleDate(ctx, titleNormalized, releaseDate)
        assertUniqueGameTitleDate(existing)

        return await createGame(ctx, {
            title: title.trim(),
            titleNormalized,
            releaseDate,
            coverImageUrl,
        })
    },
})

export const update = mutation({
    args: {
        gameId: v.id('games'),
        title: v.string(),
        releaseDate: v.string(),
        coverImageUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { coverImageUrl, gameId, releaseDate, title } = args

        await ensureCanManageGames(ctx)

        requireGame(await getGameById(ctx, gameId))

        const titleNormalized = normalizeGameTitle(title)
        assertTitleRequired(titleNormalized)
        assertValidReleaseDate(releaseDate)

        const existing = await findGameByTitleDate(ctx, titleNormalized, releaseDate)
        assertUniqueGameTitleDate(existing, gameId)

        const trimmedTitle = title.trim()

        await updateGame(ctx, gameId, {
            title: trimmedTitle,
            titleNormalized,
            releaseDate,
            coverImageUrl,
        })

        await syncLibrarySnapshotsForGame(ctx, gameId, {
            title: trimmedTitle,
            releaseDate,
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

export const uploadCoverFromUrl = action({
    args: {
        sourceUrl: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity()
        if (!identity) {
            throw new ConvexError(ERRORS.UNAUTHORIZED)
        }

        if (!canManageGamesIdentity(identity)) {
            throw new ConvexError(ERRORS.FORBIDDEN)
        }

        const sourceUrl = parseCoverSourceUrl(args.sourceUrl)

        if (isConvexStorageUrl(sourceUrl)) {
            return sourceUrl.toString()
        }

        let response: Response

        try {
            response = await fetch(sourceUrl.toString())
        } catch {
            throw new ConvexError(ERRORS.COVER_FETCH_FAILED)
        }

        if (!response.ok) {
            throw new ConvexError(ERRORS.COVER_FETCH_FAILED)
        }

        const contentType = response.headers.get('content-type') ?? ''
        if (!contentType.startsWith('image/')) {
            throw new ConvexError(ERRORS.COVER_NOT_IMAGE)
        }

        const contentLength = parseContentLength(response.headers.get('content-length'))
        if (contentLength !== null && contentLength > MAX_COVER_IMAGE_SIZE_BYTES) {
            throw new ConvexError(ERRORS.COVER_TOO_LARGE)
        }

        const blob = await response.blob()
        if (blob.size > MAX_COVER_IMAGE_SIZE_BYTES) {
            throw new ConvexError(ERRORS.COVER_TOO_LARGE)
        }

        const storageId = await ctx.storage.store(blob)
        const storageUrl = await ctx.storage.getUrl(storageId)
        if (!storageUrl) {
            throw new ConvexError(ERRORS.COVER_FETCH_FAILED)
        }

        return storageUrl
    },
})

export const bulkUpsertGames = mutation({
    args: {
        items: v.array(
            v.object({
                title: v.string(),
                releaseDate: v.string(),
                coverImageUrl: v.string(),
            }),
        ),
    },
    handler: async (ctx, args) => {
        await ensureCanManageGames(ctx)

        let created = 0
        let updated = 0

        for (const item of args.items) {
            const titleNormalized = normalizeGameTitle(item.title)
            assertTitleRequired(titleNormalized)
            assertValidReleaseDate(item.releaseDate)

            const trimmedTitle = item.title.trim()
            const coverImageUrl = item.coverImageUrl.trim()

            const existing = await findGameByTitleDate(
                ctx,
                titleNormalized,
                item.releaseDate,
            )

            if (!existing) {
                await createGame(ctx, {
                    title: trimmedTitle,
                    titleNormalized,
                    releaseDate: item.releaseDate,
                    coverImageUrl,
                })
                created += 1
                continue
            }

            await updateGame(ctx, existing._id, {
                title: trimmedTitle,
                titleNormalized,
                releaseDate: item.releaseDate,
                coverImageUrl,
            })

            await syncLibrarySnapshotsForGame(ctx, existing._id, {
                title: trimmedTitle,
                releaseDate: item.releaseDate,
                coverImageUrl,
            })

            updated += 1
        }

        return {
            total: args.items.length,
            created,
            updated,
        }
    },
})
