import { useMutation, usePaginatedQuery } from 'convex/react'
import { ConvexError } from 'convex/values'
import { useMemo, useState } from 'react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

const PLATFORM_OPTIONS = [
    'ps_disc',
    'ps_store',
    'ps_plus',
    'steam',
    'epic',
    'gog',
    'amazon_gaming',
    'ubisoft_connect',
    'xbox',
    'switch',
    'other',
] as const

type Platform = (typeof PLATFORM_OPTIONS)[number]

const PROGRESS_STATUS_OPTIONS = [
    'backlog',
    'playing',
    'completed',
    'done',
    'dropped',
] as const
type ProgressStatus = (typeof PROGRESS_STATUS_OPTIONS)[number]

const errorMessages: Record<string, string> = {
    UNAUTHORIZED: 'Musisz być zalogowany.',
    GAME_NOT_FOUND: 'Nie znaleziono gry.',
    LIB_ENTRY_ALREADY_EXISTS: 'Ta gra jest już w Twojej bibliotece.',
    LIB_ENTRY_NOT_FOUND: 'Wpis nie istnieje.',
    FORBIDDEN: 'Brak dostępu do tego wpisu.',
    RATING_INVALID: 'Ocena musi być liczbą całkowitą 0-100.',
    WANTS_TO_PLAY_INVALID: 'Wants to play musi być liczbą całkowitą 0-100.',
    PLATFORM_REQUIRED: 'Wybierz przynajmniej jedną platformę.',
}

type EditState = {
    entryId: Id<'libraryEntries'>
    platforms: Platform[]
    rating: number
    wantsToPlay: number
    progressStatus: ProgressStatus
}

const parseErrorCode = (error: unknown) => {
    if (error instanceof ConvexError) {
        return String(error.data)
    }
    return 'UNKNOWN_ERROR'
}

const toErrorMessage = (errorCode: string | null) => {
    if (!errorCode) return null
    return errorMessages[errorCode] ?? 'Wystąpił nieoczekiwany błąd.'
}

type Props = {
    authReady: boolean
}

