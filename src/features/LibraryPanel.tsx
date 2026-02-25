import {
    CheckCircleIcon,
    GameControllerIcon,
    ListBulletsIcon,
    PencilSimpleIcon,
    StarIcon,
    TriangleIcon,
    TrophyIcon,
    XCircleIcon,
} from '@phosphor-icons/react'
import { useMutation, usePaginatedQuery, useQuery } from 'convex/react'
import { useMemo, useState } from 'react'
import { Button } from '~/components/Button'
import { H1 } from '~/components/H1'
import { useToast } from '~/components/Toast'
import { formatIsoDatePl } from '~/utils/date'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { LibraryEditDrawer } from './LibraryEditDrawer'
import { LibraryGameSearch } from './LibraryGameSearch'
import { PlatformPillList } from './PlatformPills'
import {
    type Platform,
    type ProgressStatus,
    parseLibraryErrorCode,
    progressStatusLabel,
    progressStatusTextTone,
    progressStatusUsesWantsToPlay,
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

type GameSearchItem = {
    _id: Id<'games'>
    title: string
    releaseDate?: string
    releaseYear?: number
    coverImageUrl?: string
}

type Props = {
    authReady: boolean
}

const statusIcon = (status: ProgressStatus) => {
    switch (status) {
        case 'backlog':
            return TriangleIcon
        case 'playing':
            return GameControllerIcon
        case 'completed':
            return CheckCircleIcon
        case 'done':
            return TrophyIcon
        case 'dropped':
            return XCircleIcon
    }
}

const toDisplayReleaseDate = (releaseDate?: string, releaseYear?: number) =>
    releaseDate ?? (releaseYear !== undefined ? `${releaseYear}-01-01` : 'brak daty')

export const LibraryPanel = ({ authReady }: Props) => {
    const { success, error: showError } = useToast()
    const games = useQuery(api.games.listAll, authReady ? {} : 'skip')
    const addToLibrary = useMutation(api.library.addToLibrary)
    const {
        results: entries,
        status: entriesStatus,
        loadMore: loadMoreEntries,
    } = usePaginatedQuery(api.library.listMyLibrary, authReady ? {} : 'skip', {
        initialNumItems: 50,
    })

    const [addingGameId, setAddingGameId] = useState<string | null>(null)
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
    const [editingEntry, setEditingEntry] = useState<LibraryEntry | null>(null)

    const gamesById = useMemo(() => {
        const map = new Map<string, string>()
        games?.forEach((game) => {
            const releaseDate = toDisplayReleaseDate(game.releaseDate, game.releaseYear)
            map.set(game._id, `${game.title} (${formatIsoDatePl(releaseDate)})`)
        })
        return map
    }, [games])

    const libraryGameIds = useMemo(
        () => new Set(entries.map((entry) => String(entry.gameId))),
        [entries],
    )

    const handleAddFromSearch = async (game: GameSearchItem) => {
        setAddingGameId(game._id)

        try {
            const entryId = await addToLibrary({
                gameId: game._id,
                note: '',
                platforms: [],
                rating: 50,
                wantsToPlay: 50,
                progressStatus: 'backlog',
            })

            setEditingEntry({
                _id: entryId,
                gameId: game._id,
                note: '',
                platforms: [],
                rating: 50,
                wantsToPlay: 50,
                progressStatus: 'backlog',
                game: {
                    title: game.title,
                    releaseDate: toDisplayReleaseDate(game.releaseDate, game.releaseYear),
                    coverImageUrl: game.coverImageUrl,
                },
            })
            setIsEditDrawerOpen(true)
            success('Dodano do kupki.')
        } catch (error) {
            const errorCode = parseLibraryErrorCode(error)
            showError(toLibraryErrorMessage(errorCode) ?? 'Wystąpił nieoczekiwany błąd.')
        } finally {
            setAddingGameId(null)
        }
    }

    return (
        <section className="space-y-4">
            <div className="grid grid-cols-[max-content_minmax(0,1fr)] items-start gap-12">
                <H1 startIcon={ListBulletsIcon}>Moja kupka</H1>
                <LibraryGameSearch
                    className="w-full"
                    games={games}
                    libraryGameIds={libraryGameIds}
                    addingGameId={addingGameId}
                    onAdd={(game) => void handleAddFromSearch(game)}
                />
            </div>

            {!entries ? <div className="text-text/70">Ładowanie kupki...</div> : null}

            {entries.length === 0 ? (
                <div className="border-text/20 bg-bg/30 rounded-lg border p-6">
                    <p className="text-text/80">Twoja kupka jest pusta.</p>
                </div>
            ) : (
                <>
                    <div className="text-text/75 text-sm">
                        Liczba wpisów: {entries.length}
                    </div>
                    <ul className="space-y-3">
                        {entries.map((entry) => {
                            const entryTitle = entry.game
                                ? entry.game.title
                                : (gamesById.get(entry.gameId) ?? 'Brak danych')
                            const entryDate = entry.game?.releaseDate
                            const ratingOnTen = (
                                Math.round((entry.rating / 10) * 10) / 10
                            ).toFixed(entry.rating % 10 === 0 ? 0 : 1)
                            const wantsOnTen = (
                                Math.round((entry.wantsToPlay / 10) * 10) / 10
                            ).toFixed(entry.wantsToPlay % 10 === 0 ? 0 : 1)
                            const StatusIcon = statusIcon(entry.progressStatus)

                            return (
                                <li
                                    key={entry._id}
                                    className="hover:bg-text/6 rounded-lg p-4 transition-colors duration-200"
                                >
                                    <div className="flex items-start gap-4">
                                        {entry.game?.coverImageUrl ? (
                                            <img
                                                src={entry.game.coverImageUrl}
                                                alt={`Okładka: ${entryTitle}`}
                                                className="h-24 w-16 shrink-0 rounded object-cover"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="bg-bg text-text/60 border-text/20 flex h-24 w-16 shrink-0 items-center justify-center rounded border text-xs">
                                                brak
                                            </div>
                                        )}

                                        <div className="min-w-0 flex-1">
                                            <div className="text-text -mt-2 flex flex-wrap items-center gap-y-1">
                                                <span className="inline-flex items-baseline gap-1 truncate">
                                                    <span className="truncate">
                                                        {entryTitle}
                                                    </span>
                                                    <span className="text-text/70 text-sm">
                                                        (
                                                        {formatIsoDatePl(entryDate ?? '')}
                                                        )
                                                    </span>
                                                </span>
                                                <span
                                                    className={`ml-5 inline-flex items-center gap-1 text-xs tracking-wide uppercase ${progressStatusTextTone(entry.progressStatus)}`}
                                                >
                                                    <StatusIcon className="h-3.5 w-3.5" />
                                                    {progressStatusLabel(
                                                        entry.progressStatus,
                                                    )}
                                                </span>
                                            </div>
                                            <div className="mt-3">
                                                <PlatformPillList
                                                    platforms={entry.platforms}
                                                />
                                            </div>
                                            <div className="text-text/80 mt-3 flex flex-wrap items-center gap-3 text-sm">
                                                {progressStatusUsesWantsToPlay(
                                                    entry.progressStatus,
                                                ) ? (
                                                    <span
                                                        className="text-text/85 inline-flex items-center gap-1.5"
                                                        title={`Zainteresowanie: ${wantsOnTen}/10`}
                                                    >
                                                        <GameControllerIcon
                                                            className="h-4.5 w-4.5 text-teal-300"
                                                            weight="fill"
                                                        />
                                                        {wantsOnTen}/10
                                                    </span>
                                                ) : (
                                                    <span
                                                        className="text-text/85 inline-flex items-center gap-1.5"
                                                        title={`Ocena: ${ratingOnTen}/10`}
                                                    >
                                                        <StarIcon
                                                            className="h-4.5 w-4.5 text-amber-300"
                                                            weight="fill"
                                                        />
                                                        {ratingOnTen}/10
                                                    </span>
                                                )}
                                            </div>
                                            {entry.note ? (
                                                <p className="text-text/85 mt-3 text-sm break-words whitespace-pre-wrap">
                                                    {entry.note}
                                                </p>
                                            ) : null}
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                startIcon={PencilSimpleIcon}
                                                title="Edytuj"
                                                onClick={() => {
                                                    setEditingEntry(entry as LibraryEntry)
                                                    setIsEditDrawerOpen(true)
                                                }}
                                            >
                                                <span className="sr-only">Edytuj</span>
                                            </Button>
                                        </div>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                </>
            )}

            {entriesStatus === 'CanLoadMore' ? (
                <Button
                    type="button"
                    className="mt-1"
                    variant="ghost"
                    onClick={() => loadMoreEntries(50)}
                >
                    Załaduj więcej wpisów
                </Button>
            ) : null}

            <LibraryEditDrawer
                isOpen={isEditDrawerOpen}
                onClose={() => {
                    setEditingEntry(null)
                    setIsEditDrawerOpen(false)
                }}
                entry={editingEntry}
            />
        </section>
    )
}
