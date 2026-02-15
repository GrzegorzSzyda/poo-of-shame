import { SignedIn } from '@clerk/clerk-react'
import {
    FloppyDiskIcon,
    PencilSimpleIcon,
    PlusIcon,
    TrashIcon,
    XCircleIcon,
} from '@phosphor-icons/react'
import { useMutation } from 'convex/react'
import { ConvexError } from 'convex/values'
import { useEffect, useState } from 'react'
import { Button } from '~/components/Button'
import { Drawer } from '~/components/Drawer'
import { FormActions } from '~/components/FormActions'
import { FormLabel } from '~/components/FormLabel'
import { Input } from '~/components/Input'
import { Select } from '~/components/Select'
import { api } from '../../convex/_generated/api'
import { type Doc, type Id } from '../../convex/_generated/dataModel'
import { EditGameForm } from './EditGameForm'

const PROGRESS_STATUS_OPTIONS = [
    'backlog',
    'playing',
    'completed',
    'done',
    'dropped',
] as const
type ProgressStatus = (typeof PROGRESS_STATUS_OPTIONS)[number]
type Platform =
    | 'ps_disc'
    | 'ps_store'
    | 'ps_plus'
    | 'steam'
    | 'epic'
    | 'gog'
    | 'amazon_gaming'
    | 'ubisoft_connect'
    | 'xbox'
    | 'switch'
    | 'other'

type LibraryEntry = {
    _id: Id<'libraryEntries'>
    gameId: Id<'games'>
    platforms: ReadonlyArray<Platform>
    rating: number
    wantsToPlay: number
    progressStatus: ProgressStatus
    game: {
        title: string
        releaseYear: number
        coverImageUrl?: string
    } | null
}

type Props = {
    canManageGames: boolean | undefined
    game: Doc<'games'>
    libraryEntry?: LibraryEntry
}

