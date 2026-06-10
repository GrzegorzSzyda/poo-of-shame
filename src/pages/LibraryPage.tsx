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

type GameRunStatus = 'planned' | 'playing' | 'completed' | 'mastered' | 'dropped'

type GameRunType =
    | 'first_playthrough'
    | 'replay'
    | 'new_game_plus'
    | 'dlc'
    | 'challenge'
    | 'coop'
    | 'other'

type RunDatePrecision = 'unknown' | 'exact'

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

type GameRun = {
    _id: Id<'gameRuns'>
    status: GameRunStatus
    label?: string
    runType?: GameRunType
    rating?: number
    note?: string
    startedPrecision: RunDatePrecision
    startedDate?: string
    finishedPrecision: RunDatePrecision
    finishedDate?: string
}

type LibraryEntry = {
    _id: Id<'userGames'>
    status: UserGameStatus
    interest: number
    pinnedRunId?: Id<'gameRuns'>
    lastRunId?: Id<'gameRuns'>
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

const runStatusOptions: Array<{ value: GameRunStatus; label: string }> = [
    { value: 'planned', label: 'Planowany' },
    { value: 'playing', label: 'W trakcie' },
    { value: 'completed', label: 'Ukończony' },
    { value: 'mastered', label: 'Wymaksowany' },
    { value: 'dropped', label: 'Porzucony' },
]

const runTypeOptions: Array<{ value: GameRunType; label: string }> = [
    { value: 'first_playthrough', label: 'Pierwsze przejście' },
    { value: 'replay', label: 'Replay' },
    { value: 'new_game_plus', label: 'New Game+' },
    { value: 'dlc', label: 'DLC' },
    { value: 'challenge', label: 'Challenge' },
    { value: 'coop', label: 'Co-op' },
    { value: 'other', label: 'Inny' },
]

const runStatusLabels = Object.fromEntries(
    runStatusOptions.map((option) => [option.value, option.label]),
) as Record<GameRunStatus, string>

const runTypeLabels = Object.fromEntries(
    runTypeOptions.map((option) => [option.value, option.label]),
) as Record<GameRunType, string>

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

    if (message.includes('USER_GAME_IN_USE')) {
        return 'Nie można usunąć gry, bo ma już powiązane runy albo dostęp.'
    }

    if (message.includes('FORBIDDEN')) {
        return 'Nie możesz edytować tego wpisu.'
    }

    if (message.includes('STARTED_DATE_INVALID')) {
        return 'Data startu runu jest nieprawidłowa.'
    }

    if (message.includes('FINISHED_DATE_INVALID')) {
        return 'Data zakończenia runu jest nieprawidłowa.'
    }

    if (message.includes('INTEREST_INVALID')) {
        return 'Zainteresowanie musi być w zakresie 0-100.'
    }

    if (message.includes('RATING_INVALID')) {
        return 'Ocena runu musi być w zakresie 0-100.'
    }

    if (message.includes('GAME_RUN_NOT_FOUND')) {
        return 'Nie znaleziono tego runu.'
    }

    if (message.includes('GAME_RUN_MISMATCH')) {
        return 'Ten run nie pasuje do wybranej gry.'
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

const formatRunDate = (precision: RunDatePrecision, date?: string) =>
    precision === 'exact' && date ? date : 'brak daty'

const getRunSuggestionForGameStatus = (status: UserGameStatus) => {
    switch (status) {
        case 'playing':
            return 'Status gry ustawiony na „Gram”. Jeśli to nowy albo aktywny playthrough, dodaj lub zaktualizuj run jako „W trakcie”.'
        case 'completed':
            return 'Status gry ustawiony na „Ukończona”. Jeśli chcesz zachować historię, oznacz właściwy run jako ukończony i uzupełnij datę końca.'
        case 'mastered':
            return 'Status gry ustawiony na „Wymaksowana”. Jeśli dotyczy to konkretnego przejścia, oznacz właściwy run jako wymaksowany.'
        case 'dropped':
            return 'Status gry ustawiony na „Porzucona”. Jeśli porzucenie dotyczy konkretnego podejścia, oznacz właściwy run jako porzucony.'
        default:
            return null
    }
}

const getSuggestedRunStatus = (status: UserGameStatus): GameRunStatus | null => {
    switch (status) {
        case 'playing':
            return 'playing'
        case 'completed':
            return 'completed'
        case 'mastered':
            return 'mastered'
        case 'dropped':
            return 'dropped'
        default:
            return null
    }
}

const getRunSuggestionActionLabel = (mode: 'latest' | 'new', status: GameRunStatus) => {
    const statusLabel = runStatusLabels[status].toLowerCase()
    return mode === 'latest'
        ? `Oznacz ostatni run jako ${statusLabel}`
        : `Utwórz nowy run: ${statusLabel}`
}

const RunListItem = ({ run }: { run: GameRun }) => {
    const updateGameRun = useMutation(api.library.updateGameRun)
    const deleteGameRun = useMutation(api.library.deleteGameRun)
    const [isEditing, setIsEditing] = useState(false)
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
    const [status, setStatus] = useState<GameRunStatus>(run.status)
    const [runType, setRunType] = useState<GameRunType | ''>(run.runType ?? '')
    const [label, setLabel] = useState(run.label ?? '')
    const [rating, setRating] = useState(run.rating ?? 0)
    const [hasRating, setHasRating] = useState(run.rating !== undefined)
    const [note, setNote] = useState(run.note ?? '')
    const [startedPrecision, setStartedPrecision] = useState<RunDatePrecision>(
        run.startedPrecision,
    )
    const [startedDate, setStartedDate] = useState(run.startedDate ?? '')
    const [finishedPrecision, setFinishedPrecision] = useState<RunDatePrecision>(
        run.finishedPrecision,
    )
    const [finishedDate, setFinishedDate] = useState(run.finishedDate ?? '')
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const resetForm = () => {
        setStatus(run.status)
        setRunType(run.runType ?? '')
        setLabel(run.label ?? '')
        setRating(run.rating ?? 0)
        setHasRating(run.rating !== undefined)
        setNote(run.note ?? '')
        setStartedPrecision(run.startedPrecision)
        setStartedDate(run.startedDate ?? '')
        setFinishedPrecision(run.finishedPrecision)
        setFinishedDate(run.finishedDate ?? '')
        setError(null)
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setError(null)
        setIsSubmitting(true)

        try {
            await updateGameRun({
                runId: run._id,
                status,
                label: label.trim().length > 0 ? label.trim() : undefined,
                runType: runType || undefined,
                rating: hasRating ? rating : undefined,
                note: note.trim().length > 0 ? note.trim() : undefined,
                startedPrecision,
                startedDate: startedPrecision === 'exact' ? startedDate : undefined,
                finishedPrecision,
                finishedDate: finishedPrecision === 'exact' ? finishedDate : undefined,
            })
            setIsEditing(false)
            setIsConfirmingDelete(false)
        } catch (error) {
            setError(getLibraryErrorMessage(error, 'Nie udało się zapisać runu.'))
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        setError(null)
        setIsDeleting(true)

        try {
            await deleteGameRun({ runId: run._id })
        } catch (error) {
            setError(getLibraryErrorMessage(error, 'Nie udało się usunąć runu.'))
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <li className="rounded-md border border-zinc-800 bg-zinc-900/60 p-3">
            <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_9rem_9rem_auto]">
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-100">
                        {run.label?.trim() || runStatusLabels[run.status]}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                        {run.runType ? runTypeLabels[run.runType] : 'Bez typu'}
                        {run.rating !== undefined ? ` · Ocena ${run.rating}/100` : ''}
                    </p>
                    {run.note ? (
                        <p className="mt-1 line-clamp-2 text-xs text-zinc-400">
                            {run.note}
                        </p>
                    ) : null}
                </div>
                <p className="text-sm text-zinc-400">
                    Start: {formatRunDate(run.startedPrecision, run.startedDate)}
                </p>
                <p className="text-sm text-zinc-400">
                    Koniec: {formatRunDate(run.finishedPrecision, run.finishedDate)}
                </p>
                <div className="flex flex-wrap gap-2 md:justify-end">
                    <button
                        type="button"
                        onClick={() => {
                            if (isEditing) resetForm()
                            setIsEditing((current) => !current)
                            setIsConfirmingDelete(false)
                        }}
                        className="inline-flex h-8 items-center justify-center rounded-md bg-zinc-800 px-2.5 text-xs font-medium text-zinc-100 transition hover:bg-zinc-700"
                    >
                        {isEditing ? 'Zamknij' : 'Edytuj'}
                    </button>
                    {isConfirmingDelete ? (
                        <button
                            type="button"
                            onClick={() => void handleDelete()}
                            disabled={isDeleting}
                            className="inline-flex h-8 items-center justify-center rounded-md bg-red-500 px-2.5 text-xs font-semibold text-red-50 transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isDeleting ? 'Usuwanie...' : 'Potwierdź'}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => {
                                setIsConfirmingDelete(true)
                                setIsEditing(false)
                                setError(null)
                            }}
                            className="inline-flex h-8 items-center justify-center rounded-md bg-red-950/60 px-2.5 text-xs font-medium text-red-200 transition hover:bg-red-900"
                        >
                            Usuń
                        </button>
                    )}
                </div>
            </div>

            {error && !isEditing ? (
                <p className="mt-2 text-sm text-red-300">{error}</p>
            ) : null}

            {isEditing ? (
                <form
                    onSubmit={(event) => void handleSubmit(event)}
                    className="mt-3 space-y-3 rounded-md border border-zinc-800 bg-zinc-950/70 p-3"
                >
                    <div className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-1.5">
                            <label className="text-sm text-zinc-300">Status runu</label>
                            <select
                                value={status}
                                onChange={(event) =>
                                    setStatus(event.target.value as GameRunStatus)
                                }
                                className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                            >
                                {runStatusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm text-zinc-300">Typ</label>
                            <select
                                value={runType}
                                onChange={(event) =>
                                    setRunType(event.target.value as GameRunType | '')
                                }
                                className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                            >
                                <option value="">Bez typu</option>
                                {runTypeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm text-zinc-300">Label</label>
                            <input
                                value={label}
                                onChange={(event) => setLabel(event.target.value)}
                                className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-teal-300"
                                placeholder="np. PS5 run"
                            />
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2 rounded-md border border-zinc-800 p-3">
                            <label className="text-sm text-zinc-300">Start</label>
                            <select
                                value={startedPrecision}
                                onChange={(event) =>
                                    setStartedPrecision(
                                        event.target.value as RunDatePrecision,
                                    )
                                }
                                className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                            >
                                <option value="unknown">Brak daty</option>
                                <option value="exact">Dokładna data</option>
                            </select>
                            {startedPrecision === 'exact' ? (
                                <input
                                    type="date"
                                    value={startedDate}
                                    onChange={(event) =>
                                        setStartedDate(event.target.value)
                                    }
                                    className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-teal-300"
                                />
                            ) : null}
                        </div>

                        <div className="space-y-2 rounded-md border border-zinc-800 p-3">
                            <label className="text-sm text-zinc-300">Koniec</label>
                            <select
                                value={finishedPrecision}
                                onChange={(event) =>
                                    setFinishedPrecision(
                                        event.target.value as RunDatePrecision,
                                    )
                                }
                                className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                            >
                                <option value="unknown">Brak daty</option>
                                <option value="exact">Dokładna data</option>
                            </select>
                            {finishedPrecision === 'exact' ? (
                                <input
                                    type="date"
                                    value={finishedDate}
                                    onChange={(event) =>
                                        setFinishedDate(event.target.value)
                                    }
                                    className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-teal-300"
                                />
                            ) : null}
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-[12rem_minmax(0,1fr)]">
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm text-zinc-300">
                                <input
                                    type="checkbox"
                                    checked={hasRating}
                                    onChange={(event) =>
                                        setHasRating(event.target.checked)
                                    }
                                    className="accent-teal-300"
                                />
                                Ocena
                            </label>
                            {hasRating ? (
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={rating}
                                    onChange={(event) =>
                                        setRating(Number(event.target.value))
                                    }
                                    className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-teal-300"
                                />
                            ) : null}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm text-zinc-300">Notatka</label>
                            <textarea
                                value={note}
                                onChange={(event) => setNote(event.target.value)}
                                className="min-h-20 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-teal-300"
                                placeholder="Opcjonalna notatka do tego runu"
                            />
                        </div>
                    </div>

                    {error ? <p className="text-sm text-red-300">{error}</p> : null}

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex h-9 items-center justify-center rounded-md bg-teal-300 px-3 text-sm font-semibold text-zinc-950 transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? 'Zapisywanie...' : 'Zapisz run'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                resetForm()
                                setIsEditing(false)
                            }}
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

const RunsPanel = ({ userGameId }: { userGameId: Id<'userGames'> }) => {
    const createGameRun = useMutation(api.library.createGameRun)
    const runs = useQuery(api.library.listRunsForUserGame, { userGameId })
    const [status, setStatus] = useState<GameRunStatus>('planned')
    const [runType, setRunType] = useState<GameRunType | ''>('first_playthrough')
    const [label, setLabel] = useState('')
    const [rating, setRating] = useState(0)
    const [hasRating, setHasRating] = useState(false)
    const [note, setNote] = useState('')
    const [startedPrecision, setStartedPrecision] = useState<RunDatePrecision>('unknown')
    const [startedDate, setStartedDate] = useState('')
    const [finishedPrecision, setFinishedPrecision] =
        useState<RunDatePrecision>('unknown')
    const [finishedDate, setFinishedDate] = useState('')
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setMessage(null)
        setError(null)
        setIsSubmitting(true)

        try {
            await createGameRun({
                userGameId,
                status,
                label: label.trim().length > 0 ? label.trim() : undefined,
                runType: runType || undefined,
                rating: hasRating ? rating : undefined,
                note: note.trim().length > 0 ? note.trim() : undefined,
                startedPrecision,
                startedDate: startedPrecision === 'exact' ? startedDate : undefined,
                finishedPrecision,
                finishedDate: finishedPrecision === 'exact' ? finishedDate : undefined,
            })
            setStatus('planned')
            setRunType('first_playthrough')
            setLabel('')
            setRating(0)
            setHasRating(false)
            setNote('')
            setStartedPrecision('unknown')
            setStartedDate('')
            setFinishedPrecision('unknown')
            setFinishedDate('')
            setMessage('Dodano run.')
        } catch (error) {
            setError(getLibraryErrorMessage(error, 'Nie udało się dodać runu.'))
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section className="mt-3 space-y-4 rounded-md border border-zinc-800 bg-zinc-950/60 p-3">
            <div>
                <h3 className="text-sm font-medium text-zinc-100">Runy</h3>
                <p className="mt-1 text-xs text-zinc-500">
                    Dodanie runu aktualizuje ostatni run tej gry.
                </p>
            </div>

            {runs === undefined ? (
                <p className="text-sm text-zinc-400">Ładowanie runów...</p>
            ) : runs.length > 0 ? (
                <ul className="space-y-2">
                    {runs.map((run) => (
                        <RunListItem key={run._id} run={run} />
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-zinc-400">Brak runów dla tej gry.</p>
            )}

            <form onSubmit={(event) => void handleSubmit(event)} className="space-y-3">
                <div className="grid gap-3 md:grid-cols-3">
                    <div className="space-y-1.5">
                        <label
                            htmlFor={`run-status-${userGameId}`}
                            className="text-sm text-zinc-300"
                        >
                            Status runu
                        </label>
                        <select
                            id={`run-status-${userGameId}`}
                            value={status}
                            onChange={(event) =>
                                setStatus(event.target.value as GameRunStatus)
                            }
                            className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                        >
                            {runStatusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor={`run-type-${userGameId}`}
                            className="text-sm text-zinc-300"
                        >
                            Typ
                        </label>
                        <select
                            id={`run-type-${userGameId}`}
                            value={runType}
                            onChange={(event) =>
                                setRunType(event.target.value as GameRunType | '')
                            }
                            className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                        >
                            <option value="">Bez typu</option>
                            {runTypeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor={`run-label-${userGameId}`}
                            className="text-sm text-zinc-300"
                        >
                            Label
                        </label>
                        <input
                            id={`run-label-${userGameId}`}
                            value={label}
                            onChange={(event) => setLabel(event.target.value)}
                            className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-teal-300"
                            placeholder="np. PS5 run"
                        />
                    </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2 rounded-md border border-zinc-800 p-3">
                        <label
                            htmlFor={`run-started-precision-${userGameId}`}
                            className="text-sm text-zinc-300"
                        >
                            Start
                        </label>
                        <select
                            id={`run-started-precision-${userGameId}`}
                            value={startedPrecision}
                            onChange={(event) =>
                                setStartedPrecision(
                                    event.target.value as RunDatePrecision,
                                )
                            }
                            className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                        >
                            <option value="unknown">Brak daty</option>
                            <option value="exact">Dokładna data</option>
                        </select>
                        {startedPrecision === 'exact' ? (
                            <input
                                type="date"
                                value={startedDate}
                                onChange={(event) => setStartedDate(event.target.value)}
                                className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-teal-300"
                            />
                        ) : null}
                    </div>

                    <div className="space-y-2 rounded-md border border-zinc-800 p-3">
                        <label
                            htmlFor={`run-finished-precision-${userGameId}`}
                            className="text-sm text-zinc-300"
                        >
                            Koniec
                        </label>
                        <select
                            id={`run-finished-precision-${userGameId}`}
                            value={finishedPrecision}
                            onChange={(event) =>
                                setFinishedPrecision(
                                    event.target.value as RunDatePrecision,
                                )
                            }
                            className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                        >
                            <option value="unknown">Brak daty</option>
                            <option value="exact">Dokładna data</option>
                        </select>
                        {finishedPrecision === 'exact' ? (
                            <input
                                type="date"
                                value={finishedDate}
                                onChange={(event) => setFinishedDate(event.target.value)}
                                className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-teal-300"
                            />
                        ) : null}
                    </div>
                </div>

                <div className="grid gap-3 md:grid-cols-[12rem_minmax(0,1fr)]">
                    <div className="space-y-1.5">
                        <label
                            htmlFor={`run-rating-enabled-${userGameId}`}
                            className="flex items-center gap-2 text-sm text-zinc-300"
                        >
                            <input
                                id={`run-rating-enabled-${userGameId}`}
                                type="checkbox"
                                checked={hasRating}
                                onChange={(event) => setHasRating(event.target.checked)}
                                className="accent-teal-300"
                            />
                            Ocena
                        </label>
                        {hasRating ? (
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={rating}
                                onChange={(event) =>
                                    setRating(Number(event.target.value))
                                }
                                className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-teal-300"
                            />
                        ) : null}
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor={`run-note-${userGameId}`}
                            className="text-sm text-zinc-300"
                        >
                            Notatka
                        </label>
                        <textarea
                            id={`run-note-${userGameId}`}
                            value={note}
                            onChange={(event) => setNote(event.target.value)}
                            className="min-h-20 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-teal-300"
                            placeholder="Opcjonalna notatka do tego runu"
                        />
                    </div>
                </div>

                {message ? <p className="text-sm text-teal-200">{message}</p> : null}
                {error ? <p className="text-sm text-red-300">{error}</p> : null}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex h-9 items-center justify-center rounded-md bg-teal-300 px-3 text-sm font-semibold text-zinc-950 transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting ? 'Dodawanie...' : 'Dodaj run'}
                </button>
            </form>
        </section>
    )
}

const LibraryEntryRow = ({ entry }: { entry: LibraryEntry }) => {
    const updateLibraryGame = useMutation(api.library.updateLibraryGame)
    const removeGameFromLibrary = useMutation(api.library.removeGameFromLibrary)
    const applyRunSuggestion = useMutation(api.library.applyRunSuggestion)
    const [isEditing, setIsEditing] = useState(false)
    const [isShowingRuns, setIsShowingRuns] = useState(false)
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
    const [status, setStatus] = useState<UserGameStatus>(entry.status)
    const [interest, setInterest] = useState(entry.interest)
    const [runSuggestion, setRunSuggestion] = useState<string | null>(null)
    const [suggestedRunStatus, setSuggestedRunStatus] = useState<GameRunStatus | null>(
        null,
    )
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [runSuggestionMode, setRunSuggestionMode] = useState<'latest' | 'new' | null>(
        null,
    )
    const showsInterest = shouldShowInterest(status)

    const handleCancel = () => {
        setStatus(entry.status)
        setInterest(entry.interest)
        setRunSuggestion(null)
        setSuggestedRunStatus(null)
        setError(null)
        setMessage(null)
        setIsEditing(false)
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setError(null)
        setMessage(null)
        setIsSubmitting(true)

        try {
            const nextRunSuggestion =
                status !== entry.status ? getRunSuggestionForGameStatus(status) : null
            const nextSuggestedRunStatus =
                status !== entry.status ? getSuggestedRunStatus(status) : null

            await updateLibraryGame({
                userGameId: entry._id,
                status,
                interest: showsInterest ? interest : 0,
            })
            setRunSuggestion(nextRunSuggestion)
            setSuggestedRunStatus(nextSuggestedRunStatus)
            if (nextRunSuggestion) {
                setIsShowingRuns(true)
            }
            setIsEditing(false)
        } catch (error) {
            setError(getLibraryErrorMessage(error, 'Nie udało się zapisać zmian.'))
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        setError(null)
        setMessage(null)
        setIsDeleting(true)

        try {
            await removeGameFromLibrary({ userGameId: entry._id })
        } catch (error) {
            setError(getLibraryErrorMessage(error, 'Nie udało się usunąć gry z kupki.'))
        } finally {
            setIsDeleting(false)
        }
    }

    const handleRunSuggestion = async (mode: 'latest' | 'new') => {
        if (!suggestedRunStatus) return

        setError(null)
        setMessage(null)
        setRunSuggestionMode(mode)

        try {
            await applyRunSuggestion({
                userGameId: entry._id,
                status: suggestedRunStatus,
                mode,
            })
            setMessage(
                mode === 'latest' ? 'Zaktualizowano ostatni run.' : 'Utworzono nowy run.',
            )
            setRunSuggestion(null)
            setSuggestedRunStatus(null)
            setIsShowingRuns(true)
        } catch (error) {
            setError(getLibraryErrorMessage(error, 'Nie udało się zastosować sugestii.'))
        } finally {
            setRunSuggestionMode(null)
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
                            setIsConfirmingDelete(false)
                            setError(null)
                        }}
                        className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-800 px-3 text-sm font-medium text-zinc-100 transition hover:bg-zinc-700"
                    >
                        {isEditing ? 'Zamknij' : 'Edytuj'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsShowingRuns((current) => !current)}
                        className="mt-2 inline-flex h-9 items-center justify-center rounded-md bg-zinc-800 px-3 text-sm font-medium text-zinc-100 transition hover:bg-zinc-700 md:mt-0 md:ml-2"
                    >
                        {isShowingRuns ? 'Ukryj runy' : 'Runy'}
                    </button>
                    {isConfirmingDelete ? (
                        <button
                            type="button"
                            onClick={() => void handleDelete()}
                            disabled={isDeleting}
                            className="mt-2 inline-flex h-9 items-center justify-center rounded-md bg-red-500 px-3 text-sm font-semibold text-red-50 transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60 md:mt-0 md:ml-2"
                        >
                            {isDeleting ? 'Usuwanie...' : 'Potwierdź'}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => {
                                setIsConfirmingDelete(true)
                                setIsEditing(false)
                                setError(null)
                            }}
                            className="mt-2 inline-flex h-9 items-center justify-center rounded-md bg-red-950/60 px-3 text-sm font-medium text-red-200 transition hover:bg-red-900 md:mt-0 md:ml-2"
                        >
                            Usuń
                        </button>
                    )}
                </div>
            </div>

            {error && !isEditing ? (
                <p className="mt-2 text-sm text-red-300">{error}</p>
            ) : null}
            {message && !isEditing ? (
                <p className="mt-2 text-sm text-teal-200">{message}</p>
            ) : null}

            {runSuggestion && !isEditing ? (
                <div className="mt-3 rounded-md border border-teal-900/70 bg-teal-950/30 p-3">
                    <p className="text-sm text-teal-100">{runSuggestion}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {suggestedRunStatus && entry.lastRunId ? (
                            <button
                                type="button"
                                onClick={() => void handleRunSuggestion('latest')}
                                disabled={runSuggestionMode !== null}
                                className="inline-flex h-8 items-center justify-center rounded-md bg-teal-300 px-2.5 text-xs font-semibold text-zinc-950 transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {runSuggestionMode === 'latest'
                                    ? 'Aktualizuję...'
                                    : getRunSuggestionActionLabel(
                                          'latest',
                                          suggestedRunStatus,
                                      )}
                            </button>
                        ) : null}
                        {suggestedRunStatus ? (
                            <button
                                type="button"
                                onClick={() => void handleRunSuggestion('new')}
                                disabled={runSuggestionMode !== null}
                                className="inline-flex h-8 items-center justify-center rounded-md bg-zinc-100 px-2.5 text-xs font-semibold text-zinc-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {runSuggestionMode === 'new'
                                    ? 'Tworzę...'
                                    : getRunSuggestionActionLabel(
                                          'new',
                                          suggestedRunStatus,
                                      )}
                            </button>
                        ) : null}
                        <button
                            type="button"
                            onClick={() => setIsShowingRuns(true)}
                            className="inline-flex h-8 items-center justify-center rounded-md bg-teal-300 px-2.5 text-xs font-semibold text-zinc-950 transition hover:bg-teal-200"
                        >
                            Pokaż runy
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setRunSuggestion(null)
                                setSuggestedRunStatus(null)
                            }}
                            className="inline-flex h-8 items-center justify-center rounded-md bg-zinc-800 px-2.5 text-xs font-medium text-zinc-100 transition hover:bg-zinc-700"
                        >
                            Zamknij sugestię
                        </button>
                    </div>
                </div>
            ) : null}

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

            {isShowingRuns ? <RunsPanel userGameId={entry._id} /> : null}
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
