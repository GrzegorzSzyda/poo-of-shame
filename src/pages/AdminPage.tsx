import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { GamesAdminPanel } from '../features/admin/GamesAdminPanel'
import { IgdbSettingsForm } from '../features/admin/IgdbSettingsForm'
import { LibraryMigrationPanel } from '../features/admin/LibraryMigrationPanel'
import { UserRolesPanel } from '../features/admin/UserRolesPanel'
import { type AdminRoute, navigate } from '../routing'

const adminTabs: Array<{ route: AdminRoute; label: string; href: string }> = [
    { route: 'games', label: 'Gry', href: '/admin/games' },
    { route: 'users', label: 'Role', href: '/admin/users' },
    { route: 'integrations', label: 'Integracje', href: '/admin/integrations' },
    { route: 'migration', label: 'Migracja', href: '/admin/migration' },
]

const AdminTab = ({
    active,
    href,
    label,
}: {
    active: boolean
    href: string
    label: string
}) => (
    <button
        type="button"
        onClick={() => navigate(href)}
        className={`h-9 rounded-md px-3 text-sm font-medium transition ${
            active
                ? 'bg-teal-300 text-zinc-950'
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
        }`}
    >
        {label}
    </button>
)

export const AdminPage = ({ route }: { route: AdminRoute }) => {
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
                    Zarządzanie katalogiem, rolami i integracjami. Backend nadal
                    weryfikuje uprawnienia w każdej mutacji.
                </p>
            </div>
            <nav className="flex flex-wrap gap-2">
                {adminTabs.map((tab) => (
                    <AdminTab
                        key={tab.route}
                        active={route === tab.route}
                        href={tab.href}
                        label={tab.label}
                    />
                ))}
            </nav>
            {route === 'games' ? <GamesAdminPanel igdb={panel?.igdb} /> : null}
            {route === 'users' ? <UserRolesPanel users={panel?.users} /> : null}
            {route === 'integrations' ? <IgdbSettingsForm igdb={panel?.igdb} /> : null}
            {route === 'migration' ? <LibraryMigrationPanel /> : null}
        </section>
    )
}
