import { usePaginatedQuery, useQuery } from 'convex/react'
import { useMemo } from 'react'
import { api } from '../../convex/_generated/api'
import { Game } from './Game'

type Props = {
    authReady: boolean
    canManageGames: boolean | undefined
}

export const GamesList = ({ authReady, canManageGames }: Props) => {
    const games = useQuery(api.games.listAll, authReady ? {} : 'skip')
    const { results: libraryEntries } = usePaginatedQuery(
        api.library.listMyLibraryFiltered,
        authReady ? {} : 'skip',
        { initialNumItems: 100 },
    )
    const libraryEntriesByGameId = useMemo(
        () => new Map(libraryEntries.map((entry) => [entry.gameId, entry])),
        [libraryEntries],
    )

    if (!games) {
        return <div className="text-text/70">Ładowanie listy gier...</div>
    }

    if (games.length === 0) {
        return (
            <div className="border-text/20 bg-bg/30 rounded-lg border p-6">
                <p className="text-text/80">Brak gier na liście.</p>
            </div>
        )
    }

    return (
        <section className="space-y-4">
            <div className="text-text/75 text-sm">Liczba gier: {games.length}</div>
            <ul className="space-y-3">
                {games?.map((game) => (
                    <Game
                        key={game._id}
                        game={game}
                        canManageGames={canManageGames}
                        libraryEntry={libraryEntriesByGameId.get(game._id)}
                    />
                ))}
            </ul>
        </section>
    )
}
