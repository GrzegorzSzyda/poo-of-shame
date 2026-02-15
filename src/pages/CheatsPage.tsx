import { ShieldCheckIcon } from '@phosphor-icons/react'
import { useConvexAuth, useQuery } from 'convex/react'
import { H1 } from '~/components/H1'
import { api } from '../../convex/_generated/api'
import { ErrorView } from '../layout/ErrorView'

export const CheatsPage = () => {
    const { isAuthenticated } = useConvexAuth()
    const canManageGames = useQuery(api.games.canManage, isAuthenticated ? {} : 'skip')

    if (canManageGames === undefined) {
        return <div className="text-text/70">Ładowanie cheatów...</div>
    }

    if (!canManageGames) {
        return (
            <ErrorView
                title="403"
                message="Ta sekcja jest dostępna tylko dla administratorów."
            />
        )
    }

    return (
        <section className="space-y-4">
            <H1 startIcon={ShieldCheckIcon}>Cheaty</H1>
            <p className="text-text/80">
                Sekcja administracyjna pod przyszłe materiały i narzędzia.
            </p>
        </section>
    )
}
