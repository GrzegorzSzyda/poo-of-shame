import { SignedIn, SignedOut } from '@clerk/clerk-react'
import { useQuery } from 'convex/react'
import { useConvexAuth } from 'convex/react'
import { AddGameForm } from '~/features/AddGameForm'
import { GamesList } from '~/features/GamesList'
import { LibraryPanel } from '~/features/LibraryPanel'
import { api } from '../../convex/_generated/api'

export const HomePage = () => {
    const { isAuthenticated } = useConvexAuth()
    const canManageGames = useQuery(api.games.canManage, isAuthenticated ? {} : 'skip')

    return (
        <div>
            <SignedIn>
                <AddGameForm canManageGames={canManageGames} />
                <GamesList canManageGames={canManageGames} authReady={isAuthenticated} />
                <LibraryPanel authReady={isAuthenticated} />
            </SignedIn>
            <SignedOut>
                <div className="mt-8 border-2 p-4">
                    Zaloguj się, aby zobaczyć gry i zarządzać biblioteką.
                </div>
            </SignedOut>
        </div>
    )
}
