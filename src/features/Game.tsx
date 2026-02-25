import { SignedIn } from '@clerk/clerk-react'
import { PencilSimpleIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react'
import { useMutation } from 'convex/react'
import { ConvexError } from 'convex/values'
import { useState } from 'react'
import { Button } from '~/components/Button'
import { Drawer } from '~/components/Drawer'
import { FormActions } from '~/components/FormActions'
import { useToast } from '~/components/Toast'
import { formatIsoDatePl } from '~/utils/date'
import { api } from '../../convex/_generated/api'
import { type Doc, type Id } from '../../convex/_generated/dataModel'
import { EditGameForm } from './EditGameForm'
import { LibraryEditDrawer } from './LibraryEditDrawer'
import {
    type Platform,
    type ProgressStatus,
    toLibraryErrorMessage,
} from './libraryShared'

type LibraryEntry = {
    _id: Id<'libraryEntries'>
    gameId: Id<'games'>
    note?: string
    platforms: ReadonlyArray<Platform>
    rating: number
    wantsToPlay: number
    progressStatus: ProgressStatus
    game: {
        title: string
        releaseDate: string
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
    const { success, error: showError } = useToast()
    const displayReleaseDate =
        game.releaseDate ??
        (game.releaseYear !== undefined ? `${game.releaseYear}-01-01` : '')

    const [isEditing, setIsEditing] = useState(false)
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
    const [isLibraryEditOpen, setIsLibraryEditOpen] = useState(false)

    const handleAddToLibrary = async () => {
        try {
            await addToLibrary({
                gameId: game._id,
                note: '',
                platforms: ['steam'],
                rating: 50,
                wantsToPlay: 50,
                progressStatus: 'backlog',
            })
            success('Dodano do kupki.')
        } catch (error) {
            if (error instanceof ConvexError) {
                const errorCode = String(error.data)
                showError(
                    toLibraryErrorMessage(errorCode) ??
                        'Nie udało się dodać gry do kupki.',
                )
                return
            }
            showError('Nie udało się dodać gry do kupki.')
        }
    }

    const handleRemoveGame = async () => {
        try {
            await removeGame({ gameId: game._id })
            setIsDeleteConfirmOpen(false)
            success('Usunięto grę.')
        } catch (error) {
            if (error instanceof ConvexError) {
                const code = String(error.data)
                if (code === 'FORBIDDEN') {
                    showError('Brak uprawnień do usuwania gier.')
                    return
                }
                if (code === 'UNAUTHORIZED') {
                    showError('Musisz być zalogowany.')
                    return
                }
                if (code === 'GAME_NOT_FOUND') {
                    showError('Nie znaleziono gry.')
                    return
                }
            }
            showError('Nie udało się usunąć gry.')
        }
    }

    return (
        <li className="hover:bg-text/6 rounded-lg p-4 transition-colors duration-200">
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
                    <div className="text-text -mt-2 truncate">{game.title}</div>
                    <div className="text-text/70 text-sm">
                        {formatIsoDatePl(displayReleaseDate)}
                    </div>
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                    <SignedIn>
                        {!libraryEntry ? (
                            <Button
                                type="button"
                                variant="ghost"
                                startIcon={PlusIcon}
                                startIconWeight="bold"
                                title="Dodaj do kupki"
                                onClick={() => void handleAddToLibrary()}
                            >
                                Dodaj do kupki
                            </Button>
                        ) : (
                            <>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    title="Edytuj"
                                    onClick={() => setIsLibraryEditOpen(true)}
                                >
                                    Na kupce
                                </Button>
                            </>
                        )}
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
                        variant="ghost"
                        title="Anuluj usuwanie gry"
                        onClick={() => setIsDeleteConfirmOpen(false)}
                    >
                        Anuluj
                    </Button>
                </FormActions>
            </Drawer>
            <SignedIn>
                <LibraryEditDrawer
                    isOpen={isLibraryEditOpen}
                    onClose={() => setIsLibraryEditOpen(false)}
                    entry={libraryEntry ?? null}
                />
            </SignedIn>
        </li>
    )
}
