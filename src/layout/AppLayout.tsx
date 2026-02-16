import { Link } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import type { ReactNode } from 'react'
import { api } from '../../convex/_generated/api'
import { Logo } from './Logo'
import { UserMenu } from './UserMenu'

type AppLayoutProps = {
    children: ReactNode
}

export const AppLayout = ({ children }: AppLayoutProps) => {
    const canManageGames = useQuery(api.games.canManage)

    return (
        <div className="flex min-h-screen">
            <aside className="flex min-h-screen shrink-0 flex-col bg-[linear-gradient(to_top,rgba(182,160,206,0.1)_0%,rgba(182,160,206,0.03)_100%)]">
                <Logo />
                <nav className="mt-8 flex flex-col gap-2 px-4">
                    <Link
                        to="/library"
                        className="group flex h-10 items-center gap-3 px-3 py-2 text-sm font-medium text-teal-300 transition-colors duration-300 hover:text-teal-100"
                        activeProps={{
                            className:
                                'group flex h-10 items-center gap-3 px-3 py-2 text-sm font-medium text-teal-100 [&>span]:opacity-100',
                        }}
                    >
                        <span className="h-6 w-0.5 bg-current opacity-0 transition-opacity duration-300" />
                        Moja kupka
                    </Link>
                    <Link
                        to="/games"
                        className="group flex h-10 items-center gap-3 px-3 py-2 text-sm font-medium text-teal-300 transition-colors duration-300 hover:text-teal-100"
                        activeProps={{
                            className:
                                'group flex h-10 items-center gap-3 px-3 py-2 text-sm font-medium text-teal-100 [&>span]:opacity-100',
                        }}
                    >
                        <span className="h-6 w-0.5 bg-current opacity-0 transition-opacity duration-300" />
                        Gry
                    </Link>
                    {canManageGames ? (
                        <Link
                            to="/cheats"
                            className="group flex h-10 items-center gap-3 px-3 py-2 text-sm font-medium text-teal-300 transition-colors duration-300 hover:text-teal-100"
                            activeProps={{
                                className:
                                    'group flex h-10 items-center gap-3 px-3 py-2 text-sm font-medium text-teal-100 [&>span]:opacity-100',
                            }}
                        >
                            <span className="h-6 w-0.5 bg-current opacity-0 transition-opacity duration-300" />
                            Cheaty
                        </Link>
                    ) : null}
                </nav>
                <div className="mt-auto flex justify-center p-4">
                    <UserMenu />
                </div>
            </aside>
            <main className="min-h-screen flex-1 p-8">{children}</main>
        </div>
    )
}
