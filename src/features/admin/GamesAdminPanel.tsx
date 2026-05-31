import { useAction, useMutation, useQuery } from 'convex/react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../../../convex/_generated/api'
import type { Doc } from '../../../convex/_generated/dataModel'
import { AddGameForm } from './AddGameForm'
import { GameFormFields } from './GameFormFields'
import {
    type GameFormValues,
    formatGameRelease,
    toGameFormValues,
    toGameMutationArgs,
} from './releaseForm'

const getGameAdminErrorMessage = (error: unknown, fallback: string) => {
    const message = error instanceof Error ? error.message : ''

    if (message.includes('GAME_ALREADY_EXISTS')) {
        return 'Gra o takim tytule i dacie premiery już istnieje.'
    }
    if (message.includes('GAME_IN_USE')) {
        return 'Nie można usunąć gry, bo jest już używana w czyjejś bibliotece.'
    }
    if (message.includes('GAME_NOT_FOUND')) {
        return 'Nie znaleziono tej gry w katalogu.'
    }
    if (message.includes('TITLE_REQUIRED')) {
        return 'Tytuł gry jest wymagany.'
    }

    return error instanceof Error ? error.message : fallback
}

const GameEditor = ({ game, onCancel }: { game: Doc<'games'>; onCancel: () => void }) => {
    const updateGame = useMutation(api.games.updateGame)
    const uploadCoverFromUrl = useAction(api.games.uploadCoverFromUrl)
    const [values, setValues] = useState<GameFormValues>(() => toGameFormValues(game))
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setError(null)
        setIsSubmitting(true)

        try {
            const trimmedCoverUrl = values.coverUrl.trim()
            const shouldUploadCover =
                trimmedCoverUrl.length > 0 &&
                trimmedCoverUrl !== (game.coverImageUrl ?? '')
            const coverImageUrl = shouldUploadCover
                ? await uploadCoverFromUrl({ sourceUrl: trimmedCoverUrl })
                : trimmedCoverUrl || undefined

            await updateGame({
                gameId: game._id,
                ...toGameMutationArgs(values),
                coverImageUrl,
            })
            onCancel()
        } catch (error) {
            setError(getGameAdminErrorMessage(error, 'Nie udało się zapisać gry.'))
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form
            onSubmit={(event) => void handleSubmit(event)}
            className="mt-3 space-y-4 rounded-md border border-zinc-800 bg-zinc-950/60 p-4"
        >
            <GameFormFields
                idPrefix={`edit-game-${game._id}`}
                values={values}
                onChange={setValues}
            />
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
                    onClick={onCancel}
                    className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-800 px-3 text-sm font-medium text-zinc-100 transition hover:bg-zinc-700"
                >
                    Anuluj
                </button>
            </div>
        </form>
    )
}

const GameRow = ({ game }: { game: Doc<'games'> }) => {
    const deleteGame = useMutation(api.games.deleteGame)
    const [isEditing, setIsEditing] = useState(false)
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleDelete = async () => {
        setError(null)
        setIsDeleting(true)
        try {
            await deleteGame({ gameId: game._id })
            setIsConfirmingDelete(false)
        } catch (error) {
            setError(getGameAdminErrorMessage(error, 'Nie udało się usunąć gry.'))
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <li className="bg-zinc-900/50 px-4 py-3">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_9rem_12rem] md:items-center">
                <div className="flex min-w-0 gap-3">
                    {game.coverImageUrl ? (
                        <img
                            src={game.coverImageUrl}
                            alt=""
                            className="h-14 w-10 shrink-0 rounded border border-zinc-800 object-cover"
                            loading="lazy"
                        />
                    ) : (
                        <div className="h-14 w-10 shrink-0 rounded border border-dashed border-zinc-800 bg-zinc-950" />
                    )}
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-zinc-100">
                            {game.title}
                        </p>
                        <p className="mt-1 truncate text-xs text-zinc-500">{game._id}</p>
                    </div>
                </div>
                <p className="text-sm text-zinc-400">{formatGameRelease(game)}</p>
                <div className="flex flex-wrap justify-start gap-2 md:justify-end">
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
                    {isConfirmingDelete ? (
                        <button
                            type="button"
                            onClick={() => void handleDelete()}
                            disabled={isDeleting}
                            className="inline-flex h-9 items-center justify-center rounded-md bg-red-500 px-3 text-sm font-semibold text-red-50 transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
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
                            className="inline-flex h-9 items-center justify-center rounded-md bg-red-950/60 px-3 text-sm font-medium text-red-200 transition hover:bg-red-900"
                        >
                            Usuń
                        </button>
                    )}
                </div>
            </div>
            {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}
            {isEditing ? (
                <GameEditor game={game} onCancel={() => setIsEditing(false)} />
            ) : null}
        </li>
    )
}

export const GamesAdminPanel = () => {
    const games = useQuery(api.games.listAdminGames, { limit: 50 })

    return (
        <div className="space-y-5">
            <AddGameForm />
            <section className="rounded-lg border border-zinc-800 bg-zinc-900/70">
                <div className="border-b border-zinc-800 px-4 py-3">
                    <h3 className="font-medium text-white">Katalog gier</h3>
                    <p className="mt-1 text-sm text-zinc-400">
                        Ostatnie 50 rekordów. Usunięcie jest blokowane, jeśli gra jest
                        używana w starej albo nowej bibliotece.
                    </p>
                </div>
                {games === undefined ? (
                    <div className="px-4 py-5 text-sm text-zinc-400">
                        Ładowanie katalogu...
                    </div>
                ) : games.length > 0 ? (
                    <ul className="divide-y divide-zinc-800">
                        {games.map((game) => (
                            <GameRow key={game._id} game={game} />
                        ))}
                    </ul>
                ) : (
                    <div className="px-4 py-5 text-sm text-zinc-400">
                        Katalog jest pusty.
                    </div>
                )}
            </section>
        </div>
    )
}
