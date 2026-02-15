import { PlusIcon } from '@phosphor-icons/react'
import { useMutation } from 'convex/react'
import { ConvexError } from 'convex/values'
import { useState } from 'react'
import type { IgdbGame } from '~/api/IgdbGame'
import { Button } from '~/components/Button'
import { CoverPreview } from '~/components/CoverPreview'
import { Form } from '~/components/Form'
import { FormActions } from '~/components/FormActions'
import { FormLabel } from '~/components/FormLabel'
import { Input } from '~/components/Input'
import { useToast } from '~/components/Toast'
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
    FORBIDDEN: 'Brak uprawnień do zarządzania grami.',
    UNAUTHORIZED: 'Musisz być zalogowany.',
}

type Props = {
    canManageGames: boolean | undefined
    onDone?: () => void
}

export const AddGameForm = ({ canManageGames, onDone }: Props) => {
    const createGame = useMutation(api.games.create)
    const { success, error: showError } = useToast()

    const [title, setTitle] = useState('')
    const [releaseYear, setReleaseYear] = useState<number | ''>('')
    const [coverImageUrl, setCoverImageUrl] = useState('')

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()

        try {
            await createGame({
                title,
                releaseYear: releaseYear === '' ? Number.NaN : releaseYear,
                coverImageUrl: coverImageUrl.length > 0 ? coverImageUrl : undefined,
            })

            setTitle('')
            setReleaseYear('')
            setCoverImageUrl('')
            success('Gra została dodana.')
            onDone?.()
        } catch (error) {
            if (error instanceof ConvexError) {
                const code = String(error.data)
                showError(gameFormErrorMessages[code] ?? 'Wystąpił nieoczekiwany błąd.')
                return
            }

            showError('Wystąpił nieoczekiwany błąd.')
        }
    }

    const handlePickFromIgdb = (igdbGame: IgdbGame) => {
        setTitle(igdbGame.name)
        setReleaseYear(toReleaseYear(igdbGame.first_release_date))
        setCoverImageUrl(toCoverUrl(igdbGame.cover?.image_id))
    }

    if (!canManageGames) {
        return null
    }

    return (
        <div className="space-y-4">
            <Waiter>
                <IgdbGamePicker onPick={handlePickFromIgdb} />
            </Waiter>

            <Form onSubmit={handleSubmit}>
                <div>
                    <FormLabel htmlFor="game-title">Tytuł gry</FormLabel>
                    <Input
                        id="game-title"
                        placeholder="Baldur's Gate 3"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                    />
                </div>

                <div>
                    <FormLabel htmlFor="game-release-year">Rok wydania</FormLabel>
                    <Input
                        id="game-release-year"
                        type="number"
                        placeholder="2023"
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

                <div className="grid grid-cols-[4rem_minmax(0,1fr)] items-center gap-3">
                    <CoverPreview
                        url={coverImageUrl}
                        title={title}
                        className="justify-self-center"
                    />
                    <div>
                        <FormLabel htmlFor="game-cover-url">
                            Cover URL (opcjonalnie)
                        </FormLabel>
                        <Input
                            id="game-cover-url"
                            type="url"
                            placeholder="https://..."
                            value={coverImageUrl}
                            onChange={(event) => setCoverImageUrl(event.target.value)}
                            autoCapitalize="off"
                            autoCorrect="off"
                            spellCheck={false}
                        />
                    </div>
                </div>

                <FormActions align="center">
                    <Button type="submit" startIcon={PlusIcon} startIconWeight="bold">
                        Dodaj grę
                    </Button>
                </FormActions>
            </Form>
        </div>
    )
}