export const LibraryPanel = ({ authReady }: Props) => {
    const { results: games } = usePaginatedQuery(
        api.games.list,
        authReady ? {} : 'skip',
        { initialNumItems: 100 },
    )
    const {
        results: entries,
        status: entriesStatus,
        loadMore: loadMoreEntries,
    } = usePaginatedQuery(api.library.listMyLibrary, authReady ? {} : 'skip', {
        initialNumItems: 50,
    })

    const addToLibrary = useMutation(api.library.addToLibrary)
    const updateLibraryEntry = useMutation(api.library.updateLibraryEntry)
    const removeFromLibrary = useMutation(api.library.removeFromLibrary)

    const [gameId, setGameId] = useState<string>('')
    const [platforms, setPlatforms] = useState<Platform[]>([])
    const [rating, setRating] = useState<number>(50)
    const [wantsToPlay, setWantsToPlay] = useState<number>(50)
    const [progressStatus, setProgressStatus] = useState<ProgressStatus>('backlog')
    const [errorCode, setErrorCode] = useState<string | null>(null)
    const [editState, setEditState] = useState<EditState | null>(null)

    const gamesById = useMemo(() => {
        const map = new Map<string, string>()
        games?.forEach((game) => {
            map.set(game._id, `${game.title} (${game.releaseYear})`)
        })
        return map
    }, [games])

    const toggleAddPlatform = (platform: Platform) => {
        setPlatforms((current) =>
            current.includes(platform)
                ? current.filter((value) => value !== platform)
                : [...current, platform],
        )
    }

    const toggleEditPlatform = (platform: Platform) => {
        setEditState((current) => {
            if (!current) return current
            const nextPlatforms = current.platforms.includes(platform)
                ? current.platforms.filter((value) => value !== platform)
                : [...current.platforms, platform]
            return { ...current, platforms: nextPlatforms }
        })
    }

    const handleAdd = async (event: React.FormEvent) => {
        event.preventDefault()
        setErrorCode(null)

        if (!gameId) {
            setErrorCode('GAME_NOT_FOUND')
            return
        }

        try {
            await addToLibrary({
                gameId: gameId as Id<'games'>,
                platforms,
                rating,
                wantsToPlay,
                progressStatus,
            })
            setGameId('')
            setPlatforms([])
            setRating(50)
            setWantsToPlay(50)
            setProgressStatus('backlog')
        } catch (error) {
            setErrorCode(parseErrorCode(error))
        }
    }

    const handleStartEdit = (entry: NonNullable<typeof entries>[number]) => {
        setErrorCode(null)
        setEditState({
            entryId: entry._id,
            platforms: [...entry.platforms],
            rating: entry.rating,
            wantsToPlay: entry.wantsToPlay,
            progressStatus: entry.progressStatus,
        })
    }

    const handleUpdate = async (event: React.FormEvent) => {
        event.preventDefault()
        if (!editState) return
        setErrorCode(null)

        try {
            await updateLibraryEntry(editState)
            setEditState(null)
        } catch (error) {
            setErrorCode(parseErrorCode(error))
        }
    }

    const handleRemove = async (entryId: Id<'libraryEntries'>) => {
        setErrorCode(null)
        try {
            await removeFromLibrary({ entryId })
            if (editState?.entryId === entryId) {
                setEditState(null)
            }
        } catch (error) {
            setErrorCode(parseErrorCode(error))
        }
    }

    const errorMessage = toErrorMessage(errorCode)

    return (
        <section className="mt-8 border-2 p-4">
            <h2 className="mb-3 text-2xl font-bold">Moja biblioteka</h2>

            <form onSubmit={handleAdd} className="mb-6 space-y-3">
                <div>
                    <label>
                        Gra:
                        <select
                            value={gameId}
                            onChange={(event) => setGameId(event.target.value)}
                            className="ml-2"
                        >
                            <option value="">Wybierz grę</option>
                            {games?.map((game) => (
                                <option key={game._id} value={game._id}>
                                    {game.title} ({game.releaseYear})
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <div>
                    <p>Platformy:</p>
                    {PLATFORM_OPTIONS.map((platform) => (
                        <label key={platform} className="mr-3 inline-block">
                            <input
                                type="checkbox"
                                checked={platforms.includes(platform)}
                                onChange={() => toggleAddPlatform(platform)}
                            />{' '}
                            {platform}
                        </label>
                    ))}
                </div>

                <div>
                    <label>
                        Ocena (0-100):
                        <input
                            type="number"
                            min={0}
                            max={100}
                            value={rating}
                            onChange={(event) => setRating(Number(event.target.value))}
                            className="ml-2"
                        />
                    </label>
                </div>

                <div>
                    <label>
                        Chcę zagrać (0-100):
                        <input
                            type="number"
                            min={0}
                            max={100}
                            value={wantsToPlay}
                            onChange={(event) =>
                                setWantsToPlay(Number(event.target.value))
                            }
                            className="ml-2"
                        />
                    </label>
                </div>

                <div>
                    <label>
                        Status:
                        <select
                            value={progressStatus}
                            onChange={(event) =>
                                setProgressStatus(event.target.value as ProgressStatus)
                            }
                            className="ml-2"
                        >
                            {PROGRESS_STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                <button type="submit">Dodaj do biblioteki</button>
            </form>

            {errorMessage ? <p className="mb-4 text-red-700">{errorMessage}</p> : null}

            <ul className="space-y-4">
                {entries?.map((entry) => {
                    const isEditingEntry = editState?.entryId === entry._id
                    const currentEditState = isEditingEntry ? editState : null

                    return (
                        <li key={entry._id} className="border p-3">
                            <p>
                                <strong>Gra:</strong>{' '}
                                {entry.game
                                    ? `${entry.game.title} (${entry.game.releaseYear})`
                                    : (gamesById.get(entry.gameId) ?? 'Brak danych')}
                            </p>
                            <p>
                                <strong>Platformy:</strong> {entry.platforms.join(', ')}
                            </p>
                            <p>
                                <strong>Ocena:</strong> {entry.rating}
                            </p>
                            <p>
                                <strong>Wants to play:</strong> {entry.wantsToPlay}
                            </p>
                            <p>
                                <strong>Status:</strong> {entry.progressStatus}
                            </p>

                            <div className="mt-2 space-x-2">
                                <button
                                    type="button"
                                    onClick={() => handleStartEdit(entry)}
                                >
                                    Edytuj
                                </button>
                                <button
                                    type="button"
                                    onClick={() => void handleRemove(entry._id)}
                                >
                                    Usuń
                                </button>
                            </div>

                            {currentEditState ? (
                                <form
                                    onSubmit={handleUpdate}
                                    className="mt-3 space-y-2 border-t pt-3"
                                >
                                    <div>
                                        <p>Platformy:</p>
                                        {PLATFORM_OPTIONS.map((platform) => (
                                            <label
                                                key={platform}
                                                className="mr-3 inline-block"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={currentEditState.platforms.includes(
                                                        platform,
                                                    )}
                                                    onChange={() =>
                                                        toggleEditPlatform(platform)
                                                    }
                                                />{' '}
                                                {platform}
                                            </label>
                                        ))}
                                    </div>

                                    <div>
                                        <label>
                                            Ocena:
                                            <input
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={currentEditState.rating}
                                                onChange={(event) =>
                                                    setEditState((current) =>
                                                        current
                                                            ? {
                                                                  ...current,
                                                                  rating: Number(
                                                                      event.target.value,
                                                                  ),
                                                              }
                                                            : current,
                                                    )
                                                }
                                                className="ml-2"
                                            />
                                        </label>
                                    </div>

                                    <div>
                                        <label>
                                            Chcę zagrać (0-100):
                                            <input
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={currentEditState.wantsToPlay}
                                                onChange={(event) =>
                                                    setEditState((current) =>
                                                        current
                                                            ? {
                                                                  ...current,
                                                                  wantsToPlay: Number(
                                                                      event.target.value,
                                                                  ),
                                                              }
                                                            : current,
                                                    )
                                                }
                                                className="ml-2"
                                            />
                                        </label>
                                    </div>

                                    <div>
                                        <label>
                                            Status:
                                            <select
                                                value={currentEditState.progressStatus}
                                                onChange={(event) =>
                                                    setEditState((current) =>
                                                        current
                                                            ? {
                                                                  ...current,
                                                                  progressStatus: event
                                                                      .target
                                                                      .value as ProgressStatus,
                                                              }
                                                            : current,
                                                    )
                                                }
                                                className="ml-2"
                                            >
                                                {PROGRESS_STATUS_OPTIONS.map((status) => (
                                                    <option key={status} value={status}>
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                    </div>

                                    <div className="space-x-2">
                                        <button type="submit">Zapisz</button>
                                        <button
                                            type="button"
                                            onClick={() => setEditState(null)}
                                        >
                                            Anuluj
                                        </button>
                                    </div>
                                </form>
                            ) : null}
                        </li>
                    )
                })}
            </ul>
            {entriesStatus === 'CanLoadMore' ? (
                <button
                    type="button"
                    className="mt-4"
                    onClick={() => loadMoreEntries(50)}
                >
                    Załaduj więcej wpisów
                </button>
            ) : null}
        </section>
    )
}
