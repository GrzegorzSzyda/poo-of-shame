import { ArrowRightIcon, ShieldCheckIcon } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
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
        <section className="space-y-5">
            <H1 startIcon={ShieldCheckIcon}>Cheaty</H1>
            <p className="text-text/80">Wybierz narzędzie administracyjne.</p>
            <div className="flex max-w-md flex-col gap-2">
                <Link
                    to="/cheats/data-enrichment"
                    className="border-text/20 bg-bg/35 hover:bg-text/10 inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm text-teal-200 transition-colors"
                >
                    Wzbogacanie danych z IGDB
                    <ArrowRightIcon className="h-4 w-4" weight="bold" />
                </Link>
                <Link
                    to="/cheats/bulk-import"
                    className="border-text/20 bg-bg/35 hover:bg-text/10 inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm text-teal-200 transition-colors"
                >
                    Import wzbogaconych list
                    <ArrowRightIcon className="h-4 w-4" weight="bold" />
                </Link>
            </div>
        </section>
    )
}
