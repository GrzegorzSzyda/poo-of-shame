import type { Id } from '../_generated/dataModel'
import type { MutationCtx, QueryCtx } from '../_generated/server'

export const listGamesPage = async (
    ctx: QueryCtx,
    paginationOpts: {
        cursor: string | null
        numItems: number
    },
) => {
    return await ctx.db.query('games').paginate(paginationOpts)
}

export const findGameByTitleYear = async (
    ctx: MutationCtx,
    titleNormalized: string,
    releaseYear: number,
) => {
    return await ctx.db
        .query('games')
        .withIndex('by_titleYear', (q) =>
            q.eq('titleNormalized', titleNormalized).eq('releaseYear', releaseYear),
        )
        .unique()
}

export const createGame = async (
    ctx: MutationCtx,
    values: {
        title: string
        titleNormalized: string
        releaseYear: number
        coverImageUrl?: string
    },
) => {
    return await ctx.db.insert('games', values)
}

export const getGameById = async (ctx: MutationCtx, gameId: Id<'games'>) => {
    return await ctx.db.get(gameId)
}

export const updateGame = async (
    ctx: MutationCtx,
    gameId: Id<'games'>,
    values: {
        title: string
        titleNormalized: string
        releaseYear: number
        coverImageUrl?: string
    },
) => {
    await ctx.db.patch(gameId, values)
}

export const listLibraryEntriesByGameId = async (
    ctx: MutationCtx,
    gameId: Id<'games'>,
) => {
    return await ctx.db
        .query('libraryEntries')
        .withIndex('by_game', (q) => q.eq('gameId', gameId))
        .collect()
}

export const syncLibrarySnapshotsForGame = async (
    ctx: MutationCtx,
    gameId: Id<'games'>,
    values: {
        title: string
        releaseYear: number
        coverImageUrl?: string
    },
) => {
    const linkedEntries = await listLibraryEntriesByGameId(ctx, gameId)

    await Promise.all(
        linkedEntries.map((entry) =>
            ctx.db.patch(entry._id, {
                gameTitle: values.title,
                gameReleaseYear: values.releaseYear,
                gameCoverImageUrl: values.coverImageUrl,
            }),
        ),
    )
}

export const deleteGameWithLinkedLibraryEntries = async (
    ctx: MutationCtx,
    gameId: Id<'games'>,
) => {
    const linkedEntries = await listLibraryEntriesByGameId(ctx, gameId)
    await Promise.all(linkedEntries.map((entry) => ctx.db.delete(entry._id)))
    await ctx.db.delete(gameId)
}
