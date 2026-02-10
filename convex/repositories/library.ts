import type { Doc, Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'

type LibraryEntryDoc = Doc<'libraryEntries'>
type PaginationOptions = { cursor: string | null; numItems: number }

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
            if (entry.gameTitle !== undefined && entry.gameReleaseYear !== undefined) {
                return {
                    ...entry,
                    game: {
                        title: entry.gameTitle,
                        releaseYear: entry.gameReleaseYear,
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
                    releaseYear: game.releaseYear,
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

export const listFilteredLibraryPageWithGameSnapshotByUser = async (
    ctx: QueryCtx,
    userId: string,
    filters: {
        progressStatus?: Doc<'libraryEntries'>['progressStatus']
        wantsToPlayMin: number
        platform?: Doc<'libraryEntries'>['platforms'][number]
    },
    paginationOpts: PaginationOptions,
) => {
    let result

    if (filters.progressStatus) {
        result = await ctx.db
            .query('libraryEntries')
            .withIndex('by_user_progress', (q) =>
                q.eq('userId', userId).eq('progressStatus', filters.progressStatus!),
            )
            .paginate(paginationOpts)
    } else if (filters.wantsToPlayMin > 0) {
        result = await ctx.db
            .query('libraryEntries')
            .withIndex('by_user_wantsToPlay', (q) =>
                q.eq('userId', userId).gte('wantsToPlay', filters.wantsToPlayMin),
            )
            .paginate(paginationOpts)
    } else {
        result = await listLibraryEntriesPageByUser(ctx, userId, paginationOpts)
    }

    const filteredPage = result.page.filter((entry) => {
        if (filters.wantsToPlayMin > 0 && entry.wantsToPlay < filters.wantsToPlayMin) {
            return false
        }
        if (filters.platform && !entry.platforms.includes(filters.platform)) {
            return false
        }
        return true
    })

    const page = await withGameSnapshot(ctx, filteredPage)
    return { ...result, page }
}
