import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { AddGameForm } from '../features/admin/AddGameForm'
import { IgdbSettingsForm } from '../features/admin/IgdbSettingsForm'
import { UserRolesPanel } from '../features/admin/UserRolesPanel'

export const AdminPage = () => {
    const adminStatus = useQuery(api.admin.getAdminStatus, {})
    const panel = useQuery(api.admin.getAdminPanel, adminStatus?.canManage ? {} : 'skip')

    if (adminStatus === undefined) {
        return (
            <section className="mt-8 rounded-lg border border-zinc-800 bg-zinc-900/70 p-5">
                <h2 className="text-lg font-semibold text-white">Panel admina</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Sprawdzanie uprawnień...
                </p>
            </section>
        )
    }

    if (!adminStatus.canManage) {
        return (
            <section className="mt-8 rounded-lg border border-zinc-800 bg-zinc-900/70 p-5">
                <h2 className="text-lg font-semibold text-white">Panel admina</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Brak uprawnień administracyjnych dla tego konta.
                </p>
            </section>
        )
    }

    return (
        <section className="mt-8 space-y-5">
            <div>
                <h2 className="text-lg font-semibold text-white">Panel admina</h2>
                <p className="mt-1 text-sm text-zinc-400">
                    Minimalny panel do ról i konfiguracji IGDB. Pełne role nadal wymagają
                    backendowego sprawdzenia w mutacjach.
                </p>
            </div>
            <AddGameForm />
            <UserRolesPanel users={panel?.users} />
            <IgdbSettingsForm igdb={panel?.igdb} />
        </section>
    )
}
