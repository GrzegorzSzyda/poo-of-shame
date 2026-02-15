import { useQuery } from 'convex/react'
import { useConvexAuth } from 'convex/react'
import { AddGameForm } from '~/features/AddGameForm'
import { GamesList } from '~/features/GamesList'
import { api } from '../../convex/_generated/api'

export const GamesPage = () => {
    const { isAuthenticated } = useConvexAuth()
    const canManageGames = useQuery(api.games.canManage, isAuthenticated ? {} : 'skip')

    return (
        <>
            <AddGameForm canManageGames={canManageGames} />
            <GamesList canManageGames={canManageGames} authReady={isAuthenticated} />
        </>
    )
}
