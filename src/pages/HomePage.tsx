import { useUser } from '@clerk/clerk-react'
import { useConvexAuth, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

export const HomePage = () => {
    const { isAuthenticated, isLoading } = useConvexAuth()
    const { user } = useUser()
    const catalog = useQuery(
        api.games.getCatalogPreview,
        isAuthenticated ? { limit: 10 } : 'skip',
    )
    const health = useQuery(api.games.getRewriteHealth, isAuthenticated ? {} : 'skip')

    return (
        <>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4">
                    <p className="text-sm text-zinc-400">Użytkownik</p>
                    <p className="mt-2 truncate font-medium text-zinc-100">
                        {user?.primaryEmailAddress?.emailAddress ?? user?.id}
                    </p>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4">
                    <p className="text-sm text-zinc-400">Auth</p>
                    <p className="mt-2 font-medium text-teal-200">
                        {isLoading ? 'Sprawdzanie...' : 'Zalogowano'}
                    </p>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4">
                    <p className="text-sm text-zinc-400">Preview katalogu</p>
                    <p className="mt-2 font-medium text-zinc-100">
                        {catalog ? `${catalog.games.length} gier` : 'Ładowanie...'}
                    </p>
                </div>
            </div>

            <section className="mt-8">
                <h2 className="text-lg font-semibold text-white">Schema V1</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-4">
                    {(
                        [
                            ['games', 'Katalog'],
                            ['userGames', 'Kupka'],
                            ['gameRuns', 'Runy'],
                            ['gameAccess', 'Dostęp'],
                        ] as const
                    ).map(([key, label]) => (
                        <div
                            key={key}
                            className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4"
                        >
                            <p className="text-sm text-zinc-400">{label}</p>
                            <p className="mt-2 font-medium text-zinc-100">
                                {health ? health.tables[key] : 'Ładowanie...'}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mt-8">
                <h2 className="text-lg font-semibold text-white">
                    Ostatnie gry z katalogu
                </h2>
                <div className="mt-4 overflow-hidden rounded-lg border border-zinc-800">
                    {catalog ? (
                        <ul className="divide-y divide-zinc-800">
                            {catalog.games.map((game) => (
                                <li
                                    key={game._id}
                                    className="grid grid-cols-[minmax(0,1fr)_9rem] gap-4 bg-zinc-900/50 px-4 py-3"
                                >
                                    <span className="truncate text-zinc-100">
                                        {game.title}
                                    </span>
                                    <span className="text-right text-sm text-zinc-400">
                                        {game.releaseDate ??
                                            game.releaseYear ??
                                            'brak daty'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="bg-zinc-900/50 px-4 py-6 text-sm text-zinc-400">
                            Ładowanie katalogu...
                        </div>
                    )}
                </div>
            </section>
        </>
    )
}
