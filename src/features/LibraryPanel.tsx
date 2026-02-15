import { PencilSimpleIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react'
import { usePaginatedQuery, useQuery } from 'convex/react'
import { useMemo, useState } from 'react'
import { Button } from '~/components/Button'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { LibraryAddDrawer } from './LibraryAddDrawer'
import { LibraryDeleteDrawer } from './LibraryDeleteDrawer'
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
    authReady: boolean
}

export const LibraryPanel = ({ authReady }: Props) => {
    const games = useQuery(api.games.listAll, authReady ? {} : 'skip')
    const {
        results: entries,
        status: entriesStatus,
        loadMore: loadMoreEntries,
    } = usePaginatedQuery(api.library.listMyLibrary, authReady ? {} : 'skip', {
        initialNumItems: 50,
    })

    const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
    const [editingEntryId, setEditingEntryId] = useState<Id<'libraryEntries'> | null>(
        null,
    )
    const [deletingEntryId, setDeletingEntryId] = useState<Id<'libraryEntries'> | null>(
        null,
    )

    const gamesById = useMemo(() => {
        const map = new Map<string, string>()
        games?.forEach((game) => {
            map.set(game._id, `${game.title} (${game.releaseYear})`)
        })
        return map
    }, [games])

    const entryById = useMemo(
        () => new Map(entries.map((entry) => [entry._id, entry])),
        [entries],
    )

    const editingEntry =
        editingEntryId !== null
            ? ((entryById.get(editingEntryId) as LibraryEntry | undefined) ?? null)
            : null
    const deletingEntry =
        deletingEntryId !== null
            ? ((entryById.get(deletingEntryId) as LibraryEntry | undefined) ?? null)
            : null

    return (
        <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-text text-2xl">Moja biblioteka</h2>
                <Button
                    type="button"
                    startIcon={PlusIcon}
                    title="Dodaj wpis do biblioteki"
                    onClick={() => setIsAddDrawerOpen(true)}
                >
                    Dodaj do biblioteki
                </Button>
            </div>

            {!entries ? (
                <div className="text-text/70">Ładowanie biblioteki...</div>
            ) : null}

            {entries.length === 0 ? (
                <div className="border-text/20 bg-bg/30 rounded-lg border p-6">
                    <p className="text-text/80">Twoja biblioteka jest pusta.</p>
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
                            const entryYear = entry.game?.releaseYear

                            return (
                                <li
                                    key={entry._id}
                                    className="border-text/20 bg-bg/30 rounded-lg border p-4"
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
                                            <div className="text-text truncate">
                                                {entryTitle}
                                            </div>
                                            <div className="text-text/70 text-sm">
                                                {entryYear ?? 'brak roku'}
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                startIcon={PencilSimpleIcon}
                                                title="Edytuj wpis biblioteki"
                                                onClick={() =>
                                                    setEditingEntryId(entry._id)
                                                }
                                            >
                                                <span className="sr-only">Edytuj</span>
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                startIcon={TrashIcon}
                                                title="Usuń wpis biblioteki"
                                                onClick={() =>
                                                    setDeletingEntryId(entry._id)
                                                }
                                            >
                                                <span className="sr-only">Usuń</span>
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="text-text/80 mt-3 grid gap-1 text-sm sm:grid-cols-2">
                                        <div>Status: {entry.progressStatus}</div>
                                        <div>Platformy: {entry.platforms.join(', ')}</div>
                                        <div>Ocena: {entry.rating}</div>
                                        <div>Wants to play: {entry.wantsToPlay}</div>
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
                    variant="secondary"
                    onClick={() => loadMoreEntries(50)}
                >
                    Załaduj więcej wpisów
                </Button>
            ) : null}

            <LibraryAddDrawer
                isOpen={isAddDrawerOpen}
                onClose={() => setIsAddDrawerOpen(false)}
                games={games}
            />
            <LibraryEditDrawer
                isOpen={editingEntry !== null}
                onClose={() => setEditingEntryId(null)}
                entry={editingEntry}
            />
            <LibraryDeleteDrawer
                isOpen={deletingEntry !== null}
                onClose={() => setDeletingEntryId(null)}
                entry={deletingEntry}
            />
        </section>
    )
}
