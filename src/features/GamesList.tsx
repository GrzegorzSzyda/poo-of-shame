import { usePaginatedQuery } from 'convex/react'
import { useMemo } from 'react'
import { api } from '../../convex/_generated/api'
import { Game } from './Game'

type Props = {
    authReady: boolean
    canManageGames: boolean | undefined
}

export const GamesList = ({ authReady, canManageGames }: Props) => {
    const {
        results: games,
        status: gamesStatus,
        loadMore: loadMoreGames,
    } = usePaginatedQuery(api.games.list, authReady ? {} : 'skip', {
        initialNumItems: 24,
    })
    const { results: libraryEntries } = usePaginatedQuery(
        api.library.listMyLibraryFiltered,
        authReady ? {} : 'skip',
        { initialNumItems: 100 },
    )
    const libraryEntriesByGameId = useMemo(
        () => new Map(libraryEntries.map((entry) => [entry.gameId, entry])),
        [libraryEntries],
    )

    return (
        <div>
            <ul>
                {games?.map((game) => (
                    <Game
                        key={game._id}
                        game={game}
                        canManageGames={canManageGames}
                        libraryEntry={libraryEntriesByGameId.get(game._id)}
                    />
                ))}
            </ul>
            {gamesStatus === 'CanLoadMore' ? (
                <button type="button" onClick={() => loadMoreGames(24)}>
                    Załaduj więcej gier
                </button>
            ) : null}
        </div>
    )
}
