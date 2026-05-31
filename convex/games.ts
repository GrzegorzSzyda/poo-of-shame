import { ConvexError, v } from 'convex/values'
import { internal } from './_generated/api'
import { action, mutation, query } from './_generated/server'
import type { MutationCtx, QueryCtx } from './_generated/server'
import { ensureAdmin } from './admin'

const MAX_COVER_IMAGE_SIZE_BYTES = 8 * 1024 * 1024
const IGDB_API_BASE_URL = 'https://api.igdb.com/v4'
const IGDB_TOKEN_URL = 'https://id.twitch.tv/oauth2/token'

const releasePrecisionValidator = v.union(
    v.literal('exact'),
    v.literal('year'),
    v.literal('quarter'),
    v.literal('month'),
    v.literal('text'),
    v.literal('unknown'),
)

const ensureAuthenticated = async (ctx: QueryCtx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
        throw new ConvexError('UNAUTHORIZED')
    }
    return identity
}

const normalizeGameTitle = (title: string) =>
    title.trim().toLowerCase().replace(/\s+/g, ' ')

const normalizeReleaseText = (value: string) =>
    value.trim().toLowerCase().replace(/\s+/g, ' ')

const toYearMonth = (year: number, month: number) =>
    `${year}-${String(month).padStart(2, '0')}`

const assertYear = (year: number | undefined) => {
    if (!Number.isInteger(year) || year < 1950 || year > 2200) {
        throw new ConvexError('RELEASE_YEAR_INVALID')
    }
    return year
}

const assertQuarter = (quarter: number | undefined) => {
    if (!Number.isInteger(quarter) || quarter < 1 || quarter > 4) {
        throw new ConvexError('RELEASE_QUARTER_INVALID')
    }
    return quarter
}

const assertMonth = (month: number | undefined) => {
    if (!Number.isInteger(month) || month < 1 || month > 12) {
        throw new ConvexError('RELEASE_MONTH_INVALID')
    }
    return month
}

