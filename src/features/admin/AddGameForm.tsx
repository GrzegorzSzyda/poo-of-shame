import { useAction, useMutation } from 'convex/react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../../../convex/_generated/api'
import { GameFormFields } from './GameFormFields'
import { IgdbGameSuggestions } from './IgdbGameSuggestions'
import {
    type GameFormValues,
    createEmptyGameFormValues,
    toGameMutationArgs,
} from './releaseForm'

export const AddGameForm = ({ isIgdbConfigured }: { isIgdbConfigured: boolean }) => {
    const createGame = useMutation(api.games.createGame)
    const uploadCoverFromUrl = useAction(api.games.uploadCoverFromUrl)
    const [values, setValues] = useState<GameFormValues>(createEmptyGameFormValues)
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handlePickIgdbGame = (game: {
        title: string
        releaseDate?: string
        coverImageUrl?: string
    }) => {
        setValues({
            ...values,
            title: game.title,
            releasePrecision: game.releaseDate ? 'exact' : 'unknown',
            releaseDate: game.releaseDate ?? '',
            coverUrl: game.coverImageUrl ?? '',
        })
        setMessage(null)
        setError(null)
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setMessage(null)
        setError(null)
        setIsSubmitting(true)

        try {
            const trimmedCoverUrl = values.coverUrl.trim()
            const uploadedCoverUrl =
                trimmedCoverUrl.length > 0
                    ? await uploadCoverFromUrl({ sourceUrl: trimmedCoverUrl })
                    : undefined

            await createGame({
                ...toGameMutationArgs(values),
                coverImageUrl: uploadedCoverUrl,
            })

            setValues(createEmptyGameFormValues())
            setMessage('Dodano grę do katalogu.')
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Nie udało się dodać gry.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form
            onSubmit={(event) => void handleSubmit(event)}
            className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4"
        >
            <div className="space-y-4">
                <div>
                    <h3 className="font-medium text-white">Dodaj grę do katalogu</h3>
                    <p className="mt-1 text-sm text-zinc-400">
                        Okładka jest opcjonalna. Jeśli podasz URL, backend pobierze obraz
                        i zapisze go w Convex storage.
                    </p>
                </div>

                <IgdbGameSuggestions
                    isConfigured={isIgdbConfigured}
                    onPick={handlePickIgdbGame}
                />

                <GameFormFields
                    idPrefix="new-game"
                    values={values}
                    onChange={setValues}
                />

                {message ? <p className="text-sm text-teal-200">{message}</p> : null}
                {error ? <p className="text-sm text-red-300">{error}</p> : null}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex h-10 items-center justify-center rounded-md bg-teal-300 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting ? 'Dodawanie...' : 'Dodaj grę'}
                </button>
            </div>
        </form>
    )
}
