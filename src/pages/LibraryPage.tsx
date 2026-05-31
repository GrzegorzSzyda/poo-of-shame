import { useMutation, useQuery } from 'convex/react'
import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

type UserGameStatus =
    | 'wanted'
    | 'owned'
    | 'playing'
    | 'completed'
    | 'mastered'
    | 'dropped'

type CatalogSearchGame = {
    _id: Id<'games'>
    title: string
    releaseDate?: string
    releaseYear?: number
    releaseQuarter?: number
    releaseYearMonth?: string
    releaseText?: string
    coverImageUrl?: string
    isInLibrary: boolean
}

type LibraryEntry = {
    _id: Id<'userGames'>
    status: UserGameStatus
    interest: number
    game: {
        title: string
        releaseDate?: string
        releaseYear?: number
        releaseQuarter?: number
        releaseYearMonth?: string
        releaseText?: string
        coverImageUrl?: string
    } | null
}

const statusOptions: Array<{ value: UserGameStatus; label: string }> = [
    { value: 'wanted', label: 'Chcę zagrać' },
    { value: 'owned', label: 'Mam' },
    { value: 'playing', label: 'Gram' },
    { value: 'completed', label: 'Ukończona' },
    { value: 'mastered', label: 'Wymaksowana' },
    { value: 'dropped', label: 'Porzucona' },
]

const statusLabels = Object.fromEntries(
    statusOptions.map((option) => [option.value, option.label]),
) as Record<UserGameStatus, string>

const interestStatuses = new Set<UserGameStatus>(['wanted', 'owned', 'playing'])

const shouldShowInterest = (status: UserGameStatus) => interestStatuses.has(status)

const formatRelease = (game: {
    releaseDate?: string
    releaseYearMonth?: string
    releaseYear?: number
    releaseQuarter?: number
    releaseText?: string
}) => {
    if (game.releaseDate) return game.releaseDate
    if (game.releaseYearMonth) return game.releaseYearMonth
    if (game.releaseYear !== undefined && game.releaseQuarter !== undefined) {
        return `${game.releaseYear} Q${game.releaseQuarter}`
    }
    if (game.releaseYear !== undefined) return String(game.releaseYear)
    if (game.releaseText) return game.releaseText
    return 'brak daty'
}

const getLibraryErrorMessage = (error: unknown, fallback: string) => {
    const message = error instanceof Error ? error.message : ''

    if (message.includes('USER_GAME_ALREADY_EXISTS')) {
        return 'Ta gra jest już w twojej kupce.'
    }

    if (message.includes('GAME_NOT_FOUND')) {
        return 'Nie znaleziono tej gry w katalogu.'
    }

    if (message.includes('USER_GAME_NOT_FOUND')) {
        return 'Nie znaleziono tej gry w twojej kupce.'
    }

    if (message.includes('FORBIDDEN')) {
        return 'Nie możesz edytować tego wpisu.'
    }

    if (message.includes('INTEREST_INVALID')) {
        return 'Zainteresowanie musi być w zakresie 0-100.'
    }

    return error instanceof Error ? error.message : fallback
}

const Cover = ({ game }: { game: { title: string; coverImageUrl?: string } }) =>
    game.coverImageUrl ? (
        <img
            src={game.coverImageUrl}
            alt={`Okładka: ${game.title}`}
            className="h-16 w-11 shrink-0 rounded border border-zinc-800 object-cover"
            loading="lazy"
        />
    ) : (
        <div className="flex h-16 w-11 shrink-0 items-center justify-center rounded border border-dashed border-zinc-800 bg-zinc-950 text-[0.65rem] text-zinc-600">
            brak
        </div>
    )