const isValidIsoDate = (value: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
    const parsed = new Date(`${value}T00:00:00.000Z`)
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

const buildReleaseFields = (input: {
    releasePrecision: ReleasePrecision
    releaseDate?: string
    releaseYear?: number
    releaseQuarter?: number
    releaseMonth?: number
    releaseText?: string
}) => {
    switch (input.releasePrecision) {
        case 'exact': {
            const releaseDate = input.releaseDate?.trim() ?? ''
            if (!isValidIsoDate(releaseDate)) {
                throw new ConvexError('RELEASE_DATE_INVALID')
            }
            const releaseYear = Number(releaseDate.slice(0, 4))
            const releaseMonth = Number(releaseDate.slice(5, 7))
            return {
                releaseDate,
                releaseYear,
                releaseMonth,
                releaseYearMonth: toYearMonth(releaseYear, releaseMonth),
                releaseKey: `exact:${releaseDate}`,
            }
        }
        case 'year': {
            const releaseYear = assertYear(input.releaseYear)
            return {
                releaseYear,
                releaseKey: `year:${releaseYear}`,
            }
        }
        case 'quarter': {
            const releaseYear = assertYear(input.releaseYear)
            const releaseQuarter = assertQuarter(input.releaseQuarter)
            return {
                releaseYear,
                releaseQuarter,
                releaseKey: `quarter:${releaseYear}-Q${releaseQuarter}`,
            }
        }
        case 'month': {
            const releaseYear = assertYear(input.releaseYear)
            const releaseMonth = assertMonth(input.releaseMonth)
            return {
                releaseYear,
                releaseMonth,
                releaseYearMonth: toYearMonth(releaseYear, releaseMonth),
                releaseKey: `month:${toYearMonth(releaseYear, releaseMonth)}`,
            }
        }
        case 'text': {
            const releaseText = input.releaseText?.trim() ?? ''
            const normalizedText = normalizeReleaseText(releaseText)
            if (normalizedText.length === 0) {
                throw new ConvexError('RELEASE_TEXT_REQUIRED')
            }
            return {
                releaseText,
                releaseKey: `text:${normalizedText}`,
            }
        }
        case 'unknown':
            return {
                releaseKey: 'unknown',
            }
    }
}

type ReleasePrecision = 'exact' | 'year' | 'quarter' | 'month' | 'text' | 'unknown'

type ReleaseFields = ReturnType<typeof buildReleaseFields>

type IgdbTokenCache = {
    clientId: string
    token: string
    expiresAt: number
}

type IgdbGameSearchResult = {
    id?: unknown
    name?: unknown
    first_release_date?: unknown
    cover?: {
        image_id?: unknown
    }
}

let igdbTokenCache: IgdbTokenCache | null = null

const findExistingGame = async (
    ctx: QueryCtx | MutationCtx,
    titleNormalized: string,
    releasePrecision: ReleasePrecision,
    releaseFields: ReleaseFields,
) => {
    const byReleaseKey = await ctx.db
        .query('games')
        .withIndex('by_titleReleaseKey', (q) =>
            q
                .eq('titleNormalized', titleNormalized)
                .eq('releaseKey', releaseFields.releaseKey),
        )
        .unique()

    if (byReleaseKey) return byReleaseKey

    const legacyCandidates = await ctx.db
        .query('games')
        .withIndex('by_titleNormalized', (q) => q.eq('titleNormalized', titleNormalized))
        .collect()

    return (
        legacyCandidates.find((game) => {
            if (game.releaseKey !== undefined) return false

            if ('releaseDate' in releaseFields && releaseFields.releaseDate) {
                return game.releaseDate === releaseFields.releaseDate
            }

            if (
                (releasePrecision === 'year' ||
                    releasePrecision === 'quarter' ||
                    releasePrecision === 'month') &&
                'releaseYear' in releaseFields
            ) {
                return game.releaseYear === releaseFields.releaseYear
            }

            if (releasePrecision === 'unknown') {
                return game.releaseDate === undefined && game.releaseYear === undefined
            }

            return false
        }) ?? null
    )
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

export const getRewriteHealth = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ensureAuthenticated(ctx)
        const userId = identity.subject

        const [games, userGames, gameRuns, gameAccess] = await Promise.all([
            ctx.db.query('games').order('desc').take(5),
            ctx.db
                .query('userGames')
                .withIndex('by_user', (q) => q.eq('userId', userId))
                .order('desc')
                .take(5),
            ctx.db
                .query('gameRuns')
                .withIndex('by_user', (q) => q.eq('userId', userId))
                .order('desc')
                .take(5),
            ctx.db
                .query('gameAccess')
                .withIndex('by_user', (q) => q.eq('userId', userId))
                .order('desc')
                .take(5),
        ])

        return {
            userId,
            tables: {
                games: games.length,
                userGames: userGames.length,
                gameRuns: gameRuns.length,
                gameAccess: gameAccess.length,
            },
        }
    },
})

export const createGame = mutation({
    args: {
        title: v.string(),
        releasePrecision: releasePrecisionValidator,
        releaseDate: v.optional(v.string()),
        releaseYear: v.optional(v.number()),
        releaseQuarter: v.optional(v.number()),
        releaseMonth: v.optional(v.number()),
        releaseText: v.optional(v.string()),
        coverImageUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ensureAdmin(ctx)

        const title = args.title.trim()
        const titleNormalized = normalizeGameTitle(title)
        if (titleNormalized.length === 0) {
            throw new ConvexError('TITLE_REQUIRED')
        }

        const releaseFields = buildReleaseFields(args)
        const existing = await findExistingGame(
            ctx,
            titleNormalized,
            args.releasePrecision,
            releaseFields,
        )

        if (existing) {
            throw new ConvexError('GAME_ALREADY_EXISTS')
        }

        const now = Date.now()
        return await ctx.db.insert('games', {
            title,
            titleNormalized,
            releasePrecision: args.releasePrecision,
            ...releaseFields,
            coverImageUrl:
                args.coverImageUrl && args.coverImageUrl.trim().length > 0
                    ? args.coverImageUrl.trim()
                    : undefined,
            createdAt: now,
            updatedAt: now,
        })
    },
})

