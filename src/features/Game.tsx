import { SignedIn } from '@clerk/clerk-react'
import { PencilSimpleIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react'
import { useMutation } from 'convex/react'
import { ConvexError } from 'convex/values'
import { useState } from 'react'
import { Button } from '~/components/Button'
import { Drawer } from '~/components/Drawer'
import { FormActions } from '~/components/FormActions'
import { api } from '../../convex/_generated/api'
import { type Doc, type Id } from '../../convex/_generated/dataModel'
import { EditGameForm } from './EditGameForm'
import { LibraryEditDrawer } from './LibraryEditDrawer'
import { type Platform, type ProgressStatus } from './libraryShared'

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

    const [isEditing, setIsEditing] = useState(false)
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
    const [isLibraryEditOpen, setIsLibraryEditOpen] = useState(false)
    const [libraryInfo, setLibraryInfo] = useState<string | null>(null)
    const [libraryError, setLibraryError] = useState<string | null>(null)

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
            setLibraryInfo('Dodano do kupki.')
        } catch (error) {
            if (error instanceof ConvexError) {
                const code = String(error.data)
                if (code === 'LIB_ENTRY_ALREADY_EXISTS') {
                    setLibraryError('Gra jest już w Twojej kupce.')
                    return
                }
                if (code === 'UNAUTHORIZED') {
                    setLibraryError('Musisz być zalogowany.')
                    return
                }
            }
            setLibraryError('Nie udało się dodać gry do kupki.')
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
                    <div className="text-text -mt-2 truncate">{game.title}</div>
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
