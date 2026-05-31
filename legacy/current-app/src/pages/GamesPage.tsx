import { ListBulletsIcon, PlusIcon } from '@phosphor-icons/react'
import { useQuery } from 'convex/react'
import { useConvexAuth } from 'convex/react'
import { useState } from 'react'
import { Button } from '~/components/Button'
import { Drawer } from '~/components/Drawer'
import { H1 } from '~/components/H1'
import { AddGameForm } from '~/features/AddGameForm'
import { GamesList } from '~/features/GamesList'
import { api } from '../../convex/_generated/api'

export const GamesPage = () => {
    const { isAuthenticated } = useConvexAuth()
    const canManageGames = useQuery(api.games.canManage, isAuthenticated ? {} : 'skip')
    const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)

    return (
        <>
            <div className="mb-6 grid grid-cols-[max-content_minmax(0,1fr)] items-start gap-12">
                <H1 startIcon={ListBulletsIcon}>Gry</H1>
                {canManageGames ? (
                    <div className="justify-self-end">
                        <Button
                            type="button"
                            startIcon={PlusIcon}
                            startIconWeight="bold"
                            onClick={() => setIsAddDrawerOpen(true)}
                        >
                            Dodaj grę
                        </Button>
                    </div>
                ) : null}
            </div>
            <GamesList canManageGames={canManageGames} authReady={isAuthenticated} />
            <Drawer
                isOpen={isAddDrawerOpen}
                onClose={() => setIsAddDrawerOpen(false)}
                title="Dodaj grę"
                titleStartIcon={PlusIcon}
                titleStartIconWeight="bold"
            >
                <AddGameForm
                    canManageGames={canManageGames}
                    onDone={() => setIsAddDrawerOpen(false)}
                />
            </Drawer>
        </>
    )
}
