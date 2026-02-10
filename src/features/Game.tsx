import { SignedIn } from '@clerk/clerk-react'
import { useMutation } from 'convex/react'
import { ConvexError } from 'convex/values'
import { useEffect, useState } from 'react'
import { Button } from '~/components/Button'
import { api } from '../../convex/_generated/api'
import { type Doc } from '../../convex/_generated/dataModel'
import { EditGameForm } from './EditGameForm'

const PROGRESS_STATUS_OPTIONS = [
    'backlog',
    'playing',
    'completed',
    'done',
    'dropped',
] as const
type ProgressStatus = (typeof PROGRESS_STATUS_OPTIONS)[number]

type LibraryEntry = Doc<'libraryEntries'> & {
    game: Doc<'games'> | null
}

type Props = {
    game: Doc<'games'>
    libraryEntry?: LibraryEntry
}

export const Game = ({ game, libraryEntry }: Props) => {
    const removeGame = useMutation(api.games.remove)
    const addToLibrary = useMutation(api.library.addToLibrary)
    const updateLibraryEntry = useMutation(api.library.updateLibraryEntry)
    const removeFromLibrary = useMutation(api.library.removeFromLibrary)

    const [isEditing, setIsEditing] = useState(false)
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
                platforms: libraryEntry.platforms,
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

    return (
        <li className="border-text flex items-center gap-2 border-b-2 p-5">
            {isEditing ? (
                <EditGameForm game={game} onDone={() => setIsEditing(false)} />
            ) : (
                <div className="flex w-full gap-4">
                    {game.coverImageUrl ? (
                        <img
                            src={game.coverImageUrl}
                            alt={`Okładka: ${game.title}`}
                            className="h-16 w-12 object-cover"
                            loading="lazy"
                        />
                    ) : null}

                    <div className="flex-1">
                        <div className="font-semibold">{game.title}</div>
                        <div className="text-sm opacity-70">{game.releaseYear}</div>
                    </div>
                    <Button type="button" onClick={() => setIsEditing(true)}>
                        Edytuj
                    </Button>
                    <SignedIn>
                        {!libraryEntry ? (
                            <Button
                                type="button"
                                onClick={() => void handleAddToLibrary()}
                            >
                                Dodaj do biblioteki
                            </Button>
                        ) : (
                            <div className="border p-2">
                                <div className="mb-2 text-sm">W bibliotece</div>
                                <div className="mb-2">
                                    <label>
                                        Status:
                                        <select
                                            value={libraryStatus}
                                            onChange={(event) =>
                                                setLibraryStatus(
                                                    event.target.value as ProgressStatus,
                                                )
                                            }
                                            className="ml-2"
                                        >
                                            {PROGRESS_STATUS_OPTIONS.map((status) => (
                                                <option key={status} value={status}>
                                                    {status}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </div>
                                <div className="mb-2">
                                    <label>
                                        Ocena:
                                        <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={libraryRating}
                                            onChange={(event) =>
                                                setLibraryRating(
                                                    Number(event.target.value),
                                                )
                                            }
                                            className="ml-2 w-16"
                                        />
                                    </label>
                                </div>
                                <div className="mb-2">
                                    <label>
                                        Wants to play:
                                        <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={libraryWantsToPlay}
                                            onChange={(event) =>
                                                setLibraryWantsToPlay(
                                                    Number(event.target.value),
                                                )
                                            }
                                            className="ml-2 w-16"
                                        />
                                    </label>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        onClick={() => void handleSaveLibrary()}
                                    >
                                        Zapisz
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => void handleRemoveFromLibrary()}
                                    >
                                        Usuń z biblioteki
                                    </Button>
                                </div>
                            </div>
                        )}
                    </SignedIn>
                    <Button
                        type="button"
                        onClick={() => {
                            const shouldDelete = window.confirm('Usunąć tę grę?')
                            if (!shouldDelete) return
                            void removeGame({ gameId: game._id })
                        }}
                    >
                        Usuń
                    </Button>
                    {libraryError ? (
                        <div className="text-red-800">{libraryError}</div>
                    ) : null}
                    {libraryInfo ? (
                        <div className="text-green-700">{libraryInfo}</div>
                    ) : null}
                </div>
            )}
        </li>
    )
}
