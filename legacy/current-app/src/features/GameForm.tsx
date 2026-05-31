import { FloppyDiskIcon } from '@phosphor-icons/react'
import { useAction } from 'convex/react'
import { ConvexError } from 'convex/values'
import { useState } from 'react'
import { Button } from '~/components/Button'
import { CoverPreview } from '~/components/CoverPreview'
import { Form } from '~/components/Form'
import { FormActions } from '~/components/FormActions'
import { FormLabel } from '~/components/FormLabel'
import { Input } from '~/components/Input'
import { useToast } from '~/components/Toast'
import { api } from '../../convex/_generated/api'

export const gameFormErrorMessages = {
    TITLE_REQUIRED: 'Podaj tytuł gry.',
    RELEASE_DATE_REQUIRED: 'Podaj datę premiery.',
    RELEASE_DATE_INVALID: 'Podana data premiery jest niepoprawna.',
    GAME_TITLE_DATE_ALREADY_EXISTS: 'Gra o tym tytule i dacie już istnieje.',
    GAME_NOT_FOUND: 'Nie znaleziono gry.',
    COVER_URL_INVALID: 'Podaj poprawny URL okładki (http/https).',
    COVER_FETCH_FAILED: 'Nie udało się pobrać okładki z podanego URL.',
    COVER_NOT_IMAGE: 'Podany URL nie wskazuje na obraz.',
    COVER_TOO_LARGE: 'Okładka jest za duża (maks. 8 MB).',
    FORBIDDEN: 'Brak uprawnień do zarządzania grami.',
    UNAUTHORIZED: 'Musisz być zalogowany.',
} as const

const CONVEX_STORAGE_PATH_SEGMENT = '/api/storage/'

const isConvexStorageUrl = (value: string) => {
    try {
        const parsed = new URL(value)
        return parsed.pathname.includes(CONVEX_STORAGE_PATH_SEGMENT)
    } catch {
        return false
    }
}

type ErrorCode = keyof typeof gameFormErrorMessages | 'UNKNOWN_ERROR'

type Values = {
    title: string
    releaseDate: string
    coverImageUrl: string
}

type Props = {
    initialValues?: Partial<Values>
    submitLabel: string
    onSubmit: (values: {
        title: string
        releaseDate: string
        coverImageUrl?: string
    }) => Promise<void>
}

export const GameForm = ({ initialValues, submitLabel, onSubmit }: Props) => {
    const { error: showError } = useToast()
    const uploadCoverFromUrl = useAction(api.games.uploadCoverFromUrl)
    const [title, setTitle] = useState(initialValues?.title ?? '')
    const [releaseDate, setReleaseDate] = useState(initialValues?.releaseDate ?? '')
    const [coverImageUrl, setCoverImageUrl] = useState(initialValues?.coverImageUrl ?? '')

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()

        try {
            if (releaseDate === '') {
                await onSubmit({ title, releaseDate: '' })
                return
            }

            await onSubmit({
                title,
                releaseDate,
                coverImageUrl:
                    coverImageUrl.trim().length === 0
                        ? undefined
                        : isConvexStorageUrl(coverImageUrl.trim())
                          ? coverImageUrl.trim()
                          : await uploadCoverFromUrl({
                                sourceUrl: coverImageUrl.trim(),
                            }),
            })
        } catch (error) {
            if (error instanceof ConvexError) {
                const code = String(error.data) as ErrorCode
                showError(
                    code in gameFormErrorMessages
                        ? gameFormErrorMessages[
                              code as keyof typeof gameFormErrorMessages
                          ]
                        : 'Wystąpił nieoczekiwany błąd.',
                )
                return
            }
            showError('Wystąpił nieoczekiwany błąd.')
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
                <FormLabel htmlFor="game-form-release-date">Data premiery</FormLabel>
                <Input
                    id="game-form-release-date"
                    type="date"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
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
        </Form>
    )
}
