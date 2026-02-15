import { PlusIcon } from '@phosphor-icons/react'
import { useQuery } from 'convex/react'
import { useConvexAuth } from 'convex/react'
import { useState } from 'react'
import { Button } from '~/components/Button'
import { Drawer } from '~/components/Drawer'
import { AddGameForm } from '~/features/AddGameForm'
import { GamesList } from '~/features/GamesList'
import { api } from '../../convex/_generated/api'

export const GamesPage = () => {
    const { isAuthenticated } = useConvexAuth()
    const canManageGames = useQuery(api.games.canManage, isAuthenticated ? {} : 'skip')
    const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)

    return (
        <>
            {canManageGames ? (
                <div className="mb-6">
                    <Button
                        type="button"
                        startIcon={PlusIcon}
                        onClick={() => setIsAddDrawerOpen(true)}
                    >
                        Dodaj grę
                    </Button>
                </div>
            ) : null}
            <GamesList canManageGames={canManageGames} authReady={isAuthenticated} />
            <Drawer
                isOpen={isAddDrawerOpen}
                onClose={() => setIsAddDrawerOpen(false)}
                title="Dodaj grę"
                titleStartIcon={PlusIcon}
            >
                <AddGameForm
                    canManageGames={canManageGames}
                    onDone={() => setIsAddDrawerOpen(false)}
                />
            </Drawer>
        </>
    )
}
