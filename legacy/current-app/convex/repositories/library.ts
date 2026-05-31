import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'

type LibraryEntryDoc = Doc<'libraryEntries'>
type PaginationOptions = { cursor: string | null; numItems: number }

type LibraryEntryWithSnapshot = Awaited<ReturnType<typeof withGameSnapshot>>[number]

export const getGameById = async (ctx: MutationCtx, gameId: Id<'games'>) => {
    return await ctx.db.get(gameId)
}

export const getLibraryEntryById = async (
    ctx: MutationCtx,
    entryId: Id<'libraryEntries'>,
) => {
    return await ctx.db.get(entryId)
}

export const getLibraryEntryByUserAndGame = async (
    ctx: MutationCtx,
    userId: string,
    gameId: Id<'games'>,
) => {
    return await ctx.db
        .query('libraryEntries')
        .withIndex('by_user_game', (q) => q.eq('userId', userId).eq('gameId', gameId))
        .unique()
}

export const insertLibraryEntry = async (
    ctx: MutationCtx,
    values: Omit<Doc<'libraryEntries'>, '_id' | '_creationTime'>,
) => {
    return await ctx.db.insert('libraryEntries', values)
}

export const patchLibraryEntry = async (
    ctx: MutationCtx,
    entryId: Id<'libraryEntries'>,
    values: Partial<Omit<Doc<'libraryEntries'>, '_id' | '_creationTime'>>,
) => {
    await ctx.db.patch(entryId, values)
}

export const deleteLibraryEntry = async (
    ctx: MutationCtx,
    entryId: Id<'libraryEntries'>,
) => {
    await ctx.db.delete(entryId)
}

const withGameSnapshot = async (ctx: QueryCtx, entries: Array<LibraryEntryDoc>) =>
    Promise.all(
        entries.map(async (entry) => {
            const snapshotReleaseDate =
                entry.gameReleaseDate ??
                (entry.gameReleaseYear !== undefined
                    ? `${entry.gameReleaseYear}-01-01`
                    : undefined)

            if (entry.gameTitle !== undefined && snapshotReleaseDate !== undefined) {
                return {
                    ...entry,
                    game: {
                        title: entry.gameTitle,
                        releaseDate: snapshotReleaseDate,
                        coverImageUrl: entry.gameCoverImageUrl,
                    },
                }
            }

            const game = await ctx.db.get(entry.gameId)
            if (!game) {
                return {
                    ...entry,
                    game: null,
                }
            }

            return {
                ...entry,
                game: {
                    title: game.title,
                    releaseDate:
                        game.releaseDate ??
                        (game.releaseYear !== undefined
                            ? `${game.releaseYear}-01-01`
                            : ''),
                    coverImageUrl: game.coverImageUrl,
                },
            }
        }),
    )

const listLibraryEntriesPageByUser = async (
    ctx: QueryCtx,
    userId: string,
    paginationOpts: PaginationOptions,
) => {
    return await ctx.db
        .query('libraryEntries')
        .withIndex('by_user', (q) => q.eq('userId', userId))
        .order('desc')
        .paginate(paginationOpts)
}

export const listLibraryPageWithGameSnapshotByUser = async (
    ctx: QueryCtx,
    userId: string,
    paginationOpts: PaginationOptions,
) => {
    const result = await listLibraryEntriesPageByUser(ctx, userId, paginationOpts)
    const page = await withGameSnapshot(ctx, result.page)
    return { ...result, page }
}

const normalizedSearchTerm = (value?: string) => value?.trim().toLowerCase() ?? ''

const filterAndSortEntries = (
    entries: LibraryEntryWithSnapshot[],
    filters: {
        progressStatuses?: Array<Doc<'libraryEntries'>['progressStatus']>
        wantsToPlayMin: number
        platforms?: Array<Doc<'libraryEntries'>['platforms'][number]>
        includeNoPlatforms?: boolean
        search?: string
        sortBy?: 'default' | 'wants_desc' | 'rating_desc'
    },
) => {
    const searchTerm = normalizedSearchTerm(filters.search)

    const filtered = entries.filter((entry) => {
        if (
            filters.progressStatuses &&
            filters.progressStatuses.length > 0 &&
            !filters.progressStatuses.includes(entry.progressStatus)
        ) {
            return false
        }

        if (filters.wantsToPlayMin > 0 && entry.wantsToPlay < filters.wantsToPlayMin) {
            return false
        }

        const hasPlatformFilter =
            Boolean(filters.includeNoPlatforms) ||
            Boolean(filters.platforms && filters.platforms.length > 0)
        if (hasPlatformFilter) {
            const matchesSelectedPlatform =
                filters.platforms?.some((platform) =>
                    entry.platforms.includes(platform),
                ) ?? false
            const matchesNoPlatforms =
                Boolean(filters.includeNoPlatforms) && entry.platforms.length === 0
            if (!matchesSelectedPlatform && !matchesNoPlatforms) {
                return false
            }
        }

        if (searchTerm.length > 0) {
            const title = entry.game?.title.toLowerCase() ?? ''
            const note = entry.note?.toLowerCase() ?? ''
            if (!title.includes(searchTerm) && !note.includes(searchTerm)) {
                return false
            }
        }

        return true
    })

    if (filters.sortBy === 'wants_desc') {
        return [...filtered].sort((left, right) => {
            if (right.wantsToPlay !== left.wantsToPlay) {
                return right.wantsToPlay - left.wantsToPlay
            }
            return right.updatedAt - left.updatedAt
        })
    }

    if (filters.sortBy === 'rating_desc') {
        return [...filtered].sort((left, right) => {
            if (right.rating !== left.rating) {
                return right.rating - left.rating
            }
            return right.updatedAt - left.updatedAt
        })
    }

    return filtered
}

export const listFilteredLibraryPageWithGameSnapshotByUser = async (
    ctx: QueryCtx,
    userId: string,
    filters: {
        progressStatuses?: Array<Doc<'libraryEntries'>['progressStatus']>
        wantsToPlayMin: number
        platforms?: Array<Doc<'libraryEntries'>['platforms'][number]>
        includeNoPlatforms?: boolean
        search?: string
        sortBy?: 'default' | 'wants_desc' | 'rating_desc'
    },
    paginationOpts: PaginationOptions,
) => {
    let result

    if (filters.sortBy === 'wants_desc') {
        result = await ctx.db
            .query('libraryEntries')
            .withIndex('by_user_wantsToPlay', (q) => q.eq('userId', userId))
            .order('desc')
            .paginate(paginationOpts)
    } else if (filters.progressStatuses && filters.progressStatuses.length === 1) {
        result = await ctx.db
            .query('libraryEntries')
            .withIndex('by_user_progress', (q) =>
                q
                    .eq('userId', userId)
                    .eq('progressStatus', filters.progressStatuses![0]!),
            )
            .order('desc')
            .paginate(paginationOpts)
    } else if (filters.wantsToPlayMin > 0) {
        result = await ctx.db
            .query('libraryEntries')
            .withIndex('by_user_wantsToPlay', (q) =>
                q.eq('userId', userId).gte('wantsToPlay', filters.wantsToPlayMin),
            )
            .order('desc')
            .paginate(paginationOpts)
    } else {
        result = await listLibraryEntriesPageByUser(ctx, userId, paginationOpts)
    }

    const pageWithSnapshot = await withGameSnapshot(ctx, result.page)
    const page = filterAndSortEntries(pageWithSnapshot, filters)

    return { ...result, page }
}
