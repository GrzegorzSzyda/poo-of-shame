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
import { useMutation, usePaginatedQuery } from 'convex/react'
import { cx } from 'cva'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '~/components/Button'
import { CoverImage } from '~/components/CoverImage'
import { H1 } from '~/components/H1'
import { Input } from '~/components/Input'
import { useToast } from '~/components/Toast'
import { formatIsoDatePl } from '~/utils/date'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { LibraryEditDrawer } from './LibraryEditDrawer'
import { LibraryGameSearch } from './LibraryGameSearch'
import { PlatformFilterPills } from './PlatformFilterPills'
import { PlatformPillList } from './PlatformPills'
import { ProgressStatusPills } from './StatusPills'
import {
    PLATFORM_OPTIONS,
    type Platform,
    type ProgressStatus,
    parseLibraryErrorCode,
    progressStatusLabel,
    progressStatusTextTone,
    progressStatusUsesWantsToPlay,
    toLibraryErrorMessage,
} from './libraryShared'
import { useCachedLibraryGames } from './useCachedLibraryGames'

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

const INITIAL_RENDERED_ENTRIES = 40
const RENDERED_ENTRIES_CHUNK = 40

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
    const { games } = useCachedLibraryGames(authReady)
    const addToLibrary = useMutation(api.library.addToLibrary)

    const [addingGameId, setAddingGameId] = useState<string | null>(null)
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false)
    const [editingEntry, setEditingEntry] = useState<LibraryEntry | null>(null)
    const [activeStatus, setActiveStatus] = useState<ProgressStatus>('backlog')
    const [searchValue, setSearchValue] = useState('')
    const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([
        ...PLATFORM_OPTIONS,
    ])
    const [includeNoPlatforms, setIncludeNoPlatforms] = useState(true)
    const renderMoreSentinelRef = useRef<HTMLDivElement | null>(null)
    const [isTopCompressed, setIsTopCompressed] = useState(false)
    const [renderedEntriesCount, setRenderedEntriesCount] = useState(
        INITIAL_RENDERED_ENTRIES,
    )

    const gamesById = useMemo(() => {
        const map = new Map<string, string>()
        games?.forEach((game) => {
            const releaseDate = toDisplayReleaseDate(game.releaseDate, game.releaseYear)
            map.set(game._id, `${game.title} (${formatIsoDatePl(releaseDate)})`)
        })
        return map
    }, [games])

    const normalizedSearch = searchValue.trim()

    const queryFilters = useMemo(
        () => ({
            progressStatuses: [activeStatus],
            platforms: selectedPlatforms,
            includeNoPlatforms: includeNoPlatforms || undefined,
            search: normalizedSearch.length > 0 ? normalizedSearch : undefined,
            sortBy:
                activeStatus === 'backlog'
                    ? ('wants_desc' as const)
                    : activeStatus === 'completed' ||
                        activeStatus === 'done' ||
                        activeStatus === 'dropped'
                      ? ('rating_desc' as const)
                      : ('default' as const),
        }),
        [activeStatus, includeNoPlatforms, normalizedSearch, selectedPlatforms],
    )

    const {
        results: entries,
        status: entriesStatus,
        loadMore: loadMoreEntries,
    } = usePaginatedQuery(
        api.library.listMyLibraryFiltered,
        authReady ? (queryFilters as never) : 'skip',
        {
            initialNumItems: 50,
        },
    )

    useEffect(() => {
        if (entriesStatus === 'CanLoadMore') {
            loadMoreEntries(100)
        }
    }, [entriesStatus, loadMoreEntries])

    const libraryGameIds = useMemo(
        () => new Set(entries.map((entry) => String(entry.gameId))),
        [entries],
    )

    useEffect(() => {
        const updateTopCompression = () => {
            setIsTopCompressed(window.scrollY > 24)
        }

        updateTopCompression()
        window.addEventListener('scroll', updateTopCompression, { passive: true })

        return () => {
            window.removeEventListener('scroll', updateTopCompression)
        }
    }, [])

    useEffect(() => {
        setRenderedEntriesCount(INITIAL_RENDERED_ENTRIES)
    }, [activeStatus, includeNoPlatforms, normalizedSearch, selectedPlatforms])

    useEffect(() => {
        if (renderedEntriesCount >= entries.length) return

        const sentinel = renderMoreSentinelRef.current
        if (!sentinel || typeof window === 'undefined') return

        const loadMoreRenderedEntries = () => {
            setRenderedEntriesCount((current) =>
                Math.min(current + RENDERED_ENTRIES_CHUNK, entries.length),
            )
        }

        if (!('IntersectionObserver' in window)) {
            loadMoreRenderedEntries()
            return
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry?.isIntersecting) return
                loadMoreRenderedEntries()
            },
            {
                rootMargin: '1200px 0px',
                threshold: 0,
            },
        )

        observer.observe(sentinel)

        return () => observer.disconnect()
    }, [entries.length, renderedEntriesCount])

    const visibleEntries = useMemo(
        () => entries.slice(0, renderedEntriesCount),
        [entries, renderedEntriesCount],
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
        <section className="space-y-3">
            <div
                className={cx(
                    'app-surface-panel border-text/10 sticky top-0 z-20 border-b shadow-[0_10px_24px_rgba(12,2,23,0.28)] transition-[padding] duration-150',
                    '-mx-8 space-y-2.5 px-8 pt-1 pb-2',
                )}
            >
                <div
                    className={cx(
                        'relative mt-0 transition-[margin] duration-150 ease-out',
                    )}
                >
                    <div
                        className={cx(
                            'grid grid-cols-[max-content_minmax(0,1fr)] items-center gap-12',
                        )}
                    >
                        <H1
                            startIcon={ListBulletsIcon}
                            className={cx(
                                'transition-[gap,min-height] duration-150',
                                'min-h-8 gap-3',
                            )}
                            iconClassName={cx(
                                'transition-[width,height] duration-150',
                                'h-6 w-6',
                            )}
                        >
                            Moja kupka
                        </H1>
                        <LibraryGameSearch
                            className="w-full"
                            compact
                            compressed={isTopCompressed}
                            games={games}
                            libraryGameIds={libraryGameIds}
                            addingGameId={addingGameId}
                            onAdd={(game) => void handleAddFromSearch(game)}
                        />
                    </div>
                </div>

                <div
                    className={cx(
                        'w-full transition-[padding,margin] duration-150',
                        'mt-0 py-0.5',
                    )}
                >
                    <ProgressStatusPills
                        id="library-status-tabs"
                        value={activeStatus}
                        onChange={setActiveStatus}
                        size="lg"
                        compact
                    />
                </div>

                <div className={cx('transition-[margin] duration-150', 'space-y-2.5')}>
                    <Input
                        className={cx(
                            'transition-[height,padding,font-size] duration-150',
                            'h-9 px-2.5 text-sm',
                        )}
                        value={searchValue}
                        onChange={(event) => setSearchValue(event.target.value)}
                        placeholder="Szukaj po tytule lub notatce"
                    />
                    <PlatformFilterPills
                        selected={selectedPlatforms}
                        compact
                        onToggle={(platform) =>
                            setSelectedPlatforms((current) =>
                                current.includes(platform)
                                    ? current.filter((value) => value !== platform)
                                    : [...current, platform],
                            )
                        }
                        includeNoPlatforms={includeNoPlatforms}
                        onToggleNoPlatforms={() =>
                            setIncludeNoPlatforms((current) => !current)
                        }
                    />
                </div>
            </div>

            {entriesStatus === 'LoadingFirstPage' ? (
                <div className="text-text/70">Ładowanie kupki...</div>
            ) : entries.length === 0 ? (
                <div className="border-text/20 bg-bg/30 rounded-lg border p-6">
                    <p className="text-text/80">
                        Brak wyników dla zakładki i aktualnych filtrów.
                    </p>
                </div>
            ) : (
                <>
                    <ul className="space-y-2">
                        {visibleEntries.map((entry) => {
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
                                        <CoverImage
                                            src={entry.game?.coverImageUrl}
                                            title={entryTitle}
                                            className="h-24 w-16 shrink-0 rounded object-cover"
                                        />

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
                    {visibleEntries.length < entries.length ? (
                        <div
                            ref={renderMoreSentinelRef}
                            className="h-16 w-full"
                            aria-hidden="true"
                        />
                    ) : null}
                </>
            )}
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