export const Game = ({ canManageGames, game, libraryEntry }: Props) => {
    const removeGame = useMutation(api.games.remove)
    const addToLibrary = useMutation(api.library.addToLibrary)
    const updateLibraryEntry = useMutation(api.library.updateLibraryEntry)
    const removeFromLibrary = useMutation(api.library.removeFromLibrary)

    const [isEditing, setIsEditing] = useState(false)
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
    const [libraryStatus, setLibraryStatus] = useState<ProgressStatus>('backlog')
    const [libraryRating, setLibraryRating] = useState(50)
    const [libraryWantsToPlay, setLibraryWantsToPlay] = useState(50)
    const [libraryInfo, setLibraryInfo] = useState<string | null>(null)
    const [libraryError, setLibraryError] = useState<string | null>(null)

    useEffect(() => {
        if (!libraryEntry) return
        setLibraryStatus(libraryEntry.progressStatus)
        setLibraryRating(libraryEntry.rating)
        setLibraryWantsToPlay(libraryEntry.wantsToPlay)
    }, [libraryEntry])

    const handleAddToLibrary = async () => {
        setLibraryInfo(null)
        setLibraryError(null)
        try {
            await addToLibrary({
                gameId: game._id,
                platforms: ['steam'],
                rating: 50,
                wantsToPlay: 50,
                progressStatus: 'backlog',
            })
            setLibraryInfo('Dodano do biblioteki.')
        } catch (error) {
            if (error instanceof ConvexError) {
                const code = String(error.data)
                if (code === 'LIB_ENTRY_ALREADY_EXISTS') {
                    setLibraryError('Gra jest już w Twojej bibliotece.')
                    return
                }
                if (code === 'UNAUTHORIZED') {
                    setLibraryError('Musisz być zalogowany.')
                    return
                }
            }
            setLibraryError('Nie udało się dodać gry do biblioteki.')
        }
    }

    const handleSaveLibrary = async () => {
        if (!libraryEntry) return
        setLibraryInfo(null)
        setLibraryError(null)

        try {
            await updateLibraryEntry({
                entryId: libraryEntry._id,
                platforms: [...libraryEntry.platforms],
                rating: libraryRating,
                wantsToPlay: libraryWantsToPlay,
                progressStatus: libraryStatus,
            })
            setLibraryInfo('Zapisano zmiany.')
        } catch (error) {
            if (error instanceof ConvexError) {
                const code = String(error.data)
                if (code === 'RATING_INVALID' || code === 'WANTS_TO_PLAY_INVALID') {
                    setLibraryError('Ocena i wantsToPlay muszą być liczbami 0-100.')
                    return
                }
            }
            setLibraryError('Nie udało się zapisać zmian.')
        }
    }

    const handleRemoveFromLibrary = async () => {
        if (!libraryEntry) return
        setLibraryInfo(null)
        setLibraryError(null)
        try {
            await removeFromLibrary({ entryId: libraryEntry._id })
            setLibraryInfo('Usunięto z biblioteki.')
        } catch (error) {
            if (error instanceof ConvexError) {
                const code = String(error.data)
                if (code === 'LIB_ENTRY_NOT_FOUND') {
                    setLibraryError('Wpis biblioteki nie istnieje.')
                    return
                }
                if (code === 'FORBIDDEN') {
                    setLibraryError('Brak dostępu do wpisu biblioteki.')
                    return
                }
            }
            setLibraryError('Nie udało się usunąć z biblioteki.')
        }
    }

    const handleRemoveGame = async () => {
        await removeGame({ gameId: game._id })
        setIsDeleteConfirmOpen(false)
    }

    return (
        <li className="border-text/20 bg-bg/30 rounded-lg border p-4">
            <div className="flex items-start gap-4">
                {game.coverImageUrl ? (
                    <img
                        src={game.coverImageUrl}
                        alt={`Okładka: ${game.title}`}
                        className="h-24 w-16 shrink-0 rounded object-cover"
                        loading="lazy"
                    />
                ) : (
                    <div className="bg-bg text-text/60 border-text/20 flex h-24 w-16 shrink-0 items-center justify-center rounded border text-xs">
                        brak
                    </div>
                )}

                <div className="min-w-0 flex-1">
                    <div className="text-text truncate">{game.title}</div>
                    <div className="text-text/70 text-sm">{game.releaseYear}</div>
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                    <SignedIn>
                        {!libraryEntry ? (
                            <Button
                                type="button"
                                variant="ghost"
                                startIcon={PlusIcon}
                                title="Dodaj do kupki"
                                onClick={() => void handleAddToLibrary()}
                            >
                                Dodaj do kupki
                            </Button>
                        ) : null}
                    </SignedIn>
                    {canManageGames ? (
                        <Button
                            type="button"
                            variant="ghost"
                            startIcon={PencilSimpleIcon}
                            title="Edytuj grę"
                            onClick={() => setIsEditing(true)}
                        >
                            <span className="sr-only">Edytuj</span>
                        </Button>
                    ) : null}
                    {canManageGames ? (
                        <Button
                            type="button"
                            variant="ghost"
                            startIcon={TrashIcon}
                            title="Usuń grę"
                            onClick={() => setIsDeleteConfirmOpen(true)}
                        >
                            <span className="sr-only">Usuń</span>
                        </Button>
                    ) : null}
                </div>
            </div>
            <SignedIn>
                {libraryEntry ? (
                    <div className="border-text/20 mt-4 rounded-md border p-3">
                        <div className="mb-3 text-sm">W bibliotece</div>
                        <div className="mb-3">
                            <FormLabel htmlFor={`library-status-${game._id}`}>
                                Status
                            </FormLabel>
                            <Select
                                id={`library-status-${game._id}`}
                                value={libraryStatus}
                                onChange={(event) =>
                                    setLibraryStatus(event.target.value as ProgressStatus)
                                }
                            >
                                {PROGRESS_STATUS_OPTIONS.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        <div className="mb-3">
                            <FormLabel htmlFor={`library-rating-${game._id}`}>
                                Ocena
                            </FormLabel>
                            <Input
                                id={`library-rating-${game._id}`}
                                type="number"
                                min={0}
                                max={100}
                                value={libraryRating}
                                onChange={(event) =>
                                    setLibraryRating(Number(event.target.value))
                                }
                            />
                        </div>
                        <div className="mb-3">
                            <FormLabel htmlFor={`library-wants-${game._id}`}>
                                Wants to play
                            </FormLabel>
                            <Input
                                id={`library-wants-${game._id}`}
                                type="number"
                                min={0}
                                max={100}
                                value={libraryWantsToPlay}
                                onChange={(event) =>
                                    setLibraryWantsToPlay(Number(event.target.value))
                                }
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                startIcon={FloppyDiskIcon}
                                title="Zapisz zmiany w bibliotece"
                                onClick={() => void handleSaveLibrary()}
                            >
                                Zapisz
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                startIcon={XCircleIcon}
                                title="Usuń grę z biblioteki"
                                onClick={() => void handleRemoveFromLibrary()}
                            >
                                Usuń z biblioteki
                            </Button>
                        </div>
                    </div>
                ) : null}
            </SignedIn>
            {libraryError ? (
                <div className="mt-3 text-red-800">{libraryError}</div>
            ) : null}
            {libraryInfo ? (
                <div className="mt-3 text-green-700">{libraryInfo}</div>
            ) : null}
            <Drawer
                isOpen={isEditing && Boolean(canManageGames)}
                onClose={() => setIsEditing(false)}
                title={`Edytuj: ${game.title}`}
                titleStartIcon={PencilSimpleIcon}
            >
                <EditGameForm game={game} onDone={() => setIsEditing(false)} />
            </Drawer>
            <Drawer
                isOpen={isDeleteConfirmOpen && Boolean(canManageGames)}
                onClose={() => setIsDeleteConfirmOpen(false)}
                title="Usunąć grę?"
                titleStartIcon={TrashIcon}
            >
                <p className="text-text/80 text-base">
                    Czy na pewno chcesz usunąć grę:
                    <span className="text-text ml-1 font-medium">{game.title}</span>?
                </p>
                <FormActions align="center">
                    <Button
                        type="button"
                        startIcon={TrashIcon}
                        title="Potwierdź usunięcie gry"
                        onClick={() => void handleRemoveGame()}
                    >
                        Usuń
                    </Button>
                    <Button
                        type="button"
                        variant="secondary"
                        title="Anuluj usuwanie gry"
                        onClick={() => setIsDeleteConfirmOpen(false)}
                    >
                        Anuluj
                    </Button>
                </FormActions>
            </Drawer>
        </li>
    )
}
