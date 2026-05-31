import {
    SignInButton,
    SignedIn,
    SignedOut,
    UserButton,
    useUser,
} from '@clerk/clerk-react'
import { useConvexAuth, useMutation, useQuery } from 'convex/react'
import { useEffect, useState } from 'react'
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

const AdminPanel = ({ enabled }: { enabled: boolean | undefined }) => {
    const panel = useQuery(api.admin.getAdminPanel, enabled ? {} : 'skip')
    const setUserRole = useMutation(api.admin.setUserRole)
    const saveIgdbCredentials = useMutation(api.admin.saveIgdbCredentials)
    const [clientId, setClientId] = useState('')
    const [clientSecret, setClientSecret] = useState('')
    const [isSavingIgdb, setIsSavingIgdb] = useState(false)

    useEffect(() => {
        if (!panel?.igdb) return
        setClientId(panel.igdb.clientId)
    }, [panel?.igdb])

    if (enabled === undefined) {
        return (
            <section className="mt-8 rounded-lg border border-zinc-800 bg-zinc-900/70 p-5">
                <h2 className="text-lg font-semibold text-white">Panel admina</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Sprawdzanie uprawnień...
                </p>
            </section>
        )
    }

    if (!enabled) {
        return (
            <section className="mt-8 rounded-lg border border-zinc-800 bg-zinc-900/70 p-5">
                <h2 className="text-lg font-semibold text-white">Panel admina</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Brak uprawnień administracyjnych dla tego konta.
                </p>
            </section>
        )
    }

    const handleSaveIgdb = async (event: React.FormEvent) => {
        event.preventDefault()
        setIsSavingIgdb(true)
        try {
            await saveIgdbCredentials({
                clientId,
                clientSecret: clientSecret.trim().length > 0 ? clientSecret : undefined,
            })
            setClientSecret('')
        } finally {
            setIsSavingIgdb(false)
        }
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

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/70">
                <div className="border-b border-zinc-800 px-4 py-3">
                    <h3 className="font-medium text-white">Użytkownicy</h3>
                </div>
                {panel ? (
                    <ul className="divide-y divide-zinc-800">
                        {panel.users.map((appUser) => (
                            <li
                                key={appUser._id}
                                className="grid gap-3 px-4 py-3 md:grid-cols-[minmax(0,1fr)_9rem]"
                            >
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-zinc-100">
                                        {appUser.email ?? appUser.name ?? appUser.subject}
                                    </p>
                                    <p className="mt-1 truncate text-xs text-zinc-500">
                                        {appUser.subject}
                                    </p>
                                </div>
                                <select
                                    value={appUser.role}
                                    onChange={(event) =>
                                        void setUserRole({
                                            appUserId: appUser._id,
                                            role: event.target.value as 'user' | 'admin',
                                        })
                                    }
                                    className="h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                                >
                                    <option value="user">user</option>
                                    <option value="admin">admin</option>
                                </select>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="px-4 py-5 text-sm text-zinc-400">
                        Ładowanie użytkowników...
                    </div>
                )}
            </div>

            <form
                onSubmit={(event) => void handleSaveIgdb(event)}
                className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4"
            >
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-medium text-white">Konfiguracja IGDB</h3>
                            <p className="mt-1 text-sm text-zinc-400">
                                Sekret jest zapisywany backendowo i nie wraca do
                                przeglądarki. Puste pole sekretu zostawia poprzedni sekret
                                bez zmian.
                            </p>
                        </div>
                        <label className="block">
                            <span className="text-sm text-zinc-300">Client ID</span>
                            <input
                                value={clientId}
                                onChange={(event) => setClientId(event.target.value)}
                                className="mt-1 h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-teal-300"
                                autoCapitalize="off"
                                autoCorrect="off"
                                spellCheck={false}
                            />
                        </label>
                        <label className="block">
                            <span className="text-sm text-zinc-300">Client Secret</span>
                            <input
                                value={clientSecret}
                                onChange={(event) => setClientSecret(event.target.value)}
                                type="password"
                                className="mt-1 h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-teal-300"
                                autoCapitalize="off"
                                autoCorrect="off"
                                spellCheck={false}
                                placeholder={
                                    panel?.igdb?.hasClientSecret
                                        ? 'Sekret jest zapisany'
                                        : 'Wymagany przy pierwszym zapisie'
                                }
                            />
                        </label>
                        <button
                            type="submit"
                            disabled={isSavingIgdb}
                            className="inline-flex h-10 items-center justify-center rounded-md bg-teal-300 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSavingIgdb ? 'Zapisywanie...' : 'Zapisz IGDB'}
                        </button>
                    </div>

                    <aside className="rounded-md border border-zinc-800 bg-zinc-950/70 p-4 text-sm leading-6 text-zinc-300">
                        <h4 className="font-medium text-zinc-100">
                            Jak wygenerować świeże dane IGDB
                        </h4>
                        <ol className="mt-2 list-decimal space-y-1 pl-4">
                            <li>Wejdź w Twitch Developer Console.</li>
                            <li>Zarejestruj aplikację albo otwórz istniejącą.</li>
                            <li>Skopiuj Client ID.</li>
                            <li>Wygeneruj nowy Client Secret i wklej go tutaj.</li>
                            <li>
                                IGDB używa Twitch OAuth client credentials, więc token
                                aplikacyjny generuje backend z Client ID i Secret.
                            </li>
                        </ol>
                        <div className="mt-3 flex flex-wrap gap-3">
                            <a
                                href="https://dev.twitch.tv/console/apps"
                                target="_blank"
                                rel="noreferrer"
                                className="text-teal-300 hover:text-teal-200"
                            >
                                Twitch Console
                            </a>
                            <a
                                href="https://api-docs.igdb.com/#getting-started"
                                target="_blank"
                                rel="noreferrer"
                                className="text-teal-300 hover:text-teal-200"
                            >
                                IGDB docs
                            </a>
                        </div>
                    </aside>
                </div>
            </form>
        </section>
    )
}

const CatalogPreview = () => {
    const { isAuthenticated, isLoading } = useConvexAuth()
    const { user } = useUser()
    const syncCurrentUser = useMutation(api.admin.syncCurrentUser)
    const catalog = useQuery(
        api.games.getCatalogPreview,
        isAuthenticated ? { limit: 10 } : 'skip',
    )
    const health = useQuery(api.games.getRewriteHealth, isAuthenticated ? {} : 'skip')
    const adminStatus = useQuery(api.admin.getAdminStatus, isAuthenticated ? {} : 'skip')

    useEffect(() => {
        if (!isAuthenticated) return
        void syncCurrentUser()
    }, [isAuthenticated, syncCurrentUser])

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

                <AdminPanel enabled={adminStatus?.canManage} />

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
