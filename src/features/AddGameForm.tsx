import { useMutation } from 'convex/react'
import { ConvexError } from 'convex/values'
import { useState } from 'react'
import { type IgdbGame } from '~/api/types/IgdbGame'
import { Button } from '~/components/Button'
import { Waiter } from '~/components/Waiter'
import { api } from '../../convex/_generated/api'
import { IgdbGamePicker } from './IgdbGamePicker'

const toReleaseYear = (firstReleaseDate?: number): number | '' => {
    if (!firstReleaseDate) return ''
    const year = new Date(firstReleaseDate * 1000).getFullYear()
    return Number.isFinite(year) ? year : ''
}

const toCoverUrl = (imageId?: string): string => {
    if (!imageId) return ''
    return `https://images.igdb.com/igdb/image/upload/t_cover_big/${imageId}.jpg`
}

export const gameFormErrorMessages: Record<string, string> = {
    TITLE_REQUIRED: 'Podaj tytuł gry.',
    RELEASE_YEAR_REQUIRED: 'Podaj rok wydania.',
    RELEASE_YEAR_INVALID: 'Podany rok wydania jest niepoprawny.',
    GAME_TITLE_YEAR_ALREADY_EXISTS: 'Gra o tym tytule i roku już istnieje.',
    GAME_NOT_FOUND: 'Nie znaleziono gry.',
}

export const AddGameForm = () => {
    const createGame = useMutation(api.games.create)

    const [title, setTitle] = useState('')
    const [releaseYear, setReleaseYear] = useState<number | ''>('')
    const [coverImageUrl, setCoverImageUrl] = useState('')
    const [errorCode, setErrorCode] = useState<string | null>(null)

    const errorMessage =
        errorCode !== null
            ? (gameFormErrorMessages[errorCode] ?? 'Wystąpił nieoczekiwany błąd.')
            : null

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setErrorCode(null)

        try {
            await createGame({
                title,
                releaseYear: releaseYear === '' ? undefined : releaseYear,
                coverImageUrl: coverImageUrl.length > 0 ? coverImageUrl : undefined,
            })

            setTitle('')
            setReleaseYear('')
            setCoverImageUrl('')
        } catch (error) {
            if (error instanceof ConvexError) {
                setErrorCode(String(error.data))
                return
            }

            setErrorCode('UNKNOWN_ERROR')
        }
    }

    const handlePickFromIgdb = (igdbGame: IgdbGame) => {
        setTitle(igdbGame.name)
        setReleaseYear(toReleaseYear(igdbGame.first_release_date))
        setCoverImageUrl(toCoverUrl(igdbGame.cover?.image_id))
        setErrorCode(null)
    }

    return (
        <div className="border-text mb-5 border-2 p-5">
            <h1 className="text-4xl font-bold">Dodaj grę</h1>

            <Waiter>
                <IgdbGamePicker onPick={handlePickFromIgdb} />
            </Waiter>

            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        placeholder="Tytuł gry"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                    />
                </div>

                <div>
                    <input
                        type="number"
                        placeholder="Rok wydania"
                        value={releaseYear}
                        onChange={(event) =>
                            setReleaseYear(
                                event.target.value === ''
                                    ? ''
                                    : Number(event.target.value),
                            )
                        }
                    />
                </div>

                <div>
                    <input
                        placeholder="Cover URL (opcjonalnie)"
                        value={coverImageUrl}
                        onChange={(event) => setCoverImageUrl(event.target.value)}
                    />
                </div>
                {coverImageUrl.length > 0 ? (
                    <div className="mt-2">
                        <img
                            src={coverImageUrl}
                            alt={`Okładka: ${title.length > 0 ? title : 'gra'}`}
                            className="h-32 w-24 object-cover"
                            loading="lazy"
                        />
                    </div>
                ) : null}

                <Button type="submit">Dodaj grę</Button>

                {errorMessage && <div className="text-red-800">{errorMessage}</div>}
            </form>
        </div>
    )
}
