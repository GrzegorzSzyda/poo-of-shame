import { MagnifyingGlassIcon, PlusIcon } from '@phosphor-icons/react'
import { cx } from 'cva'
import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '~/components/Button'
import { Input } from '~/components/Input'
import { formatIsoDatePl } from '~/utils/date'
import type { Id } from '../../convex/_generated/dataModel'

type GameItem = {
    _id: Id<'games'>
    title: string
    releaseDate?: string
    releaseYear?: number
    coverImageUrl?: string
}

type Props = {
    games?: GameItem[]
    libraryGameIds: Set<string>
    addingGameId: string | null
    onAdd: (game: GameItem) => void
    className?: string
}

const toDisplayReleaseDate = (game: GameItem) =>
    game.releaseDate ??
    (game.releaseYear !== undefined ? `${game.releaseYear}-01-01` : '')

export const LibraryGameSearch = ({
    games,
    libraryGameIds,
    addingGameId,
    onAdd,
    className,
}: Props) => {
    const OVERLAY_FADE_MS = 420
    const [query, setQuery] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1)
    const [isOverlayRendered, setIsOverlayRendered] = useState(false)
    const [isOverlayVisible, setIsOverlayVisible] = useState(false)
    const containerRef = useRef<HTMLDivElement | null>(null)
    const itemRefs = useRef<Array<HTMLLIElement | null>>([])
    const shouldShowOverlay = isOpen && query.trim().length > 0

    const normalizedQuery = query.trim().toLowerCase()
    const filteredGames = useMemo(() => {
        if (!games || normalizedQuery.length === 0) return []
        return games
            .filter((game) => game.title.toLowerCase().includes(normalizedQuery))
            .slice(0, 12)
    }, [games, normalizedQuery])

    const selectableIndexes = useMemo(
        () =>
            filteredGames
                .map((game, index) => {
                    const isInLibrary = libraryGameIds.has(game._id)
                    const isAdding = addingGameId === game._id
                    return isInLibrary || isAdding ? null : index
                })
                .filter((index): index is number => index !== null),
        [addingGameId, filteredGames, libraryGameIds],
    )

    useEffect(() => {
        const handlePointerDown = (event: MouseEvent) => {
            if (!containerRef.current) return
            if (containerRef.current.contains(event.target as Node)) return
            setIsOpen(false)
            setHighlightedIndex(-1)
        }

        document.addEventListener('mousedown', handlePointerDown)
        return () => {
            document.removeEventListener('mousedown', handlePointerDown)
        }
    }, [])

    useEffect(() => {
        itemRefs.current = itemRefs.current.slice(0, filteredGames.length)
        if (!isOpen || normalizedQuery.length === 0 || selectableIndexes.length === 0) {
            setHighlightedIndex(-1)
            return
        }

        if (!selectableIndexes.includes(highlightedIndex)) {
            const firstSelectableIndex = selectableIndexes[0]
            if (firstSelectableIndex !== undefined) {
                setHighlightedIndex(firstSelectableIndex)
            }
        }
    }, [
        filteredGames.length,
        highlightedIndex,
        isOpen,
        normalizedQuery.length,
        selectableIndexes,
    ])

    useEffect(() => {
        if (highlightedIndex < 0) return
        itemRefs.current[highlightedIndex]?.scrollIntoView({
            block: 'nearest',
        })
    }, [highlightedIndex])

    useEffect(() => {
        if (shouldShowOverlay) {
            setIsOverlayRendered(true)
            const timer = window.setTimeout(() => setIsOverlayVisible(true), 20)
            return () => window.clearTimeout(timer)
        }

        setIsOverlayVisible(false)
    }, [shouldShowOverlay])

    useEffect(() => {
        if (shouldShowOverlay || !isOverlayRendered) {
            return
        }
        const timer = window.setTimeout(
            () => setIsOverlayRendered(false),
            OVERLAY_FADE_MS,
        )
        return () => window.clearTimeout(timer)
    }, [isOverlayRendered, shouldShowOverlay])

    const handleAdd = (game: GameItem) => {
        onAdd(game)
        setQuery('')
        setIsOpen(false)
        setHighlightedIndex(-1)
    }

    const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        const hasResults = filteredGames.length > 0
        if (event.key === 'Escape') {
            event.preventDefault()
            setIsOpen(false)
            setHighlightedIndex(-1)
            return
        }

        if (!hasResults || selectableIndexes.length === 0) return

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            if (!isOpen) setIsOpen(true)

            const currentPosition = selectableIndexes.indexOf(highlightedIndex)
            const direction = event.key === 'ArrowDown' ? 1 : -1
            const nextPosition =
                currentPosition === -1
                    ? direction === 1
                        ? 0
                        : selectableIndexes.length - 1
                    : (currentPosition + direction + selectableIndexes.length) %
                      selectableIndexes.length

            const nextHighlighted = selectableIndexes[nextPosition]
            if (nextHighlighted !== undefined) {
                setHighlightedIndex(nextHighlighted)
            }
            return
        }

        if (event.key === 'Enter') {
            event.preventDefault()
            const indexToAdd =
                highlightedIndex >= 0 && selectableIndexes.includes(highlightedIndex)
                    ? highlightedIndex
                    : selectableIndexes[0]
            if (indexToAdd === undefined) return
            const gameToAdd = filteredGames[indexToAdd]
            if (gameToAdd) {
                handleAdd(gameToAdd)
            }
        }
    }

    return (
        <div
            ref={containerRef}
            className={cx(
                'relative',
                isOpen && normalizedQuery.length > 0 ? 'z-30' : undefined,
                className,
            )}
        >
            {isOverlayRendered ? (
                <button
                    type="button"
                    aria-label="Zamknij wyniki wyszukiwania"
                    className={`overlay-fade fixed inset-0 z-20 bg-black/45 ${isOverlayVisible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                    onClick={() => setIsOpen(false)}
                />
            ) : null}
            <div className="relative z-30">
                <MagnifyingGlassIcon className="text-text/60 pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
                <Input
                    id="library-game-search"
                    className="pl-10"
                    placeholder="Wyszukaj grę i dodaj do kupki"
                    value={query}
                    onChange={(event) => {
                        setQuery(event.target.value)
                        setIsOpen(true)
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleInputKeyDown}
                />
            </div>

            {isOpen && normalizedQuery.length > 0 ? (
                <ul className="border-text/20 bg-bg absolute z-30 mt-2 max-h-96 w-full space-y-2 overflow-auto rounded-md border p-2 shadow-[0_12px_28px_rgba(0,0,0,0.35)]">
                    {filteredGames.length === 0 ? (
                        <li className="text-text/70 text-sm">Brak dopasowanych gier.</li>
                    ) : (
                        filteredGames.map((game, gameIndex) => {
                            const isInLibrary = libraryGameIds.has(game._id)
                            const isAdding = addingGameId === game._id
                            return (
                                <li
                                    key={game._id}
                                    ref={(element) => {
                                        itemRefs.current[gameIndex] = element
                                    }}
                                    className={cx(
                                        'bg-bg/20 hover:bg-text/10 flex items-center gap-3 rounded-md p-2 transition-colors',
                                        highlightedIndex === gameIndex
                                            ? 'bg-text/15'
                                            : undefined,
                                    )}
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
                                        <div className="text-text -mt-2 truncate">
                                            {game.title}
                                        </div>
                                        <div className="text-text/70 text-sm">
                                            {formatIsoDatePl(toDisplayReleaseDate(game))}
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        startIcon={isInLibrary ? undefined : PlusIcon}
                                        startIconWeight="bold"
                                        title={
                                            isInLibrary
                                                ? 'Gra już jest w kupce'
                                                : 'Dodaj do kupki'
                                        }
                                        disabled={isInLibrary || isAdding}
                                        onClick={() => handleAdd(game)}
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
