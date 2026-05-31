import {
    SignInButton,
    SignedIn,
    SignedOut,
    UserButton,
    useUser,
} from '@clerk/clerk-react'
import { useConvexAuth, useQuery } from 'convex/react'
import { api } from '../convex/_generated/api'

const SignedOutView = () => (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-zinc-100">
        <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl flex-col justify-center">
            <p className="mb-3 text-sm font-medium tracking-[0.18em] text-teal-300 uppercase">
                Poo of Shame
            </p>
            <h1 className="text-4xl font-semibold tracking-normal text-white sm:text-5xl">
                Biblioteka wraca od fundamentów.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-300">
                Na razie dostęp jest za logowaniem, bo pierwszy krok rewrite'u sprawdza
                połączenie Clerka z istniejącą bazą Convexa.
            </p>
            <div className="mt-8">
                <SignInButton mode="modal">
                    <button className="inline-flex h-11 items-center justify-center rounded-md bg-teal-300 px-5 text-sm font-semibold text-zinc-950 transition hover:bg-teal-200">
                        Zaloguj się
                    </button>
                </SignInButton>
            </div>
        </section>
    </main>
)

const CatalogPreview = () => {
    const { isAuthenticated, isLoading } = useConvexAuth()
    const { user } = useUser()
    const catalog = useQuery(
        api.games.getCatalogPreview,
        isAuthenticated ? { limit: 10 } : 'skip',
    )
    const health = useQuery(api.games.getRewriteHealth, isAuthenticated ? {} : 'skip')

    return (
        <main className="min-h-screen bg-zinc-950 px-6 py-8 text-zinc-100">
            <section className="mx-auto max-w-5xl">
                <header className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-5">
                    <div>
                        <p className="text-sm font-medium tracking-[0.18em] text-teal-300 uppercase">
                            Poo of Shame
                        </p>
                        <h1 className="mt-2 text-3xl font-semibold text-white">
                            Połączenie z Convexem
                        </h1>
                    </div>
                    <UserButton />
                </header>

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
            </section>
        </main>
    )
}

export const App = () => {
    return (
        <>
            <SignedOut>
                <SignedOutView />
            </SignedOut>
            <SignedIn>
                <CatalogPreview />
            </SignedIn>
        </>
    )
}