const LibraryEntryRow = ({ entry }: { entry: LibraryEntry }) => {
    const updateLibraryGame = useMutation(api.library.updateLibraryGame)
    const [isEditing, setIsEditing] = useState(false)
    const [status, setStatus] = useState<UserGameStatus>(entry.status)
    const [interest, setInterest] = useState(entry.interest)
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const showsInterest = shouldShowInterest(status)

    const handleCancel = () => {
        setStatus(entry.status)
        setInterest(entry.interest)
        setError(null)
        setIsEditing(false)
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setError(null)
        setIsSubmitting(true)

        try {
            await updateLibraryGame({
                userGameId: entry._id,
                status,
                interest: showsInterest ? interest : 0,
            })
            setIsEditing(false)
        } catch (error) {
            setError(getLibraryErrorMessage(error, 'Nie udało się zapisać zmian.'))
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <li className="bg-zinc-900/50 px-4 py-3">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_9rem_8rem_8rem]">
                {entry.game ? (
                    <div className="flex min-w-0 gap-3">
                        <Cover game={entry.game} />
                        <div className="min-w-0 self-center">
                            <p className="truncate text-sm font-medium text-zinc-100">
                                {entry.game.title}
                            </p>
                            <p className="mt-1 text-xs text-zinc-400">
                                {formatRelease(entry.game)}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-red-300">
                        Brak rekordu gry w katalogu.
                    </div>
                )}
                <p className="self-center text-sm text-zinc-300">
                    {statusLabels[entry.status]}
                </p>
                {shouldShowInterest(entry.status) ? (
                    <p className="self-center text-sm text-zinc-400">
                        Interest: {entry.interest}
                    </p>
                ) : (
                    <p className="self-center text-sm text-zinc-500">Bez priorytetu</p>
                )}
                <div className="self-center md:text-right">
                    <button
                        type="button"
                        onClick={() => {
                            setIsEditing((current) => !current)
                            setError(null)
                        }}
                        className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-800 px-3 text-sm font-medium text-zinc-100 transition hover:bg-zinc-700"
                    >
                        {isEditing ? 'Zamknij' : 'Edytuj'}
                    </button>
                </div>
            </div>

            {isEditing ? (
                <form
                    onSubmit={(event) => void handleSubmit(event)}
                    className="mt-3 space-y-3 rounded-md border border-zinc-800 bg-zinc-950/60 p-3"
                >
                    <div
                        className={`grid gap-4 ${
                            showsInterest ? 'md:grid-cols-[minmax(0,1fr)_14rem]' : ''
                        }`}
                    >
                        <div className="space-y-1.5">
                            <label
                                htmlFor={`library-edit-status-${entry._id}`}
                                className="text-sm text-zinc-300"
                            >
                                Status
                            </label>
                            <select
                                id={`library-edit-status-${entry._id}`}
                                value={status}
                                onChange={(event) =>
                                    setStatus(event.target.value as UserGameStatus)
                                }
                                className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                            >
                                {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {showsInterest ? (
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between gap-3">
                                    <label
                                        htmlFor={`library-edit-interest-${entry._id}`}
                                        className="text-sm text-zinc-300"
                                    >
                                        Zainteresowanie
                                    </label>
                                    <span className="text-sm font-medium text-zinc-100">
                                        {interest}
                                    </span>
                                </div>
                                <input
                                    id={`library-edit-interest-${entry._id}`}
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="1"
                                    value={interest}
                                    onChange={(event) =>
                                        setInterest(Number(event.target.value))
                                    }
                                    className="h-10 w-full accent-teal-300"
                                />
                            </div>
                        ) : null}
                    </div>

                    {error ? <p className="text-sm text-red-300">{error}</p> : null}

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex h-9 items-center justify-center rounded-md bg-teal-300 px-3 text-sm font-semibold text-zinc-950 transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? 'Zapisywanie...' : 'Zapisz'}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-800 px-3 text-sm font-medium text-zinc-100 transition hover:bg-zinc-700"
                        >
                            Anuluj
                        </button>
                    </div>
                </form>
            ) : null}
        </li>
    )
}