export const listAdminGames = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        await ensureAdmin(ctx)

        const limit = Math.min(Math.max(args.limit ?? 50, 1), 100)
        return await ctx.db.query('games').order('desc').take(limit)
    },
})

export const updateGame = mutation({
    args: {
        gameId: v.id('games'),
        title: v.string(),
        releasePrecision: releasePrecisionValidator,
        releaseDate: v.optional(v.string()),
        releaseYear: v.optional(v.number()),
        releaseQuarter: v.optional(v.number()),
        releaseMonth: v.optional(v.number()),
        releaseText: v.optional(v.string()),
        coverImageUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ensureAdmin(ctx)

        const existingGame = await ctx.db.get(args.gameId)
        if (!existingGame) {
            throw new ConvexError('GAME_NOT_FOUND')
        }

        const title = args.title.trim()
        const titleNormalized = normalizeGameTitle(title)
        if (titleNormalized.length === 0) {
            throw new ConvexError('TITLE_REQUIRED')
        }

        const releaseFields = buildReleaseFields(args)
        const duplicate = await findExistingGame(
            ctx,
            titleNormalized,
            args.releasePrecision,
            releaseFields,
        )

        if (duplicate && duplicate._id !== args.gameId) {
            throw new ConvexError('GAME_ALREADY_EXISTS')
        }

        await ctx.db.patch(args.gameId, {
            title,
            titleNormalized,
            releasePrecision: args.releasePrecision,
            releaseDate: undefined,
            releaseYear: undefined,
            releaseQuarter: undefined,
            releaseMonth: undefined,
            releaseText: undefined,
            releaseYearMonth: undefined,
            ...releaseFields,
            coverImageUrl:
                args.coverImageUrl && args.coverImageUrl.trim().length > 0
                    ? args.coverImageUrl.trim()
                    : undefined,
            updatedAt: Date.now(),
        })
    },
})

export const deleteGame = mutation({
    args: {
        gameId: v.id('games'),
    },
    handler: async (ctx, args) => {
        await ensureAdmin(ctx)

        const game = await ctx.db.get(args.gameId)
        if (!game) {
            throw new ConvexError('GAME_NOT_FOUND')
        }

        const [legacyEntry, userGame] = await Promise.all([
            ctx.db
                .query('libraryEntries')
                .withIndex('by_game', (q) => q.eq('gameId', args.gameId))
                .first(),
            ctx.db
                .query('userGames')
                .withIndex('by_game', (q) => q.eq('gameId', args.gameId))
                .first(),
        ])

        if (legacyEntry || userGame) {
            throw new ConvexError('GAME_IN_USE')
        }

        await ctx.db.delete(args.gameId)
    },
})

const parseCoverSourceUrl = (sourceUrl: string) => {
    const trimmed = sourceUrl.trim()
    if (trimmed.length === 0) {
        throw new ConvexError('COVER_URL_INVALID')
    }

    try {
        const parsed = new URL(trimmed)
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            throw new ConvexError('COVER_URL_INVALID')
        }
        return parsed
    } catch {
        throw new ConvexError('COVER_URL_INVALID')
    }
}

