import { FloppyDiskIcon } from '@phosphor-icons/react'
import { ConvexError } from 'convex/values'
import { useState } from 'react'
import { Button } from '~/components/Button'
import { CoverPreview } from '~/components/CoverPreview'
import { Form } from '~/components/Form'
import { FormActions } from '~/components/FormActions'
import { FormLabel } from '~/components/FormLabel'
import { Input } from '~/components/Input'

export const gameFormErrorMessages = {
    TITLE_REQUIRED: 'Podaj tytuł gry.',
    RELEASE_YEAR_REQUIRED: 'Podaj rok wydania.',
    RELEASE_YEAR_INVALID: 'Podany rok wydania jest niepoprawny.',
    GAME_TITLE_YEAR_ALREADY_EXISTS: 'Gra o tym tytule i roku już istnieje.',
    GAME_NOT_FOUND: 'Nie znaleziono gry.',
    FORBIDDEN: 'Brak uprawnień do zarządzania grami.',
    UNAUTHORIZED: 'Musisz być zalogowany.',
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
                // Backend zwróci RELEASE_YEAR_INVALID dla NaN.
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
        <Form onSubmit={handleSubmit}>
            <div>
                <FormLabel htmlFor="game-form-title">Tytuł gry</FormLabel>
                <Input
                    id="game-form-title"
                    placeholder="Hollow Knight"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            <div>
                <FormLabel htmlFor="game-form-release-year">Rok wydania</FormLabel>
                <Input
                    id="game-form-release-year"
                    type="number"
                    placeholder="2017"
                    value={releaseYear}
                    onChange={(e) =>
                        setReleaseYear(
                            e.target.value === '' ? '' : Number(e.target.value),
                        )
                    }
                />
            </div>

            <div className="grid grid-cols-[4rem_minmax(0,1fr)] items-center gap-3">
                <CoverPreview
                    url={coverImageUrl}
                    title={title}
                    className="justify-self-center"
                />
                <div>
                    <FormLabel htmlFor="game-form-cover-image">
                        Cover URL (opcjonalnie)
                    </FormLabel>
                    <Input
                        id="game-form-cover-image"
                        type="url"
                        placeholder="https://..."
                        value={coverImageUrl}
                        onChange={(e) => setCoverImageUrl(e.target.value)}
                        autoCapitalize="off"
                        autoCorrect="off"
                        spellCheck={false}
                    />
                </div>
            </div>

            <FormActions align="start">
                <Button type="submit" startIcon={FloppyDiskIcon}>
                    {submitLabel}
                </Button>
            </FormActions>
            {errorMessage && <div className="text-red-800">{errorMessage}</div>}
        </Form>
    )
}
