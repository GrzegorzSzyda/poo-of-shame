import { MagnifyingGlassIcon, PlusIcon } from '@phosphor-icons/react'
import { cx } from 'cva'
import { useMemo, useState } from 'react'
import { Button } from '~/components/Button'
import { Input } from '~/components/Input'
import type { Id } from '../../convex/_generated/dataModel'

type GameItem = {
    _id: Id<'games'>
    title: string
    releaseYear: number
    coverImageUrl?: string
}

type Props = {
    games?: GameItem[]
    libraryGameIds: Set<string>
    addingGameId: string | null
    onAdd: (game: GameItem) => void
    className?: string
}

export const LibraryGameSearch = ({
    games,
    libraryGameIds,
    addingGameId,
    onAdd,
    className,
}: Props) => {
    const [query, setQuery] = useState('')

    const normalizedQuery = query.trim().toLowerCase()
    const filteredGames = useMemo(() => {
        if (!games || normalizedQuery.length === 0) return []
        return games
            .filter((game) => game.title.toLowerCase().includes(normalizedQuery))
            .slice(0, 12)
    }, [games, normalizedQuery])

    return (
        <div className={cx('relative', className)}>
            <div className="relative">
                <MagnifyingGlassIcon className="text-text/60 pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                <Input
                    id="library-game-search"
                    className="pl-10"
                    placeholder="Wyszukaj grę i dodaj do kupki"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                />
            </div>

            {normalizedQuery.length > 0 ? (
                <ul className="border-text/20 bg-bg absolute z-30 mt-2 max-h-96 w-full space-y-2 overflow-auto rounded-md border p-2 shadow-[0_12px_28px_rgba(0,0,0,0.35)]">
                    {filteredGames.length === 0 ? (
                        <li className="text-text/70 text-sm">Brak dopasowanych gier.</li>
                    ) : (
                        filteredGames.map((game) => {
                            const isInLibrary = libraryGameIds.has(game._id)
                            const isAdding = addingGameId === game._id
                            return (
                                <li
                                    key={game._id}
                                    className="bg-bg/20 hover:bg-text/10 flex items-center gap-3 rounded-md p-2 transition-colors"
                                >
                                    {game.coverImageUrl ? (
                                        <img
                                            src={game.coverImageUrl}
                                            alt={`Okładka: ${game.title}`}
                                            className="h-14 w-10 shrink-0 rounded object-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="bg-bg text-text/60 border-text/20 flex h-14 w-10 shrink-0 items-center justify-center rounded border text-xs">
                                            brak
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <div className="text-text truncate">
                                            {game.title}
                                        </div>
                                        <div className="text-text/70 text-sm">
                                            {game.releaseYear}
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        startIcon={isInLibrary ? undefined : PlusIcon}
                                        title={
                                            isInLibrary
                                                ? 'Gra już jest w kupce'
                                                : 'Dodaj do kupki'
                                        }
                                        disabled={isInLibrary || isAdding}
                                        onClick={() => {
                                            onAdd(game)
                                            setQuery('')
                                        }}
                                    >
                                        {isInLibrary
                                            ? 'W kupce'
                                            : isAdding
                                              ? 'Dodawanie...'
                                              : 'Dodaj do kupki'}
                                    </Button>
                                </li>
                            )
                        })
                    )}
                </ul>
            ) : null}
        </div>
    )
}