const parseContentLength = (value: string | null) => {
    if (!value) return null
    const parsed = Number(value)
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

export const uploadCoverFromUrl = action({
    args: {
        sourceUrl: v.string(),
    },
    handler: async (ctx, args) => {
        const adminAccess = await ctx.runQuery(internal.admin.getCurrentAdminAccess, {})
        if (!adminAccess.canManage) {
            throw new ConvexError('FORBIDDEN')
        }

        const sourceUrl = parseCoverSourceUrl(args.sourceUrl)
        let response: Response

        try {
            response = await fetch(sourceUrl)
        } catch {
            throw new ConvexError('COVER_FETCH_FAILED')
        }

        if (!response.ok) {
            throw new ConvexError('COVER_FETCH_FAILED')
        }

        const contentType = response.headers.get('content-type') ?? ''
        if (!contentType.startsWith('image/')) {
            throw new ConvexError('COVER_NOT_IMAGE')
        }

        const contentLength = parseContentLength(response.headers.get('content-length'))
        if (contentLength !== null && contentLength > MAX_COVER_IMAGE_SIZE_BYTES) {
            throw new ConvexError('COVER_TOO_LARGE')
        }

        const blob = await response.blob()
        if (blob.size > MAX_COVER_IMAGE_SIZE_BYTES) {
            throw new ConvexError('COVER_TOO_LARGE')
        }

        const storageId = await ctx.storage.store(blob)
        const storageUrl = await ctx.storage.getUrl(storageId)
        if (!storageUrl) {
            throw new ConvexError('COVER_UPLOAD_FAILED')
        }

        return storageUrl
    },
})

const escapeIgdbSearchText = (value: string) =>
    value.replaceAll('\\', ' ').replaceAll('"', ' ').trim().replace(/\s+/g, ' ')

const getIgdbAccessToken = async (credentials: {
    clientId: string
    clientSecret: string
}) => {
    if (
        igdbTokenCache &&
        igdbTokenCache.clientId === credentials.clientId &&
        igdbTokenCache.expiresAt > Date.now()
    ) {
        return igdbTokenCache.token
    }

    const body = new URLSearchParams({
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        grant_type: 'client_credentials',
    })

    const response = await fetch(IGDB_TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
    })

    if (!response.ok) {
        throw new ConvexError('IGDB_AUTH_FAILED')
    }

    const payload = (await response.json()) as {
        access_token?: unknown
        expires_in?: unknown
    }

    if (typeof payload.access_token !== 'string') {
        throw new ConvexError('IGDB_AUTH_FAILED')
    }

    const expiresIn =
        typeof payload.expires_in === 'number' && payload.expires_in > 0
            ? payload.expires_in
            : 3600

    igdbTokenCache = {
        clientId: credentials.clientId,
        token: payload.access_token,
        expiresAt: Date.now() + expiresIn * 1000 - 60_000,
    }

    return igdbTokenCache.token
}

const toIgdbCoverUrl = (imageId: string) =>
    `https://images.igdb.com/igdb/image/upload/t_cover_big/${imageId}.jpg`

const toIsoReleaseDate = (firstReleaseDate: number) => {
    const date = new Date(firstReleaseDate * 1000)
    if (Number.isNaN(date.getTime())) return null
    return date.toISOString().slice(0, 10)
}

export const searchIgdbGames = action({
    args: {
        searchText: v.string(),
    },
    handler: async (ctx, args) => {
        const credentials = await ctx.runQuery(
            internal.admin.getIgdbCredentialsForCurrentAdmin,
            {},
        )

        if (!credentials) {
            throw new ConvexError('IGDB_NOT_CONFIGURED')
        }

        const searchText = escapeIgdbSearchText(args.searchText)
        if (searchText.length < 2) {
            return []
        }

        const token = await getIgdbAccessToken(credentials)
        const query = [
            `search "${searchText}";`,
            'fields id,name,first_release_date,cover.image_id;',
            'limit 10;',
        ].join(' ')

        const response = await fetch(`${IGDB_API_BASE_URL}/games`, {
            method: 'POST',
            headers: {
                'Client-ID': credentials.clientId,
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'text/plain',
            },
            body: query,
        })

        if (!response.ok) {
            throw new ConvexError('IGDB_SEARCH_FAILED')
        }

        const payload = (await response.json()) as unknown
        if (!Array.isArray(payload)) {
            throw new ConvexError('IGDB_SEARCH_FAILED')
        }

        return (payload as IgdbGameSearchResult[]).flatMap((item) => {
            if (typeof item.id !== 'number' || typeof item.name !== 'string') {
                return []
            }

            const releaseDate =
                typeof item.first_release_date === 'number'
                    ? toIsoReleaseDate(item.first_release_date)
                    : null
            const coverImageUrl =
                typeof item.cover?.image_id === 'string'
                    ? toIgdbCoverUrl(item.cover.image_id)
                    : null

            return [
                {
                    igdbId: item.id,
                    title: item.name,
                    releaseDate: releaseDate ?? undefined,
                    coverImageUrl: coverImageUrl ?? undefined,
                },
            ]
        })
    },
})
