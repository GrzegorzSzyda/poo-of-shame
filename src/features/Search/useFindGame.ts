import type { IgdbGame } from '~/api/IgdbGame'
import type { Game } from '~/types/Game'
import { useApiIgdb } from '../../api/store/useApiIgdb'
import { convertIgdbGamesToGames } from './convertIgdbGamesToGames'

export const useFindGame = (searchText: string): Game[] => {
    const safeSearchText = searchText.replace(/"/g, '\\"')
    if (safeSearchText.length < 3) return []
    const apicalypse = [
        `search "${safeSearchText}";`,
        'fields name,first_release_date,cover.image_id;',
        'limit 12;',
    ].join(' ')
    const igdbGames = useApiIgdb<IgdbGame[]>('games', apicalypse)
    const games: Game[] = convertIgdbGamesToGames(igdbGames)

    return games
}
