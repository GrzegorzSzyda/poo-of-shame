import { useAuth } from '@clerk/clerk-react'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Game } from './Game'

export const GamesList = () => {
    const { isSignedIn } = useAuth()
    const games = useQuery(api.games.list)
    const libraryEntries = useQuery(
        api.library.listMyLibraryFiltered,
        isSignedIn ? {} : 'skip',
    )

    return (
        <div>
            <ul>
                {games?.map((game) => (
                    <Game
                        key={game._id}
                        game={game}
                        libraryEntry={libraryEntries?.find(
                            (entry) => entry.gameId === game._id,
                        )}
                    />
                ))}
            </ul>
        </div>
    )
}
