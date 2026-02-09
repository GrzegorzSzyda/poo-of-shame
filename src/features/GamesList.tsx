import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { Game } from './Game'

export const GamesList = () => {
    const games = useQuery(api.games.list)

    return (
        <div>
            <ul>
                {games?.map((game) => (
                    <Game key={game._id} game={game} />
                ))}
            </ul>
        </div>
    )
}
