import { useAction } from 'convex/react'
import { useEffect, useState } from 'react'
import { api } from '../../../convex/_generated/api'
import { navigate } from '../../routing'

type IgdbGameSuggestion = {
    igdbId: number
    title: string
    releaseDate?: string
    coverImageUrl?: string
}

const MIN_SEARCH_LENGTH = 2

const formatReleaseDate = (releaseDate?: string) => releaseDate ?? 'brak daty'

const getIgdbSearchErrorMessage = (error: unknown) => {
    const message = error instanceof Error ? error.message : ''

    if (message.includes('IGDB_NOT_CONFIGURED')) {
        return 'Najpierw zapisz konfigurację IGDB w integracjach.'
    }

    if (message.includes('IGDB_AUTH_FAILED')) {
        return 'Nie udało się zalogować do IGDB. Sprawdź client ID i secret.'
    }

    if (message.includes('IGDB_SEARCH_FAILED')) {
        return 'Nie udało się pobrać sugestii z IGDB.'
    }

    return error instanceof Error
        ? error.message
        : 'Nie udało się pobrać sugestii z IGDB.'
}

export const IgdbGameSuggestions = ({
    isConfigured,
    onPick,
}: {
    isConfigured: boolean
    onPick: (game: IgdbGameSuggestion) => void
}) => {
    const searchIgdbGames = useAction(api.games.searchIgdbGames)
    const [searchText, setSearchText] = useState('')
    const [results, setResults] = useState<IgdbGameSuggestion[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const trimmedSearchText = searchText.trim()

        if (!isConfigured) {
            setResults([])
            setError(null)
            setIsLoading(false)
            return
        }

        if (trimmedSearchText.length < MIN_SEARCH_LENGTH) {
            setResults([])
            setError(null)
            setIsLoading(false)
            return
        }

        let isCurrent = true
        setIsLoading(true)
        setError(null)

        const timeoutId = window.setTimeout(() => {
            void searchIgdbGames({ searchText: trimmedSearchText })
                .then((games) => {
                    if (!isCurrent) return
                    setResults(games)
                })
                .catch((error) => {
                    if (!isCurrent) return
                    setResults([])
                    setError(getIgdbSearchErrorMessage(error))
                })
                .finally(() => {
                    if (isCurrent) {
                        setIsLoading(false)
                    }
                })
        }, 350)

        return () => {
            isCurrent = false
            window.clearTimeout(timeoutId)
        }
    }, [isConfigured, searchIgdbGames, searchText])

    const handlePick = (game: IgdbGameSuggestion) => {
        onPick(game)
        setSearchText('')
        setResults([])
    }

    return (
        <section className="rounded-md border border-zinc-800 bg-zinc-950/50 p-3">
            <div className="space-y-1.5">
                <label htmlFor="igdb-game-search" className="text-sm text-zinc-300">
                    Podpowiedzi z IGDB
                </label>
                <input
                    id="igdb-game-search"
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    disabled={!isConfigured}
                    className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-teal-300"
                    placeholder={
                        isConfigured
                            ? 'Szukaj po tytule'
                            : 'Skonfiguruj IGDB w integracjach'
                    }
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                />
            </div>

            {!isConfigured ? (
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-400">
                    <span>Podpowiedzi wymagają zapisanej konfiguracji IGDB.</span>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/integrations')}
                        className="font-medium text-teal-200 hover:text-teal-100"
                    >
                        Przejdź do integracji
                    </button>
                </div>
            ) : null}

            {isLoading ? (
                <p className="mt-3 text-sm text-zinc-400">Szukam w IGDB...</p>
            ) : null}

            {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}

            {!isLoading &&
            !error &&
            searchText.trim().length >= MIN_SEARCH_LENGTH &&
            results.length === 0 ? (
                <p className="mt-3 text-sm text-zinc-400">Brak wyników.</p>
            ) : null}

            {results.length > 0 ? (
                <ul className="mt-3 max-h-72 space-y-2 overflow-auto">
                    {results.map((game) => (
                        <li key={game.igdbId}>
                            <button
                                type="button"
                                onClick={() => handlePick(game)}
                                className="grid w-full grid-cols-[2.5rem_minmax(0,1fr)] gap-3 rounded-md border border-zinc-800 bg-zinc-900/70 p-2 text-left transition hover:border-teal-400/60 hover:bg-zinc-900"
                            >
                                <div className="flex h-14 w-10 items-center justify-center overflow-hidden rounded border border-zinc-800 bg-zinc-950 text-[0.65rem] text-zinc-500">
                                    {game.coverImageUrl ? (
                                        <img
                                            src={game.coverImageUrl}
                                            alt={`Okładka: ${game.title}`}
                                            className="h-full w-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        'brak'
                                    )}
                                </div>
                                <div className="min-w-0 self-center">
                                    <p className="truncate text-sm font-medium text-zinc-100">
                                        {game.title}
                                    </p>
                                    <p className="mt-1 text-xs text-zinc-400">
                                        {formatReleaseDate(game.releaseDate)}
                                    </p>
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            ) : null}
        </section>
    )
}
