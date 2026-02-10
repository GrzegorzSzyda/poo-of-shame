import { ConvexError } from 'convex/values'
import { useState } from 'react'
import { Button } from '~/components/Button'

export const gameFormErrorMessages = {
    TITLE_REQUIRED: 'Podaj tytuł gry.',
    RELEASE_YEAR_REQUIRED: 'Podaj rok wydania.',
    RELEASE_YEAR_INVALID: 'Podany rok wydania jest niepoprawny.',
    GAME_TITLE_YEAR_ALREADY_EXISTS: 'Gra o tym tytule i roku już istnieje.',
    GAME_NOT_FOUND: 'Nie znaleziono gry.',
} as const

type ErrorCode = keyof typeof gameFormErrorMessages | 'UNKNOWN_ERROR'

type Values = {
    title: string
    releaseYear: number | ''
    coverImageUrl: string
}

type Props = {
    initialValues?: Partial<Values>
    submitLabel: string
    onSubmit: (values: {
        title: string
        releaseYear: number
        coverImageUrl?: string
    }) => Promise<void>
}

export const GameForm = ({ initialValues, submitLabel, onSubmit }: Props) => {
    const [title, setTitle] = useState(initialValues?.title ?? '')
    const [releaseYear, setReleaseYear] = useState<number | ''>(
        initialValues?.releaseYear ?? '',
    )
    const [coverImageUrl, setCoverImageUrl] = useState(initialValues?.coverImageUrl ?? '')
    const [errorCode, setErrorCode] = useState<ErrorCode | null>(null)

    const errorMessage =
        errorCode !== null
            ? (gameFormErrorMessages[errorCode as keyof typeof gameFormErrorMessages] ??
              'Wystąpił nieoczekiwany błąd.')
            : null

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setErrorCode(null)

        try {
            if (releaseYear === '') {
                // pozwól backendowi zwrócić RELEASE_YEAR_REQUIRED (albo możesz tu early return)
                await onSubmit({ title, releaseYear: NaN })
                return
            }

            await onSubmit({
                title,
                releaseYear,
                coverImageUrl: coverImageUrl.length > 0 ? coverImageUrl : undefined,
            })
        } catch (error) {
            if (error instanceof ConvexError) {
                setErrorCode(String(error.data) as ErrorCode)
                return
            }
            setErrorCode('UNKNOWN_ERROR')
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <input
                    placeholder="Tytuł gry"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            <div>
                <input
                    type="number"
                    placeholder="Rok wydania"
                    value={releaseYear}
                    onChange={(e) =>
                        setReleaseYear(
                            e.target.value === '' ? '' : Number(e.target.value),
                        )
                    }
                />
            </div>

            <div>
                <input
                    placeholder="Cover URL (opcjonalnie)"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                />
            </div>

            <Button type="submit">{submitLabel}</Button>
            {errorMessage && <div className="text-red-800">{errorMessage}</div>}
        </form>
    )
}
