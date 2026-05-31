import { UserButton } from '@clerk/clerk-react'
import { useQuery } from 'convex/react'
import type { ReactNode } from 'react'
import { api } from '../../convex/_generated/api'

type Route = 'home' | 'admin'

const getRoute = (): Route => {
    if (window.location.pathname === '/admin') return 'admin'
    return 'home'
}

const navigate = (href: string) => {
    window.history.pushState({}, '', href)
    window.dispatchEvent(new PopStateEvent('popstate'))
}

const NavLink = ({
    active,
    children,
    href,
}: {
    active: boolean
    children: ReactNode
    href: string
}) => (
    <button
        type="button"
        onClick={() => navigate(href)}
        className={`h-9 rounded-md px-3 text-sm font-medium transition ${
            active
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
        }`}
    >
        {children}
    </button>
)

export const useAdminStatus = () => {
    return useQuery(api.admin.getAdminStatus, {})
}

export const AppShell = ({ route, children }: { route: Route; children: ReactNode }) => {
    const adminStatus = useAdminStatus()

    return (
        <main className="min-h-screen bg-zinc-950 px-6 py-8 text-zinc-100">
            <section className="mx-auto max-w-5xl">
                <header className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-5">
                    <div>
                        <p className="text-sm font-medium tracking-[0.18em] text-teal-300 uppercase">
                            Poo of Shame
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold text-white">
                            {route === 'admin' ? 'Ustawienia admina' : 'Rewrite'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <nav className="flex items-center gap-1">
                            <NavLink active={route === 'home'} href="/">
                                Start
                            </NavLink>
                            {adminStatus?.canManage ? (
                                <NavLink active={route === 'admin'} href="/admin">
                                    Admin
                                </NavLink>
                            ) : null}
                        </nav>
                        <UserButton />
                    </div>
                </header>
                {children}
            </section>
        </main>
    )
}

export const getInitialRoute = getRoute
