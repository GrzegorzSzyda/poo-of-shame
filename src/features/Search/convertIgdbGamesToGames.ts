import type { IgdbGame } from '~/api/IgdbGame'
import type { Game } from '~/types/Game'

export const convertIgdbGamesToGames = (igdbGames: IgdbGame[]): Game[] =>
    igdbGames.map((game) => ({
        title: game.name,
        id: `${game.id}`,
        coverUrl: getCoverUrl(game.cover?.image_id),
        releaseDate: getReleaseDate(game.first_release_date),
    }))

const getCoverUrl = (imageId?: string) =>
    imageId
        ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${imageId}.webp`
        : undefined

const getReleaseDate = (date: number | undefined) =>
    date ? new Date(date * 1000).toLocaleDateString('pl-PL') : undefined
