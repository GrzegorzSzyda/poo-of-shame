import { usePaginatedQuery } from 'convex/react'
import { useEffect, useMemo } from 'react'
import { Button } from '~/components/Button'
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
        initialNumItems: 50,
    })
    const {
        results: libraryEntries,
        status: libraryEntriesStatus,
        loadMore,
    } = usePaginatedQuery(api.library.listMyLibraryFiltered, authReady ? {} : 'skip', {
        initialNumItems: 100,
    })

    useEffect(() => {
        if (libraryEntriesStatus === 'CanLoadMore') {
            loadMore(100)
        }
    }, [libraryEntriesStatus, loadMore])

    const isLibraryIndexReady = libraryEntriesStatus === 'Exhausted'
    const libraryEntriesByGameId = useMemo(
        () => new Map(libraryEntries.map((entry) => [entry.gameId, entry])),
        [libraryEntries],
    )

    if (gamesStatus === 'LoadingFirstPage') {
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
                {games.map((game) => (
                    <Game
                        key={game._id}
                        game={game}
                        canManageGames={canManageGames}
                        isLibraryIndexReady={isLibraryIndexReady}
                        libraryEntry={libraryEntriesByGameId.get(game._id)}
                    />
                ))}
            </ul>
            {gamesStatus === 'CanLoadMore' ? (
                <Button
                    type="button"
                    className="mt-1"
                    variant="ghost"
                    onClick={() => loadMoreGames(50)}
                >
                    Załaduj więcej gier
                </Button>
            ) : null}
        </section>
    )
}