const AddToLibraryPanel = () => {
    const addGameToLibrary = useMutation(api.library.addGameToLibrary)
    const [searchText, setSearchText] = useState('')
    const [selectedGame, setSelectedGame] = useState<CatalogSearchGame | null>(null)
    const [status, setStatus] = useState<UserGameStatus>('wanted')
    const [interest, setInterest] = useState(50)
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const showsInterest = shouldShowInterest(status)
    const searchArgs = useMemo(() => {
        const trimmed = searchText.trim()
        return trimmed.length >= 2 ? { searchText: trimmed, limit: 10 } : 'skip'
    }, [searchText])
    const results = useQuery(api.library.searchCatalogForLibrary, searchArgs)

    const handleSelectGame = (game: CatalogSearchGame) => {
        setSelectedGame(game)
        setMessage(null)
        setError(null)
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()

        if (!selectedGame) {
            setError('Wybierz grę z katalogu.')
            return
        }

        setMessage(null)
        setError(null)
        setIsSubmitting(true)

        try {
            await addGameToLibrary({
                gameId: selectedGame._id,
                status,
                interest: showsInterest ? interest : 0,
            })
            setMessage(`Dodano: ${selectedGame.title}.`)
            setSelectedGame(null)
            setSearchText('')
            setStatus('wanted')
            setInterest(50)
        } catch (error) {
            setError(getLibraryErrorMessage(error, 'Nie udało się dodać gry.'))
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4">
            <div>
                <h2 className="font-medium text-white">Dodaj grę z katalogu</h2>
                <p className="mt-1 text-sm text-zinc-400">
                    Wyszukaj grę po tytule i ustaw jej początkowy status.
                </p>
            </div>

            <form
                onSubmit={(event) => void handleSubmit(event)}
                className="mt-4 space-y-4"
            >
                <div className="space-y-1.5">
                    <label
                        htmlFor="library-catalog-search"
                        className="text-sm text-zinc-300"
                    >
                        Szukaj w katalogu
                    </label>
                    <input
                        id="library-catalog-search"
                        value={searchText}
                        onChange={(event) => {
                            setSearchText(event.target.value)
                            setSelectedGame(null)
                        }}
                        className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-teal-300"
                        placeholder="Minimum 2 znaki"
                        autoCapitalize="off"
                        autoCorrect="off"
                        spellCheck={false}
                    />
                </div>

                {searchText.trim().length >= 2 ? (
                    <div className="overflow-hidden rounded-md border border-zinc-800">
                        {results === undefined ? (
                            <div className="bg-zinc-950/50 px-3 py-4 text-sm text-zinc-400">
                                Szukam...
                            </div>
                        ) : results.length > 0 ? (
                            <ul className="max-h-80 divide-y divide-zinc-800 overflow-auto">
                                {results.map((game) => {
                                    const isSelected = selectedGame?._id === game._id
                                    return (
                                        <li key={game._id}>
                                            <button
                                                type="button"
                                                onClick={() => handleSelectGame(game)}
                                                disabled={game.isInLibrary}
                                                className={`grid w-full grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-3 bg-zinc-950/50 px-3 py-3 text-left transition ${
                                                    isSelected
                                                        ? 'outline outline-1 outline-teal-300'
                                                        : ''
                                                } ${
                                                    game.isInLibrary
                                                        ? 'cursor-not-allowed opacity-55'
                                                        : 'hover:bg-zinc-900'
                                                }`}
                                            >
                                                <Cover game={game} />
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium text-zinc-100">
                                                        {game.title}
                                                    </p>
                                                    <p className="mt-1 text-xs text-zinc-400">
                                                        {formatRelease(game)}
                                                    </p>
                                                </div>
                                                <span className="text-xs text-zinc-500">
                                                    {game.isInLibrary
                                                        ? 'już dodana'
                                                        : isSelected
                                                          ? 'wybrana'
                                                          : 'wybierz'}
                                                </span>
                                            </button>
                                        </li>
                                    )
                                })}
                            </ul>
                        ) : (
                            <div className="bg-zinc-950/50 px-3 py-4 text-sm text-zinc-400">
                                Brak wyników.
                            </div>
                        )}
                    </div>
                ) : null}

                <div
                    className={`grid gap-4 ${
                        showsInterest ? 'md:grid-cols-[minmax(0,1fr)_14rem]' : ''
                    }`}
                >
                    <div className="space-y-1.5">
                        <label htmlFor="library-status" className="text-sm text-zinc-300">
                            Status
                        </label>
                        <select
                            id="library-status"
                            value={status}
                            onChange={(event) =>
                                setStatus(event.target.value as UserGameStatus)
                            }
                            className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                        >
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {showsInterest ? (
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-3">
                                <label
                                    htmlFor="library-interest"
                                    className="text-sm text-zinc-300"
                                >
                                    Zainteresowanie
                                </label>
                                <span className="text-sm font-medium text-zinc-100">
                                    {interest}
                                </span>
                            </div>
                            <input
                                id="library-interest"
                                type="range"
                                min="0"
                                max="100"
                                step="1"
                                value={interest}
                                onChange={(event) =>
                                    setInterest(Number(event.target.value))
                                }
                                className="h-10 w-full accent-teal-300"
                            />
                        </div>
                    ) : null}
                </div>

                {selectedGame ? (
                    <div className="flex items-center gap-3 rounded-md border border-zinc-800 bg-zinc-950/50 p-3">
                        <Cover game={selectedGame} />
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-zinc-100">
                                {selectedGame.title}
                            </p>
                            <p className="mt-1 text-xs text-zinc-400">
                                {formatRelease(selectedGame)}
                            </p>
                        </div>
                    </div>
                ) : null}

                {message ? <p className="text-sm text-teal-200">{message}</p> : null}
                {error ? <p className="text-sm text-red-300">{error}</p> : null}

                <button
                    type="submit"
                    disabled={isSubmitting || !selectedGame || selectedGame.isInLibrary}
                    className="inline-flex h-10 items-center justify-center rounded-md bg-teal-300 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting ? 'Dodawanie...' : 'Dodaj do kupki'}
                </button>
            </form>
        </section>
    )
}

export const LibraryPage = () => {
    const library = useQuery(api.library.listMyLibrary, { limit: 50 })

    return (
        <div className="mt-8 space-y-5">
            <AddToLibraryPanel />

            <section className="rounded-lg border border-zinc-800 bg-zinc-900/70">
                <div className="border-b border-zinc-800 px-4 py-3">
                    <h2 className="font-medium text-white">Moja kupka</h2>
                    <p className="mt-1 text-sm text-zinc-400">
                        Ostatnie 50 gier dodanych do nowego modelu biblioteki.
                    </p>
                </div>

                {library === undefined ? (
                    <div className="px-4 py-5 text-sm text-zinc-400">
                        Ładowanie biblioteki...
                    </div>
                ) : library.length > 0 ? (
                    <ul className="divide-y divide-zinc-800">
                        {library.map((entry) => (
                            <LibraryEntryRow key={entry._id} entry={entry} />
                        ))}
                    </ul>
                ) : (
                    <div className="px-4 py-5 text-sm text-zinc-400">
                        Nie masz jeszcze gier w kupce.
                    </div>
                )}
            </section>
        </div>
    )
}
