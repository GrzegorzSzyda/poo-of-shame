import { useMutation, useQuery } from 'convex/react'
import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

type UserGameStatus =
    | 'wanted'
    | 'owned'
    | 'playing'
    | 'completed'
    | 'mastered'
    | 'dropped'

type GameRunStatus = 'planned' | 'playing' | 'completed' | 'mastered' | 'dropped'

type GameRunType =
    | 'first_playthrough'
    | 'replay'
    | 'new_game_plus'
    | 'dlc'
    | 'challenge'
    | 'coop'
    | 'other'

type RunDatePrecision = 'exact' | 'year' | 'quarter' | 'month' | 'text' | 'unknown'
type AccessPlatform = 'pc' | 'playstation' | 'xbox' | 'switch' | 'mobile' | 'other'
type AccessSource =
    | 'steam'
    | 'gog'
    | 'epic'
    | 'ea_app'
    | 'ubisoft_connect'
    | 'amazon_gaming'
    | 'ps_store'
    | 'ps_plus'
    | 'ps_disc'
    | 'xbox_store'
    | 'game_pass'
    | 'switch_eshop'
    | 'switch_card'
    | 'pc_disc'
    | 'other'
type AccessType = 'owned' | 'subscription' | 'borrowed' | 'wishlist' | 'unknown'
type LibraryView = 'all' | 'backlog' | 'active' | 'history' | 'releases'
type LibraryRunFilter = 'all' | 'with_run' | 'without_run'
type LibraryStatusFilter = 'all' | UserGameStatus
type BacklogStatusFilter = 'all' | 'wanted' | 'owned'

type CatalogSearchGame = {
    _id: Id<'games'>
    title: string
    releaseDate?: string
    releaseYear?: number
    releaseQuarter?: number
    releaseYearMonth?: string
    releaseText?: string
    coverImageUrl?: string
    isInLibrary: boolean
}

type GameRun = {
    _id: Id<'gameRuns'>
    status: GameRunStatus
    label?: string
    runType?: GameRunType
    rating?: number
    note?: string
    startedPrecision: RunDatePrecision
    startedDate?: string
    startedYear?: number
    startedQuarter?: number
    startedMonth?: number
    startedText?: string
    startedYearMonth?: string
    finishedPrecision: RunDatePrecision
    finishedDate?: string
    finishedYear?: number
    finishedQuarter?: number
    finishedMonth?: number
    finishedText?: string
    finishedYearMonth?: string
}

type RunDateFormValue = {
    precision: RunDatePrecision
    date: string
    year: string
    quarter: string
    month: string
    text: string
}

type RunDateMutationFields = {
    startedPrecision?: RunDatePrecision
    startedDate?: string
    startedYear?: number
    startedQuarter?: number
    startedMonth?: number
    startedText?: string
    finishedPrecision?: RunDatePrecision
    finishedDate?: string
    finishedYear?: number
    finishedQuarter?: number
    finishedMonth?: number
    finishedText?: string
}

type LibraryEntry = {
    _id: Id<'userGames'>
    status: UserGameStatus
    interest: number
    pinnedRunId?: Id<'gameRuns'>
    lastRunId?: Id<'gameRuns'>
    game: {
        title: string
        releaseDate?: string
        releaseYear?: number
        releaseQuarter?: number
        releaseYearMonth?: string
        releaseText?: string
        coverImageUrl?: string
    } | null
}

type LibraryAllResult = {
    items: LibraryEntry[]
    total: number
    page: number
    pageSize: number
    hasMore: boolean
}

type BacklogResult = {
    items: LibraryEntry[]
    total: number
    page: number
    pageSize: number
    hasMore: boolean
}

type ActiveRunListItem = GameRun & {
    userGameId: Id<'userGames'>
    gameId: Id<'games'>
    userGameStatus: UserGameStatus | null
    game: {
        _id: Id<'games'>
        title: string
        releaseDate?: string
        releaseYear?: number
        releaseQuarter?: number
        releaseYearMonth?: string
        releaseText?: string
        coverImageUrl?: string
    } | null
}

type ActiveRunsResult = {
    items: ActiveRunListItem[]
    total: number
    page: number
    pageSize: number
    hasMore: boolean
}

type HistoryRunListItem = GameRun & {
    userGameId: Id<'userGames'>
    gameId: Id<'games'>
    userGameStatus: UserGameStatus | null
    game: {
        _id: Id<'games'>
        title: string
        releaseDate?: string
        releaseYear?: number
        releaseQuarter?: number
        releaseYearMonth?: string
        releaseText?: string
        coverImageUrl?: string
    } | null
}

type HistoryResult = {
    selectedYear: number
    availableYears: number[]
    sections: {
        started: HistoryRunListItem[]
        completed: HistoryRunListItem[]
        mastered: HistoryRunListItem[]
        dropped: HistoryRunListItem[]
        withoutConcreteYear: HistoryRunListItem[]
    }
}

type ReleaseSource = 'mine' | 'catalog'
type ReleaseYearFilter = 'all' | 'unknown' | number

type ReleaseListItem = {
    gameId: Id<'games'>
    title: string
    releaseDate?: string
    releaseYear?: number
    releaseQuarter?: number
    releaseYearMonth?: string
    releaseText?: string
    coverImageUrl?: string
    userGameId?: Id<'userGames'>
    userGameStatus?: UserGameStatus
    interest?: number
    updatedAt?: number
}

type ReleaseCalendarResult = {
    items: ReleaseListItem[]
    total: number
    page: number
    pageSize: number
    hasMore: boolean
    availableYears: number[]
}

type GameAccess = {
    _id: Id<'gameAccess'>
    platform: AccessPlatform
    source: AccessSource
    accessType: AccessType
    isAvailable: boolean
    note?: string
}

const statusOptions: Array<{ value: UserGameStatus; label: string }> = [
    { value: 'wanted', label: 'Chcę zagrać' },
    { value: 'owned', label: 'Mam' },
    { value: 'playing', label: 'Gram' },
    { value: 'completed', label: 'Ukończona' },
    { value: 'mastered', label: 'Wymaksowana' },
    { value: 'dropped', label: 'Porzucona' },
]

const libraryViewTabs: Array<{ value: LibraryView; label: string; disabled?: boolean }> =
    [
        { value: 'all', label: 'Wszystkie' },
        { value: 'backlog', label: 'Kupka' },
        { value: 'active', label: 'Gram teraz' },
        { value: 'history', label: 'Historia' },
        { value: 'releases', label: 'Premiery' },
    ]

const releaseSourceOptions: Array<{ value: ReleaseSource; label: string }> = [
    { value: 'mine', label: 'Moje premiery' },
    { value: 'catalog', label: 'Katalog' },
]

const libraryAllStatusOptions: Array<{ value: LibraryStatusFilter; label: string }> = [
    { value: 'all', label: 'Wszystkie statusy' },
    ...statusOptions.map((option) => ({ value: option.value, label: option.label })),
]

const libraryRunFilterOptions: Array<{ value: LibraryRunFilter; label: string }> = [
    { value: 'all', label: 'Runy: wszystkie' },
    { value: 'with_run', label: 'Tylko z runem' },
    { value: 'without_run', label: 'Tylko bez runu' },
]

const backlogStatusOptions: Array<{ value: BacklogStatusFilter; label: string }> = [
    { value: 'all', label: 'Wanted + owned' },
    { value: 'wanted', label: 'Tylko wanted' },
    { value: 'owned', label: 'Tylko owned' },
]

const accessPlatformOptions: Array<{ value: AccessPlatform; label: string }> = [
    { value: 'pc', label: 'PC' },
    { value: 'playstation', label: 'PlayStation' },
    { value: 'xbox', label: 'Xbox' },
    { value: 'switch', label: 'Switch' },
    { value: 'mobile', label: 'Mobile' },
    { value: 'other', label: 'Inne' },
]

const accessSourceOptions: Array<{ value: AccessSource; label: string }> = [
    { value: 'steam', label: 'Steam' },
    { value: 'gog', label: 'GOG' },
    { value: 'epic', label: 'Epic' },
    { value: 'ea_app', label: 'EA app' },
    { value: 'ubisoft_connect', label: 'Ubisoft Connect' },
    { value: 'amazon_gaming', label: 'Amazon Gaming' },
    { value: 'ps_store', label: 'PS Store' },
    { value: 'ps_plus', label: 'PS Plus' },
    { value: 'ps_disc', label: 'Płyta PS' },
    { value: 'xbox_store', label: 'Xbox Store' },
    { value: 'game_pass', label: 'Game Pass' },
    { value: 'switch_eshop', label: 'Switch eShop' },
    { value: 'switch_card', label: 'Karta Switch' },
    { value: 'pc_disc', label: 'PC disc' },
    { value: 'other', label: 'Inne' },
]

const accessTypeOptions: Array<{ value: AccessType; label: string }> = [
    { value: 'owned', label: 'Posiadam' },
    { value: 'subscription', label: 'Subskrypcja' },
    { value: 'borrowed', label: 'Pożyczone' },
    { value: 'wishlist', label: 'Wishlist' },
    { value: 'unknown', label: 'Nieznane' },
]

const statusLabels = Object.fromEntries(
    statusOptions.map((option) => [option.value, option.label]),
) as Record<UserGameStatus, string>

const runStatusOptions: Array<{ value: GameRunStatus; label: string }> = [
    { value: 'planned', label: 'Planowany' },
    { value: 'playing', label: 'W trakcie' },
    { value: 'completed', label: 'Ukończony' },
    { value: 'mastered', label: 'Wymaksowany' },
    { value: 'dropped', label: 'Porzucony' },
]

const runTypeOptions: Array<{ value: GameRunType; label: string }> = [
    { value: 'first_playthrough', label: 'Pierwsze przejście' },
    { value: 'replay', label: 'Replay' },
    { value: 'new_game_plus', label: 'New Game+' },
    { value: 'dlc', label: 'DLC' },
    { value: 'challenge', label: 'Challenge' },
    { value: 'coop', label: 'Co-op' },
    { value: 'other', label: 'Inny' },
]

const runStatusLabels = Object.fromEntries(
    runStatusOptions.map((option) => [option.value, option.label]),
) as Record<GameRunStatus, string>

const runTypeLabels = Object.fromEntries(
    runTypeOptions.map((option) => [option.value, option.label]),
) as Record<GameRunType, string>

const accessPlatformLabels = Object.fromEntries(
    accessPlatformOptions.map((option) => [option.value, option.label]),
) as Record<AccessPlatform, string>

const accessSourceLabels = Object.fromEntries(
    accessSourceOptions.map((option) => [option.value, option.label]),
) as Record<AccessSource, string>

const accessTypeLabels = Object.fromEntries(
    accessTypeOptions.map((option) => [option.value, option.label]),
) as Record<AccessType, string>

const runDatePrecisionOptions: Array<{ value: RunDatePrecision; label: string }> = [
    { value: 'unknown', label: 'Brak daty' },
    { value: 'exact', label: 'Dokładna data' },
    { value: 'year', label: 'Rok' },
    { value: 'quarter', label: 'Kwartał' },
    { value: 'month', label: 'Miesiąc' },
    { value: 'text', label: 'Opis tekstowy' },
]

const interestStatuses = new Set<UserGameStatus>(['wanted', 'owned', 'playing'])

const shouldShowInterest = (status: UserGameStatus) => interestStatuses.has(status)

const formatRelease = (game: {
    releaseDate?: string
    releaseYearMonth?: string
    releaseYear?: number
    releaseQuarter?: number
    releaseText?: string
}) => {
    if (game.releaseDate) return game.releaseDate
    if (game.releaseYearMonth) return game.releaseYearMonth
    if (game.releaseYear !== undefined && game.releaseQuarter !== undefined) {
        return `${game.releaseYear} Q${game.releaseQuarter}`
    }
    if (game.releaseYear !== undefined) return String(game.releaseYear)
    if (game.releaseText) return game.releaseText
    return 'brak daty'
}

const getLibraryErrorMessage = (error: unknown, fallback: string) => {
    const message = error instanceof Error ? error.message : ''

    if (message.includes('USER_GAME_ALREADY_EXISTS')) {
        return 'Ta gra jest już w twojej kupce.'
    }

    if (message.includes('GAME_NOT_FOUND')) {
        return 'Nie znaleziono tej gry w katalogu.'
    }

    if (message.includes('USER_GAME_NOT_FOUND')) {
        return 'Nie znaleziono tej gry w twojej kupce.'
    }

    if (message.includes('USER_GAME_IN_USE')) {
        return 'Nie można usunąć gry, bo ma już powiązane runy albo dostęp.'
    }

    if (message.includes('GAME_ACCESS_ALREADY_EXISTS')) {
        return 'Taki dostęp do gry już istnieje.'
    }

    if (message.includes('GAME_ACCESS_NOT_FOUND')) {
        return 'Nie znaleziono tego dostępu do gry.'
    }

    if (message.includes('FORBIDDEN')) {
        return 'Nie możesz edytować tego wpisu.'
    }

    if (message.includes('STARTED_DATE_INVALID')) {
        return 'Data startu runu jest nieprawidłowa.'
    }

    if (message.includes('FINISHED_DATE_INVALID')) {
        return 'Data zakończenia runu jest nieprawidłowa.'
    }

    if (
        message.includes('STARTED_YEAR_INVALID') ||
        message.includes('FINISHED_YEAR_INVALID')
    ) {
        return 'Rok runu musi być liczbą z zakresu 1950-2200.'
    }

    if (
        message.includes('STARTED_QUARTER_INVALID') ||
        message.includes('FINISHED_QUARTER_INVALID')
    ) {
        return 'Kwartał runu musi być z zakresu Q1-Q4.'
    }

    if (
        message.includes('STARTED_MONTH_INVALID') ||
        message.includes('FINISHED_MONTH_INVALID')
    ) {
        return 'Miesiąc runu musi być z zakresu 1-12.'
    }

    if (
        message.includes('STARTED_TEXT_REQUIRED') ||
        message.includes('FINISHED_TEXT_REQUIRED')
    ) {
        return 'Opis daty runu nie może być pusty.'
    }

    if (message.includes('INTEREST_INVALID')) {
        return 'Zainteresowanie musi być w zakresie 0-100.'
    }

    if (message.includes('RATING_INVALID')) {
        return 'Ocena runu musi być w zakresie 0-100.'
    }

    if (message.includes('GAME_RUN_NOT_FOUND')) {
        return 'Nie znaleziono tego runu.'
    }

    if (message.includes('GAME_RUN_MISMATCH')) {
        return 'Ten run nie pasuje do wybranej gry.'
    }

    return error instanceof Error ? error.message : fallback
}

const Cover = ({ game }: { game: { title: string; coverImageUrl?: string } }) =>
    game.coverImageUrl ? (
        <img
            src={game.coverImageUrl}
            alt={`Okładka: ${game.title}`}
            className="h-16 w-11 shrink-0 rounded border border-zinc-800 object-cover"
            loading="lazy"
        />
    ) : (
        <div className="flex h-16 w-11 shrink-0 items-center justify-center rounded border border-dashed border-zinc-800 bg-zinc-950 text-[0.65rem] text-zinc-600">
            brak
        </div>
    )

const LibraryViewTabs = ({
    activeView,
    onChange,
}: {
    activeView: LibraryView
    onChange: (view: LibraryView) => void
}) => (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-2">
        <div className="flex flex-wrap gap-2">
            {libraryViewTabs.map((tab) => {
                const isActive = tab.value === activeView
                return (
                    <button
                        key={tab.value}
                        type="button"
                        disabled={tab.disabled}
                        onClick={() => onChange(tab.value)}
                        className={`inline-flex h-10 items-center justify-center rounded-md px-3 text-sm transition ${
                            isActive
                                ? 'bg-teal-300 font-semibold text-zinc-950'
                                : 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700'
                        } ${
                            tab.disabled
                                ? 'cursor-not-allowed opacity-45 hover:bg-zinc-800'
                                : ''
                        }`}
                    >
                        {tab.label}
                    </button>
                )
            })}
        </div>
    </section>
)

const LibraryAllPanel = () => {
    const [searchText, setSearchText] = useState('')
    const [statusFilter, setStatusFilter] = useState<LibraryStatusFilter>('all')
    const [runFilter, setRunFilter] = useState<LibraryRunFilter>('all')
    const [page, setPage] = useState(1)
    const trimmedSearchText = searchText.trim()
    const searchFilter = trimmedSearchText.length >= 2 ? trimmedSearchText : ''
    const library = useQuery(api.library.listMyLibraryAll, {
        searchText: searchFilter,
        statusFilter,
        runFilter,
        page,
        pageSize: 25,
    }) as LibraryAllResult | undefined

    const handleSearchChange = (value: string) => {
        setSearchText(value)
        setPage(1)
    }

    return (
        <section className="rounded-lg border border-zinc-800 bg-zinc-900/70">
            <div className="border-b border-zinc-800 px-4 py-3">
                <h2 className="font-medium text-white">Widok: Wszystkie</h2>
                <p className="mt-1 text-sm text-zinc-400">
                    Kontrolny widok wszystkich wpisów po migracji nowej biblioteki.
                </p>
            </div>

            <div className="border-b border-zinc-800 px-4 py-4">
                <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_15rem_15rem]">
                    <div className="space-y-1.5">
                        <label
                            htmlFor="library-all-search"
                            className="text-sm text-zinc-300"
                        >
                            Tytuł
                        </label>
                        <input
                            id="library-all-search"
                            value={searchText}
                            onChange={(event) => handleSearchChange(event.target.value)}
                            className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-teal-300"
                            placeholder="Minimum 2 znaki"
                            autoCapitalize="off"
                            autoCorrect="off"
                            spellCheck={false}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="library-all-status"
                            className="text-sm text-zinc-300"
                        >
                            Status gry
                        </label>
                        <select
                            id="library-all-status"
                            value={statusFilter}
                            onChange={(event) => {
                                setStatusFilter(event.target.value as LibraryStatusFilter)
                                setPage(1)
                            }}
                            className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                        >
                            {libraryAllStatusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="library-all-run-filter"
                            className="text-sm text-zinc-300"
                        >
                            Runy
                        </label>
                        <select
                            id="library-all-run-filter"
                            value={runFilter}
                            onChange={(event) => {
                                setRunFilter(event.target.value as LibraryRunFilter)
                                setPage(1)
                            }}
                            className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                        >
                            {libraryRunFilterOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {trimmedSearchText.length === 1 ? (
                    <p className="mt-3 text-xs text-zinc-500">
                        Wyszukiwanie po tytule startuje od 2 znaków.
                    </p>
                ) : null}
            </div>

            {library === undefined ? (
                <div className="px-4 py-5 text-sm text-zinc-400">Ładowanie widoku...</div>
            ) : library.items.length > 0 ? (
                <>
                    <div className="border-b border-zinc-800 px-4 py-3 text-sm text-zinc-400">
                        Wyniki: {library.total}
                        <span className="ml-3">
                            Strona {library.page}
                            {library.total > 0
                                ? ` / ${Math.max(1, Math.ceil(library.total / library.pageSize))}`
                                : ''}
                        </span>
                    </div>

                    <ul className="divide-y divide-zinc-800">
                        {library.items.map((entry) => (
                            <LibraryEntryRow key={entry._id} entry={entry} />
                        ))}
                    </ul>

                    <div className="flex items-center justify-between gap-3 border-t border-zinc-800 px-4 py-3">
                        <button
                            type="button"
                            onClick={() => setPage((current) => Math.max(1, current - 1))}
                            disabled={library.page <= 1}
                            className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-800 px-3 text-sm font-medium text-zinc-100 transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Poprzednia
                        </button>
                        <button
                            type="button"
                            onClick={() => setPage((current) => current + 1)}
                            disabled={!library.hasMore}
                            className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-800 px-3 text-sm font-medium text-zinc-100 transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Następna
                        </button>
                    </div>
                </>
            ) : (
                <div className="px-4 py-5 text-sm text-zinc-400">
                    Brak wpisów dla wybranych filtrów.
                </div>
            )}
        </section>
    )
}

const BacklogPanel = () => {
    const [searchText, setSearchText] = useState('')
    const [statusFilter, setStatusFilter] = useState<BacklogStatusFilter>('all')
    const [page, setPage] = useState(1)
    const trimmedSearchText = searchText.trim()
    const searchFilter = trimmedSearchText.length >= 2 ? trimmedSearchText : ''
    const library = useQuery(api.library.listMyBacklog, {
        searchText: searchFilter,
        statusFilter,
        page,
        pageSize: 25,
    }) as BacklogResult | undefined

    return (
        <section className="rounded-lg border border-zinc-800 bg-zinc-900/70">
            <div className="border-b border-zinc-800 px-4 py-3">
                <h2 className="font-medium text-white">Widok: Kupka</h2>
                <p className="mt-1 text-sm text-zinc-400">
                    Backlog bez aktywnie granych i zakończonych gier.
                </p>
            </div>

            <div className="border-b border-zinc-800 px-4 py-4">
                <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_15rem]">
                    <div className="space-y-1.5">
                        <label
                            htmlFor="library-backlog-search"
                            className="text-sm text-zinc-300"
                        >
                            Tytuł
                        </label>
                        <input
                            id="library-backlog-search"
                            value={searchText}
                            onChange={(event) => {
                                setSearchText(event.target.value)
                                setPage(1)
                            }}
                            className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-teal-300"
                            placeholder="Minimum 2 znaki"
                            autoCapitalize="off"
                            autoCorrect="off"
                            spellCheck={false}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="library-backlog-status"
                            className="text-sm text-zinc-300"
                        >
                            Status kupki
                        </label>
                        <select
                            id="library-backlog-status"
                            value={statusFilter}
                            onChange={(event) => {
                                setStatusFilter(event.target.value as BacklogStatusFilter)
                                setPage(1)
                            }}
                            className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                        >
                            {backlogStatusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {trimmedSearchText.length === 1 ? (
                    <p className="mt-3 text-xs text-zinc-500">
                        Wyszukiwanie po tytule startuje od 2 znaków.
                    </p>
                ) : null}
            </div>

            {library === undefined ? (
                <div className="px-4 py-5 text-sm text-zinc-400">Ładowanie widoku...</div>
            ) : library.items.length > 0 ? (
                <>
                    <div className="border-b border-zinc-800 px-4 py-3 text-sm text-zinc-400">
                        Wyniki: {library.total}
                        <span className="ml-3">
                            Sortowanie: zainteresowanie malejąco, potem ostatnia zmiana.
                        </span>
                    </div>

                    <ul className="divide-y divide-zinc-800">
                        {library.items.map((entry) => (
                            <LibraryEntryRow key={entry._id} entry={entry} />
                        ))}
                    </ul>

                    <div className="flex items-center justify-between gap-3 border-t border-zinc-800 px-4 py-3">
                        <button
                            type="button"
                            onClick={() => setPage((current) => Math.max(1, current - 1))}
                            disabled={library.page <= 1}
                            className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-800 px-3 text-sm font-medium text-zinc-100 transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Poprzednia
                        </button>
                        <button
                            type="button"
                            onClick={() => setPage((current) => current + 1)}
                            disabled={!library.hasMore}
                            className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-800 px-3 text-sm font-medium text-zinc-100 transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Następna
                        </button>
                    </div>
                </>
            ) : (
                <div className="px-4 py-5 text-sm text-zinc-400">
                    Brak gier w kupce dla wybranych filtrów.
                </div>
            )}
        </section>
    )
}

const ActiveRunsPanel = () => {
    const [searchText, setSearchText] = useState('')
    const [page, setPage] = useState(1)
    const trimmedSearchText = searchText.trim()
    const searchFilter = trimmedSearchText.length >= 2 ? trimmedSearchText : ''
    const activeRuns = useQuery(api.library.listMyActiveRuns, {
        searchText: searchFilter,
        page,
        pageSize: 25,
    }) as ActiveRunsResult | undefined

    return (
        <section className="rounded-lg border border-zinc-800 bg-zinc-900/70">
            <div className="border-b border-zinc-800 px-4 py-3">
                <h2 className="font-medium text-white">Widok: Gram teraz</h2>
                <p className="mt-1 text-sm text-zinc-400">
                    Aktywne runy oparte bezpośrednio o `gameRuns.status = playing`.
                </p>
            </div>

            <div className="border-b border-zinc-800 px-4 py-4">
                <div className="space-y-1.5">
                    <label
                        htmlFor="library-active-search"
                        className="text-sm text-zinc-300"
                    >
                        Tytuł
                    </label>
                    <input
                        id="library-active-search"
                        value={searchText}
                        onChange={(event) => {
                            setSearchText(event.target.value)
                            setPage(1)
                        }}
                        className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-teal-300"
                        placeholder="Minimum 2 znaki"
                        autoCapitalize="off"
                        autoCorrect="off"
                        spellCheck={false}
                    />
                </div>

                {trimmedSearchText.length === 1 ? (
                    <p className="mt-3 text-xs text-zinc-500">
                        Wyszukiwanie po tytule startuje od 2 znaków.
                    </p>
                ) : null}
            </div>

            {activeRuns === undefined ? (
                <div className="px-4 py-5 text-sm text-zinc-400">Ładowanie widoku...</div>
            ) : activeRuns.items.length > 0 ? (
                <>
                    <div className="border-b border-zinc-800 px-4 py-3 text-sm text-zinc-400">
                        Wyniki: {activeRuns.total}
                    </div>

                    <ul className="divide-y divide-zinc-800">
                        {activeRuns.items.map((run) => (
                            <li key={run._id} className="bg-zinc-900/50 px-4 py-3">
                                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_11rem_11rem]">
                                    <div className="flex min-w-0 gap-3">
                                        {run.game ? <Cover game={run.game} /> : null}
                                        <div className="min-w-0 self-center">
                                            <p className="truncate text-sm font-medium text-zinc-100">
                                                {run.game?.title ??
                                                    'Brak rekordu gry w katalogu'}
                                            </p>
                                            <p className="mt-1 text-xs text-zinc-400">
                                                {run.label?.trim() ||
                                                    runStatusLabels[run.status]}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="self-center text-sm text-zinc-300">
                                        <p>
                                            Status gry:{' '}
                                            {run.userGameStatus
                                                ? statusLabels[run.userGameStatus]
                                                : 'brak'}
                                        </p>
                                        <p className="mt-1 text-zinc-400">
                                            Start: {formatRunDate(run, 'started')}
                                        </p>
                                    </div>

                                    <div className="self-center text-sm text-zinc-400 md:text-right">
                                        <p>
                                            {run.runType
                                                ? runTypeLabels[run.runType]
                                                : 'Bez typu'}
                                        </p>
                                        {run.rating !== undefined ? (
                                            <p className="mt-1">Ocena: {run.rating}</p>
                                        ) : null}
                                    </div>
                                </div>

                                {run.note?.trim() ? (
                                    <p className="mt-3 text-sm text-zinc-400">
                                        {run.note}
                                    </p>
                                ) : null}
                            </li>
                        ))}
                    </ul>

                    <div className="flex items-center justify-between gap-3 border-t border-zinc-800 px-4 py-3">
                        <button
                            type="button"
                            onClick={() => setPage((current) => Math.max(1, current - 1))}
                            disabled={activeRuns.page <= 1}
                            className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-800 px-3 text-sm font-medium text-zinc-100 transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Poprzednia
                        </button>
                        <button
                            type="button"
                            onClick={() => setPage((current) => current + 1)}
                            disabled={!activeRuns.hasMore}
                            className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-800 px-3 text-sm font-medium text-zinc-100 transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Następna
                        </button>
                    </div>
                </>
            ) : (
                <div className="px-4 py-5 text-sm text-zinc-400">
                    Nie masz teraz żadnych aktywnych runów.
                </div>
            )}
        </section>
    )
}

const HistorySection = ({
    title,
    runs,
    emptyLabel,
}: {
    title: string
    runs: HistoryRunListItem[]
    emptyLabel: string
}) => (
    <section className="rounded-md border border-zinc-800 bg-zinc-950/40">
        <div className="border-b border-zinc-800 px-4 py-3">
            <h3 className="text-sm font-medium text-zinc-100">{title}</h3>
        </div>

        {runs.length > 0 ? (
            <ul className="divide-y divide-zinc-800">
                {runs.map((run) => (
                    <li key={`${title}-${run._id}`} className="px-4 py-3">
                        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_11rem_11rem]">
                            <div className="flex min-w-0 gap-3">
                                {run.game ? <Cover game={run.game} /> : null}
                                <div className="min-w-0 self-center">
                                    <p className="truncate text-sm font-medium text-zinc-100">
                                        {run.game?.title ?? 'Brak rekordu gry w katalogu'}
                                    </p>
                                    <p className="mt-1 text-xs text-zinc-400">
                                        {run.label?.trim() || runStatusLabels[run.status]}
                                    </p>
                                </div>
                            </div>

                            <div className="self-center text-sm text-zinc-300">
                                <p>
                                    Status gry:{' '}
                                    {run.userGameStatus
                                        ? statusLabels[run.userGameStatus]
                                        : 'brak'}
                                </p>
                                <p className="mt-1 text-zinc-400">
                                    Start: {formatRunDate(run, 'started')}
                                </p>
                                <p className="mt-1 text-zinc-400">
                                    Koniec: {formatRunDate(run, 'finished')}
                                </p>
                            </div>

                            <div className="self-center text-sm text-zinc-400 md:text-right">
                                <p>
                                    {run.runType
                                        ? runTypeLabels[run.runType]
                                        : 'Bez typu'}
                                </p>
                                {run.rating !== undefined ? (
                                    <p className="mt-1">Ocena: {run.rating}</p>
                                ) : null}
                            </div>
                        </div>

                        {run.note?.trim() ? (
                            <p className="mt-3 text-sm text-zinc-400">{run.note}</p>
                        ) : null}
                    </li>
                ))}
            </ul>
        ) : (
            <div className="px-4 py-4 text-sm text-zinc-500">{emptyLabel}</div>
        )}
    </section>
)

const HistoryPanel = () => {
    const currentYear = new Date().getUTCFullYear()
    const [selectedYear, setSelectedYear] = useState(currentYear)
    const history = useQuery(api.library.listMyRunHistoryByYear, {
        year: selectedYear,
    }) as HistoryResult | undefined
    const yearOptions =
        history && history.availableYears.length > 0
            ? history.availableYears
            : [currentYear]

    return (
        <section className="rounded-lg border border-zinc-800 bg-zinc-900/70">
            <div className="border-b border-zinc-800 px-4 py-3">
                <h2 className="font-medium text-white">Widok: Historia</h2>
                <p className="mt-1 text-sm text-zinc-400">
                    Roczna historia runów zbudowana bezpośrednio z `gameRuns`.
                </p>
            </div>

            <div className="border-b border-zinc-800 px-4 py-4">
                <div className="max-w-xs space-y-1.5">
                    <label
                        htmlFor="library-history-year"
                        className="text-sm text-zinc-300"
                    >
                        Rok
                    </label>
                    <select
                        id="library-history-year"
                        value={selectedYear}
                        onChange={(event) => setSelectedYear(Number(event.target.value))}
                        className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                    >
                        {yearOptions.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {history === undefined ? (
                <div className="px-4 py-5 text-sm text-zinc-400">Ładowanie widoku...</div>
            ) : (
                <div className="space-y-4 px-4 py-4">
                    <HistorySection
                        title={`Grane / rozpoczęte (${history.sections.started.length})`}
                        runs={history.sections.started}
                        emptyLabel="Brak runów rozpoczętych w tym roku."
                    />
                    <HistorySection
                        title={`Ukończone (${history.sections.completed.length})`}
                        runs={history.sections.completed}
                        emptyLabel="Brak ukończonych runów w tym roku."
                    />
                    <HistorySection
                        title={`Wymaksowane (${history.sections.mastered.length})`}
                        runs={history.sections.mastered}
                        emptyLabel="Brak wymaksowanych runów w tym roku."
                    />
                    <HistorySection
                        title={`Porzucone (${history.sections.dropped.length})`}
                        runs={history.sections.dropped}
                        emptyLabel="Brak porzuconych runów w tym roku."
                    />
                    <HistorySection
                        title={`Bez konkretnego roku (${history.sections.withoutConcreteYear.length})`}
                        runs={history.sections.withoutConcreteYear}
                        emptyLabel="Brak runów bez konkretnego roku."
                    />
                </div>
            )}
        </section>
    )
}

const ReleaseCalendarPanel = () => {
    const [source, setSource] = useState<ReleaseSource>('mine')
    const [searchText, setSearchText] = useState('')
    const [yearFilter, setYearFilter] = useState<ReleaseYearFilter>('all')
    const [page, setPage] = useState(1)
    const trimmedSearchText = searchText.trim()
    const searchFilter = trimmedSearchText.length >= 2 ? trimmedSearchText : ''
    const releases = useQuery(
        source === 'mine'
            ? api.library.listMyReleaseCalendar
            : api.library.listCatalogReleaseCalendar,
        {
            searchText: searchFilter,
            yearFilter,
            page,
            pageSize: 25,
        },
    ) as ReleaseCalendarResult | undefined

    const yearOptions: Array<ReleaseYearFilter> = [
        'all',
        ...(releases?.availableYears ?? []),
        'unknown',
    ]

    return (
        <section className="rounded-lg border border-zinc-800 bg-zinc-900/70">
            <div className="border-b border-zinc-800 px-4 py-3">
                <h2 className="font-medium text-white">Widok: Premiery</h2>
                <p className="mt-1 text-sm text-zinc-400">
                    Przegląd premier z twojej biblioteki albo z całego katalogu.
                </p>
            </div>

            <div className="border-b border-zinc-800 px-4 py-4">
                <div className="grid gap-3 md:grid-cols-[14rem_minmax(0,1fr)_12rem]">
                    <div className="space-y-1.5">
                        <label
                            htmlFor="library-release-source"
                            className="text-sm text-zinc-300"
                        >
                            Źródło
                        </label>
                        <select
                            id="library-release-source"
                            value={source}
                            onChange={(event) => {
                                setSource(event.target.value as ReleaseSource)
                                setPage(1)
                                setYearFilter('all')
                            }}
                            className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                        >
                            {releaseSourceOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="library-release-search"
                            className="text-sm text-zinc-300"
                        >
                            Tytuł
                        </label>
                        <input
                            id="library-release-search"
                            value={searchText}
                            onChange={(event) => {
                                setSearchText(event.target.value)
                                setPage(1)
                            }}
                            className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-teal-300"
                            placeholder="Minimum 2 znaki"
                            autoCapitalize="off"
                            autoCorrect="off"
                            spellCheck={false}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="library-release-year"
                            className="text-sm text-zinc-300"
                        >
                            Rok premiery
                        </label>
                        <select
                            id="library-release-year"
                            value={String(yearFilter)}
                            onChange={(event) => {
                                const value = event.target.value
                                setYearFilter(
                                    value === 'all' || value === 'unknown'
                                        ? value
                                        : Number(value),
                                )
                                setPage(1)
                            }}
                            className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                        >
                            {yearOptions.map((option) => (
                                <option key={String(option)} value={String(option)}>
                                    {option === 'all'
                                        ? 'Wszystkie'
                                        : option === 'unknown'
                                          ? 'Brak roku'
                                          : option}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {trimmedSearchText.length === 1 ? (
                    <p className="mt-3 text-xs text-zinc-500">
                        Wyszukiwanie po tytule startuje od 2 znaków.
                    </p>
                ) : null}
            </div>

            {releases === undefined ? (
                <div className="px-4 py-5 text-sm text-zinc-400">Ładowanie widoku...</div>
            ) : releases.items.length > 0 ? (
                <>
                    <div className="border-b border-zinc-800 px-4 py-3 text-sm text-zinc-400">
                        Wyniki: {releases.total}
                    </div>

                    <ul className="divide-y divide-zinc-800">
                        {releases.items.map((item) => (
                            <li
                                key={`${source}-${item.gameId}`}
                                className="bg-zinc-900/50 px-4 py-3"
                            >
                                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_11rem_11rem]">
                                    <div className="flex min-w-0 gap-3">
                                        <Cover game={item} />
                                        <div className="min-w-0 self-center">
                                            <p className="truncate text-sm font-medium text-zinc-100">
                                                {item.title}
                                            </p>
                                            <p className="mt-1 text-xs text-zinc-400">
                                                {formatRelease(item)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="self-center text-sm text-zinc-300">
                                        {source === 'mine' ? (
                                            <>
                                                <p>
                                                    Status gry:{' '}
                                                    {item.userGameStatus
                                                        ? statusLabels[
                                                              item.userGameStatus
                                                          ]
                                                        : 'brak'}
                                                </p>
                                                <p className="mt-1 text-zinc-400">
                                                    Interest:{' '}
                                                    {item.interest !== undefined
                                                        ? item.interest
                                                        : 'brak'}
                                                </p>
                                            </>
                                        ) : (
                                            <p className="text-zinc-400">
                                                Katalog główny
                                            </p>
                                        )}
                                    </div>

                                    <div className="self-center text-sm text-zinc-400 md:text-right">
                                        {item.releaseYear !== undefined ? (
                                            <p>Rok: {item.releaseYear}</p>
                                        ) : (
                                            <p>Rok: brak</p>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div className="flex items-center justify-between gap-3 border-t border-zinc-800 px-4 py-3">
                        <button
                            type="button"
                            onClick={() => setPage((current) => Math.max(1, current - 1))}
                            disabled={releases.page <= 1}
                            className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-800 px-3 text-sm font-medium text-zinc-100 transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Poprzednia
                        </button>
                        <button
                            type="button"
                            onClick={() => setPage((current) => current + 1)}
                            disabled={!releases.hasMore}
                            className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-800 px-3 text-sm font-medium text-zinc-100 transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Następna
                        </button>
                    </div>
                </>
            ) : (
                <div className="px-4 py-5 text-sm text-zinc-400">
                    Brak gier dla wybranych filtrów premier.
                </div>
            )}
        </section>
    )
}

const createEmptyRunDateFormValue = (): RunDateFormValue => ({
    precision: 'unknown',
    date: '',
    year: '',
    quarter: '1',
    month: '1',
    text: '',
})

const createRunDateFormValue = (
    prefix: 'started' | 'finished',
    run: GameRun,
): RunDateFormValue => ({
    precision: run[`${prefix}Precision`],
    date: run[`${prefix}Date`] ?? '',
    year: run[`${prefix}Year`] !== undefined ? String(run[`${prefix}Year`]) : '',
    quarter:
        run[`${prefix}Quarter`] !== undefined ? String(run[`${prefix}Quarter`]) : '1',
    month: run[`${prefix}Month`] !== undefined ? String(run[`${prefix}Month`]) : '1',
    text: run[`${prefix}Text`] ?? '',
})

const toRunDateMutationFields = (
    prefix: 'started' | 'finished',
    value: RunDateFormValue,
): RunDateMutationFields => ({
    [`${prefix}Precision`]: value.precision,
    [`${prefix}Date`]: value.precision === 'exact' && value.date ? value.date : undefined,
    [`${prefix}Year`]:
        value.precision === 'year' ||
        value.precision === 'quarter' ||
        value.precision === 'month'
            ? Number(value.year)
            : undefined,
    [`${prefix}Quarter`]:
        value.precision === 'quarter' ? Number(value.quarter) : undefined,
    [`${prefix}Month`]: value.precision === 'month' ? Number(value.month) : undefined,
    [`${prefix}Text`]:
        value.precision === 'text' && value.text.trim().length > 0
            ? value.text.trim()
            : undefined,
})

const formatRunDate = (run: GameRun, prefix: 'started' | 'finished') => {
    const precision = run[`${prefix}Precision`]

    if (precision === 'exact' && run[`${prefix}Date`]) return run[`${prefix}Date`]
    if (precision === 'month' && run[`${prefix}YearMonth`]) {
        return run[`${prefix}YearMonth`]
    }
    if (precision === 'quarter' && run[`${prefix}Year`] && run[`${prefix}Quarter`]) {
        return `${run[`${prefix}Year`]} Q${run[`${prefix}Quarter`]}`
    }
    if (precision === 'year' && run[`${prefix}Year`]) {
        return String(run[`${prefix}Year`])
    }
    if (precision === 'text' && run[`${prefix}Text`]) return run[`${prefix}Text`]
    return 'brak daty'
}

const RunDateFields = ({
    idPrefix,
    label,
    value,
    onChange,
}: {
    idPrefix: string
    label: string
    value: RunDateFormValue
    onChange: (value: RunDateFormValue) => void
}) => {
    const setValue = <Key extends keyof RunDateFormValue>(
        key: Key,
        nextValue: RunDateFormValue[Key],
    ) => onChange({ ...value, [key]: nextValue })

    return (
        <div className="space-y-2 rounded-md border border-zinc-800 p-3">
            <label htmlFor={`${idPrefix}-precision`} className="text-sm text-zinc-300">
                {label}
            </label>
            <select
                id={`${idPrefix}-precision`}
                value={value.precision}
                onChange={(event) =>
                    setValue('precision', event.target.value as RunDatePrecision)
                }
                className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
            >
                {runDatePrecisionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            {value.precision === 'exact' ? (
                <input
                    type="date"
                    value={value.date}
                    onChange={(event) => setValue('date', event.target.value)}
                    className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-teal-300"
                />
            ) : null}

            {value.precision === 'year' ||
            value.precision === 'quarter' ||
            value.precision === 'month' ? (
                <div className="grid gap-2 md:grid-cols-2">
                    <input
                        type="number"
                        value={value.year}
                        onChange={(event) => setValue('year', event.target.value)}
                        className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-teal-300"
                        placeholder="2026"
                    />
                    {value.precision === 'quarter' ? (
                        <select
                            value={value.quarter}
                            onChange={(event) => setValue('quarter', event.target.value)}
                            className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                        >
                            <option value="1">Q1</option>
                            <option value="2">Q2</option>
                            <option value="3">Q3</option>
                            <option value="4">Q4</option>
                        </select>
                    ) : null}
                    {value.precision === 'month' ? (
                        <select
                            value={value.month}
                            onChange={(event) => setValue('month', event.target.value)}
                            className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                        >
                            {Array.from({ length: 12 }, (_, index) => index + 1).map(
                                (month) => (
                                    <option key={month} value={month}>
                                        {String(month).padStart(2, '0')}
                                    </option>
                                ),
                            )}
                        </select>
                    ) : null}
                </div>
            ) : null}

            {value.precision === 'text' ? (
                <input
                    value={value.text}
                    onChange={(event) => setValue('text', event.target.value)}
                    className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-teal-300"
                    placeholder="np. wakacje 2024"
                />
            ) : null}
        </div>
    )
}

const getRunSuggestionForGameStatus = (status: UserGameStatus) => {
    switch (status) {
        case 'playing':
            return 'Status gry ustawiony na „Gram”. Jeśli to nowy albo aktywny playthrough, dodaj lub zaktualizuj run jako „W trakcie”.'
        case 'completed':
            return 'Status gry ustawiony na „Ukończona”. Jeśli chcesz zachować historię, oznacz właściwy run jako ukończony i uzupełnij datę końca.'
        case 'mastered':
            return 'Status gry ustawiony na „Wymaksowana”. Jeśli dotyczy to konkretnego przejścia, oznacz właściwy run jako wymaksowany.'
        case 'dropped':
            return 'Status gry ustawiony na „Porzucona”. Jeśli porzucenie dotyczy konkretnego podejścia, oznacz właściwy run jako porzucony.'
        default:
            return null
    }
}

const getSuggestedRunStatus = (status: UserGameStatus): GameRunStatus | null => {
    switch (status) {
        case 'playing':
            return 'playing'
        case 'completed':
            return 'completed'
        case 'mastered':
            return 'mastered'
        case 'dropped':
            return 'dropped'
        default:
            return null
    }
}

const getRunSuggestionActionLabel = (mode: 'latest' | 'new', status: GameRunStatus) => {
    const statusLabel = runStatusLabels[status].toLowerCase()
    return mode === 'latest'
        ? `Oznacz ostatni run jako ${statusLabel}`
        : `Utwórz nowy run: ${statusLabel}`
}

const RunListItem = ({ run }: { run: GameRun }) => {
    const updateGameRun = useMutation(api.library.updateGameRun)
    const deleteGameRun = useMutation(api.library.deleteGameRun)
    const [isEditing, setIsEditing] = useState(false)
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
    const [status, setStatus] = useState<GameRunStatus>(run.status)
    const [runType, setRunType] = useState<GameRunType | ''>(run.runType ?? '')
    const [label, setLabel] = useState(run.label ?? '')
    const [rating, setRating] = useState(run.rating ?? 0)
    const [hasRating, setHasRating] = useState(run.rating !== undefined)
    const [note, setNote] = useState(run.note ?? '')
    const [startedDate, setStartedDate] = useState(() =>
        createRunDateFormValue('started', run),
    )
    const [finishedDate, setFinishedDate] = useState(() =>
        createRunDateFormValue('finished', run),
    )
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const resetForm = () => {
        setStatus(run.status)
        setRunType(run.runType ?? '')
        setLabel(run.label ?? '')
        setRating(run.rating ?? 0)
        setHasRating(run.rating !== undefined)
        setNote(run.note ?? '')
        setStartedDate(createRunDateFormValue('started', run))
        setFinishedDate(createRunDateFormValue('finished', run))
        setError(null)
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setError(null)
        setIsSubmitting(true)

        try {
            await updateGameRun({
                runId: run._id,
                status,
                label: label.trim().length > 0 ? label.trim() : undefined,
                runType: runType || undefined,
                rating: hasRating ? rating : undefined,
                note: note.trim().length > 0 ? note.trim() : undefined,
                ...toRunDateMutationFields('started', startedDate),
                ...toRunDateMutationFields('finished', finishedDate),
            })
            setIsEditing(false)
            setIsConfirmingDelete(false)
        } catch (error) {
            setError(getLibraryErrorMessage(error, 'Nie udało się zapisać runu.'))
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        setError(null)
        setIsDeleting(true)

        try {
            await deleteGameRun({ runId: run._id })
        } catch (error) {
            setError(getLibraryErrorMessage(error, 'Nie udało się usunąć runu.'))
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <li className="rounded-md border border-zinc-800 bg-zinc-900/60 p-3">
            <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_9rem_9rem_auto]">
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-100">
                        {run.label?.trim() || runStatusLabels[run.status]}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                        {run.runType ? runTypeLabels[run.runType] : 'Bez typu'}
                        {run.rating !== undefined ? ` · Ocena ${run.rating}/100` : ''}
                    </p>
                    {run.note ? (
                        <p className="mt-1 line-clamp-2 text-xs text-zinc-400">
                            {run.note}
                        </p>
                    ) : null}
                </div>
                <p className="text-sm text-zinc-400">
                    Start: {formatRunDate(run, 'started')}
                </p>
                <p className="text-sm text-zinc-400">
                    Koniec: {formatRunDate(run, 'finished')}
                </p>
                <div className="flex flex-wrap gap-2 md:justify-end">
                    <button
                        type="button"
                        onClick={() => {
                            if (isEditing) resetForm()
                            setIsEditing((current) => !current)
                            setIsConfirmingDelete(false)
                        }}
                        className="inline-flex h-8 items-center justify-center rounded-md bg-zinc-800 px-2.5 text-xs font-medium text-zinc-100 transition hover:bg-zinc-700"
                    >
                        {isEditing ? 'Zamknij' : 'Edytuj'}
                    </button>
                    {isConfirmingDelete ? (
                        <button
                            type="button"
                            onClick={() => void handleDelete()}
                            disabled={isDeleting}
                            className="inline-flex h-8 items-center justify-center rounded-md bg-red-500 px-2.5 text-xs font-semibold text-red-50 transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isDeleting ? 'Usuwanie...' : 'Potwierdź'}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => {
                                setIsConfirmingDelete(true)
                                setIsEditing(false)
                                setError(null)
                            }}
                            className="inline-flex h-8 items-center justify-center rounded-md bg-red-950/60 px-2.5 text-xs font-medium text-red-200 transition hover:bg-red-900"
                        >
                            Usuń
                        </button>
                    )}
                </div>
            </div>

            {error && !isEditing ? (
                <p className="mt-2 text-sm text-red-300">{error}</p>
            ) : null}

            {isEditing ? (
                <form
                    onSubmit={(event) => void handleSubmit(event)}
                    className="mt-3 space-y-3 rounded-md border border-zinc-800 bg-zinc-950/70 p-3"
                >
                    <div className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-1.5">
                            <label className="text-sm text-zinc-300">Status runu</label>
                            <select
                                value={status}
                                onChange={(event) =>
                                    setStatus(event.target.value as GameRunStatus)
                                }
                                className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                            >
                                {runStatusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm text-zinc-300">Typ</label>
                            <select
                                value={runType}
                                onChange={(event) =>
                                    setRunType(event.target.value as GameRunType | '')
                                }
                                className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                            >
                                <option value="">Bez typu</option>
                                {runTypeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm text-zinc-300">Label</label>
                            <input
                                value={label}
                                onChange={(event) => setLabel(event.target.value)}
                                className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-teal-300"
                                placeholder="np. PS5 run"
                            />
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        <RunDateFields
                            idPrefix={`run-edit-started-${run._id}`}
                            label="Start"
                            value={startedDate}
                            onChange={setStartedDate}
                        />
                        <RunDateFields
                            idPrefix={`run-edit-finished-${run._id}`}
                            label="Koniec"
                            value={finishedDate}
                            onChange={setFinishedDate}
                        />
                    </div>

                    <div className="grid gap-3 md:grid-cols-[12rem_minmax(0,1fr)]">
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-sm text-zinc-300">
                                <input
                                    type="checkbox"
                                    checked={hasRating}
                                    onChange={(event) =>
                                        setHasRating(event.target.checked)
                                    }
                                    className="accent-teal-300"
                                />
                                Ocena
                            </label>
                            {hasRating ? (
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={rating}
                                    onChange={(event) =>
                                        setRating(Number(event.target.value))
                                    }
                                    className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-teal-300"
                                />
                            ) : null}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm text-zinc-300">Notatka</label>
                            <textarea
                                value={note}
                                onChange={(event) => setNote(event.target.value)}
                                className="min-h-20 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-teal-300"
                                placeholder="Opcjonalna notatka do tego runu"
                            />
                        </div>
                    </div>

                    {error ? <p className="text-sm text-red-300">{error}</p> : null}

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex h-9 items-center justify-center rounded-md bg-teal-300 px-3 text-sm font-semibold text-zinc-950 transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? 'Zapisywanie...' : 'Zapisz run'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                resetForm()
                                setIsEditing(false)
                            }}
                            className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-800 px-3 text-sm font-medium text-zinc-100 transition hover:bg-zinc-700"
                        >
                            Anuluj
                        </button>
                    </div>
                </form>
            ) : null}
        </li>
    )
}

const RunsPanel = ({ userGameId }: { userGameId: Id<'userGames'> }) => {
    const createGameRun = useMutation(api.library.createGameRun)
    const runs = useQuery(api.library.listRunsForUserGame, { userGameId })
    const [status, setStatus] = useState<GameRunStatus>('planned')
    const [runType, setRunType] = useState<GameRunType | ''>('first_playthrough')
    const [label, setLabel] = useState('')
    const [rating, setRating] = useState(0)
    const [hasRating, setHasRating] = useState(false)
    const [note, setNote] = useState('')
    const [startedDate, setStartedDate] = useState(createEmptyRunDateFormValue)
    const [finishedDate, setFinishedDate] = useState(createEmptyRunDateFormValue)
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setMessage(null)
        setError(null)
        setIsSubmitting(true)

        try {
            await createGameRun({
                userGameId,
                status,
                label: label.trim().length > 0 ? label.trim() : undefined,
                runType: runType || undefined,
                rating: hasRating ? rating : undefined,
                note: note.trim().length > 0 ? note.trim() : undefined,
                ...toRunDateMutationFields('started', startedDate),
                ...toRunDateMutationFields('finished', finishedDate),
            })
            setStatus('planned')
            setRunType('first_playthrough')
            setLabel('')
            setRating(0)
            setHasRating(false)
            setNote('')
            setStartedDate(createEmptyRunDateFormValue())
            setFinishedDate(createEmptyRunDateFormValue())
            setMessage('Dodano run.')
        } catch (error) {
            setError(getLibraryErrorMessage(error, 'Nie udało się dodać runu.'))
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section className="mt-3 space-y-4 rounded-md border border-zinc-800 bg-zinc-950/60 p-3">
            <div>
                <h3 className="text-sm font-medium text-zinc-100">Runy</h3>
                <p className="mt-1 text-xs text-zinc-500">
                    Dodanie runu aktualizuje ostatni run tej gry.
                </p>
            </div>

            {runs === undefined ? (
                <p className="text-sm text-zinc-400">Ładowanie runów...</p>
            ) : runs.length > 0 ? (
                <ul className="space-y-2">
                    {runs.map((run) => (
                        <RunListItem key={run._id} run={run} />
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-zinc-400">Brak runów dla tej gry.</p>
            )}

            <form onSubmit={(event) => void handleSubmit(event)} className="space-y-3">
                <div className="grid gap-3 md:grid-cols-3">
                    <div className="space-y-1.5">
                        <label
                            htmlFor={`run-status-${userGameId}`}
                            className="text-sm text-zinc-300"
                        >
                            Status runu
                        </label>
                        <select
                            id={`run-status-${userGameId}`}
                            value={status}
                            onChange={(event) =>
                                setStatus(event.target.value as GameRunStatus)
                            }
                            className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                        >
                            {runStatusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor={`run-type-${userGameId}`}
                            className="text-sm text-zinc-300"
                        >
                            Typ
                        </label>
                        <select
                            id={`run-type-${userGameId}`}
                            value={runType}
                            onChange={(event) =>
                                setRunType(event.target.value as GameRunType | '')
                            }
                            className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                        >
                            <option value="">Bez typu</option>
                            {runTypeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor={`run-label-${userGameId}`}
                            className="text-sm text-zinc-300"
                        >
                            Label
                        </label>
                        <input
                            id={`run-label-${userGameId}`}
                            value={label}
                            onChange={(event) => setLabel(event.target.value)}
                            className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-teal-300"
                            placeholder="np. PS5 run"
                        />
                    </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                    <RunDateFields
                        idPrefix={`run-started-${userGameId}`}
                        label="Start"
                        value={startedDate}
                        onChange={setStartedDate}
                    />
                    <RunDateFields
                        idPrefix={`run-finished-${userGameId}`}
                        label="Koniec"
                        value={finishedDate}
                        onChange={setFinishedDate}
                    />
                </div>

                <div className="grid gap-3 md:grid-cols-[12rem_minmax(0,1fr)]">
                    <div className="space-y-1.5">
                        <label
                            htmlFor={`run-rating-enabled-${userGameId}`}
                            className="flex items-center gap-2 text-sm text-zinc-300"
                        >
                            <input
                                id={`run-rating-enabled-${userGameId}`}
                                type="checkbox"
                                checked={hasRating}
                                onChange={(event) => setHasRating(event.target.checked)}
                                className="accent-teal-300"
                            />
                            Ocena
                        </label>
                        {hasRating ? (
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={rating}
                                onChange={(event) =>
                                    setRating(Number(event.target.value))
                                }
                                className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-teal-300"
                            />
                        ) : null}
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor={`run-note-${userGameId}`}
                            className="text-sm text-zinc-300"
                        >
                            Notatka
                        </label>
                        <textarea
                            id={`run-note-${userGameId}`}
                            value={note}
                            onChange={(event) => setNote(event.target.value)}
                            className="min-h-20 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-teal-300"
                            placeholder="Opcjonalna notatka do tego runu"
                        />
                    </div>
                </div>

                {message ? <p className="text-sm text-teal-200">{message}</p> : null}
                {error ? <p className="text-sm text-red-300">{error}</p> : null}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex h-9 items-center justify-center rounded-md bg-teal-300 px-3 text-sm font-semibold text-zinc-950 transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting ? 'Dodawanie...' : 'Dodaj run'}
                </button>
            </form>
        </section>
    )
}

const AccessListItem = ({ access }: { access: GameAccess }) => {
    const updateGameAccess = useMutation(api.library.updateGameAccess)
    const deleteGameAccess = useMutation(api.library.deleteGameAccess)
    const [isEditing, setIsEditing] = useState(false)
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
    const [platform, setPlatform] = useState<AccessPlatform>(access.platform)
    const [source, setSource] = useState<AccessSource>(access.source)
    const [accessType, setAccessType] = useState<AccessType>(access.accessType)
    const [isAvailable, setIsAvailable] = useState(access.isAvailable)
    const [note, setNote] = useState(access.note ?? '')
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const resetForm = () => {
        setPlatform(access.platform)
        setSource(access.source)
        setAccessType(access.accessType)
        setIsAvailable(access.isAvailable)
        setNote(access.note ?? '')
        setError(null)
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setError(null)
        setIsSubmitting(true)

        try {
            await updateGameAccess({
                accessId: access._id,
                platform,
                source,
                accessType,
                isAvailable,
                note: note.trim().length > 0 ? note.trim() : undefined,
            })
            setIsEditing(false)
            setIsConfirmingDelete(false)
        } catch (error) {
            setError(getLibraryErrorMessage(error, 'Nie udało się zapisać dostępu.'))
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        setError(null)
        setIsDeleting(true)

        try {
            await deleteGameAccess({ accessId: access._id })
        } catch (error) {
            setError(getLibraryErrorMessage(error, 'Nie udało się usunąć dostępu.'))
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <li className="rounded-md border border-zinc-800 bg-zinc-900/60 p-3">
            <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_9rem_9rem_auto]">
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-100">
                        {accessSourceLabels[access.source]}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                        {accessPlatformLabels[access.platform]} ·{' '}
                        {accessTypeLabels[access.accessType]}
                    </p>
                    {access.note ? (
                        <p className="mt-1 line-clamp-2 text-xs text-zinc-400">
                            {access.note}
                        </p>
                    ) : null}
                </div>
                <p className="text-sm text-zinc-400">
                    {access.isAvailable ? 'Dostępny' : 'Niedostępny'}
                </p>
                <p className="text-sm text-zinc-400">
                    {accessTypeLabels[access.accessType]}
                </p>
                <div className="flex flex-wrap gap-2 md:justify-end">
                    <button
                        type="button"
                        onClick={() => {
                            if (isEditing) resetForm()
                            setIsEditing((current) => !current)
                            setIsConfirmingDelete(false)
                        }}
                        className="inline-flex h-8 items-center justify-center rounded-md bg-zinc-800 px-2.5 text-xs font-medium text-zinc-100 transition hover:bg-zinc-700"
                    >
                        {isEditing ? 'Zamknij' : 'Edytuj'}
                    </button>
                    {isConfirmingDelete ? (
                        <button
                            type="button"
                            onClick={() => void handleDelete()}
                            disabled={isDeleting}
                            className="inline-flex h-8 items-center justify-center rounded-md bg-red-500 px-2.5 text-xs font-semibold text-red-50 transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isDeleting ? 'Usuwanie...' : 'Potwierdź'}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => {
                                setIsConfirmingDelete(true)
                                setIsEditing(false)
                                setError(null)
                            }}
                            className="inline-flex h-8 items-center justify-center rounded-md bg-red-950/60 px-2.5 text-xs font-medium text-red-200 transition hover:bg-red-900"
                        >
                            Usuń
                        </button>
                    )}
                </div>
            </div>

            {error && !isEditing ? (
                <p className="mt-2 text-sm text-red-300">{error}</p>
            ) : null}

            {isEditing ? (
                <form
                    onSubmit={(event) => void handleSubmit(event)}
                    className="mt-3 space-y-3 rounded-md border border-zinc-800 bg-zinc-950/70 p-3"
                >
                    <div className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-1.5">
                            <label className="text-sm text-zinc-300">Platforma</label>
                            <select
                                value={platform}
                                onChange={(event) =>
                                    setPlatform(event.target.value as AccessPlatform)
                                }
                                className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                            >
                                {accessPlatformOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm text-zinc-300">Źródło</label>
                            <select
                                value={source}
                                onChange={(event) =>
                                    setSource(event.target.value as AccessSource)
                                }
                                className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                            >
                                {accessSourceOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm text-zinc-300">Typ dostępu</label>
                            <select
                                value={accessType}
                                onChange={(event) =>
                                    setAccessType(event.target.value as AccessType)
                                }
                                className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                            >
                                {accessTypeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <label className="flex items-center gap-2 text-sm text-zinc-300">
                        <input
                            type="checkbox"
                            checked={isAvailable}
                            onChange={(event) => setIsAvailable(event.target.checked)}
                            className="accent-teal-300"
                        />
                        Dostęp aktualnie aktywny
                    </label>

                    <div className="space-y-1.5">
                        <label className="text-sm text-zinc-300">Notatka</label>
                        <textarea
                            value={note}
                            onChange={(event) => setNote(event.target.value)}
                            className="min-h-20 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-teal-300"
                            placeholder="Opcjonalna notatka o dostępie"
                        />
                    </div>

                    {error ? <p className="text-sm text-red-300">{error}</p> : null}

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex h-8 items-center justify-center rounded-md bg-teal-300 px-2.5 text-xs font-semibold text-zinc-950 transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? 'Zapisywanie...' : 'Zapisz'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                resetForm()
                                setIsEditing(false)
                            }}
                            className="inline-flex h-8 items-center justify-center rounded-md bg-zinc-800 px-2.5 text-xs font-medium text-zinc-100 transition hover:bg-zinc-700"
                        >
                            Anuluj
                        </button>
                    </div>
                </form>
            ) : null}
        </li>
    )
}

const AccessPanel = ({ userGameId }: { userGameId: Id<'userGames'> }) => {
    const createGameAccess = useMutation(api.library.createGameAccess)
    const accessRecords = useQuery(api.library.listAccessForUserGame, {
        userGameId,
    }) as GameAccess[] | undefined
    const [platform, setPlatform] = useState<AccessPlatform>('pc')
    const [source, setSource] = useState<AccessSource>('steam')
    const [accessType, setAccessType] = useState<AccessType>('owned')
    const [isAvailable, setIsAvailable] = useState(true)
    const [note, setNote] = useState('')
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setMessage(null)
        setError(null)
        setIsSubmitting(true)

        try {
            await createGameAccess({
                userGameId,
                platform,
                source,
                accessType,
                isAvailable,
                note: note.trim().length > 0 ? note.trim() : undefined,
            })
            setPlatform('pc')
            setSource('steam')
            setAccessType('owned')
            setIsAvailable(true)
            setNote('')
            setMessage('Dodano dostęp do gry.')
        } catch (error) {
            setError(getLibraryErrorMessage(error, 'Nie udało się dodać dostępu.'))
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section className="mt-3 space-y-4 rounded-md border border-zinc-800 bg-zinc-950/60 p-3">
            <div>
                <h3 className="text-sm font-medium text-zinc-100">Dostęp</h3>
                <p className="mt-1 text-xs text-zinc-500">
                    Skąd masz tę grę albo przez co masz do niej dojście.
                </p>
            </div>

            {accessRecords === undefined ? (
                <p className="text-sm text-zinc-400">Ładowanie dostępu...</p>
            ) : accessRecords.length > 0 ? (
                <ul className="space-y-2">
                    {accessRecords.map((access) => (
                        <AccessListItem key={access._id} access={access} />
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-zinc-400">Brak zapisanych źródeł dostępu.</p>
            )}

            <form onSubmit={(event) => void handleSubmit(event)} className="space-y-3">
                <div className="grid gap-3 md:grid-cols-3">
                    <div className="space-y-1.5">
                        <label
                            htmlFor={`access-platform-${userGameId}`}
                            className="text-sm text-zinc-300"
                        >
                            Platforma
                        </label>
                        <select
                            id={`access-platform-${userGameId}`}
                            value={platform}
                            onChange={(event) =>
                                setPlatform(event.target.value as AccessPlatform)
                            }
                            className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                        >
                            {accessPlatformOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor={`access-source-${userGameId}`}
                            className="text-sm text-zinc-300"
                        >
                            Źródło
                        </label>
                        <select
                            id={`access-source-${userGameId}`}
                            value={source}
                            onChange={(event) =>
                                setSource(event.target.value as AccessSource)
                            }
                            className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                        >
                            {accessSourceOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor={`access-type-${userGameId}`}
                            className="text-sm text-zinc-300"
                        >
                            Typ dostępu
                        </label>
                        <select
                            id={`access-type-${userGameId}`}
                            value={accessType}
                            onChange={(event) =>
                                setAccessType(event.target.value as AccessType)
                            }
                            className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                        >
                            {accessTypeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <label
                    htmlFor={`access-available-${userGameId}`}
                    className="flex items-center gap-2 text-sm text-zinc-300"
                >
                    <input
                        id={`access-available-${userGameId}`}
                        type="checkbox"
                        checked={isAvailable}
                        onChange={(event) => setIsAvailable(event.target.checked)}
                        className="accent-teal-300"
                    />
                    Dostęp aktualnie aktywny
                </label>

                <div className="space-y-1.5">
                    <label
                        htmlFor={`access-note-${userGameId}`}
                        className="text-sm text-zinc-300"
                    >
                        Notatka
                    </label>
                    <textarea
                        id={`access-note-${userGameId}`}
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        className="min-h-20 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-teal-300"
                        placeholder="Opcjonalna notatka o źródle dostępu"
                    />
                </div>

                {message ? <p className="text-sm text-teal-200">{message}</p> : null}
                {error ? <p className="text-sm text-red-300">{error}</p> : null}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex h-9 items-center justify-center rounded-md bg-teal-300 px-3 text-sm font-semibold text-zinc-950 transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting ? 'Dodawanie...' : 'Dodaj dostęp'}
                </button>
            </form>
        </section>
    )
}

const LibraryEntryRow = ({ entry }: { entry: LibraryEntry }) => {
    const updateLibraryGame = useMutation(api.library.updateLibraryGame)
    const removeGameFromLibrary = useMutation(api.library.removeGameFromLibrary)
    const applyRunSuggestion = useMutation(api.library.applyRunSuggestion)
    const [isEditing, setIsEditing] = useState(false)
    const [isShowingRuns, setIsShowingRuns] = useState(false)
    const [isShowingAccess, setIsShowingAccess] = useState(false)
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
    const [status, setStatus] = useState<UserGameStatus>(entry.status)
    const [interest, setInterest] = useState(entry.interest)
    const [runSuggestion, setRunSuggestion] = useState<string | null>(null)
    const [suggestedRunStatus, setSuggestedRunStatus] = useState<GameRunStatus | null>(
        null,
    )
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [runSuggestionMode, setRunSuggestionMode] = useState<'latest' | 'new' | null>(
        null,
    )
    const showsInterest = shouldShowInterest(status)

    const handleCancel = () => {
        setStatus(entry.status)
        setInterest(entry.interest)
        setRunSuggestion(null)
        setSuggestedRunStatus(null)
        setError(null)
        setMessage(null)
        setIsEditing(false)
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setError(null)
        setMessage(null)
        setIsSubmitting(true)

        try {
            const nextRunSuggestion =
                status !== entry.status ? getRunSuggestionForGameStatus(status) : null
            const nextSuggestedRunStatus =
                status !== entry.status ? getSuggestedRunStatus(status) : null

            await updateLibraryGame({
                userGameId: entry._id,
                status,
                interest: showsInterest ? interest : 0,
            })
            setRunSuggestion(nextRunSuggestion)
            setSuggestedRunStatus(nextSuggestedRunStatus)
            if (nextRunSuggestion) {
                setIsShowingRuns(true)
            }
            setIsEditing(false)
        } catch (error) {
            setError(getLibraryErrorMessage(error, 'Nie udało się zapisać zmian.'))
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        setError(null)
        setMessage(null)
        setIsDeleting(true)

        try {
            await removeGameFromLibrary({ userGameId: entry._id })
        } catch (error) {
            setError(getLibraryErrorMessage(error, 'Nie udało się usunąć gry z kupki.'))
        } finally {
            setIsDeleting(false)
        }
    }

    const handleRunSuggestion = async (mode: 'latest' | 'new') => {
        if (!suggestedRunStatus) return

        setError(null)
        setMessage(null)
        setRunSuggestionMode(mode)

        try {
            await applyRunSuggestion({
                userGameId: entry._id,
                status: suggestedRunStatus,
                mode,
            })
            setMessage(
                mode === 'latest' ? 'Zaktualizowano ostatni run.' : 'Utworzono nowy run.',
            )
            setRunSuggestion(null)
            setSuggestedRunStatus(null)
            setIsShowingRuns(true)
        } catch (error) {
            setError(getLibraryErrorMessage(error, 'Nie udało się zastosować sugestii.'))
        } finally {
            setRunSuggestionMode(null)
        }
    }

    return (
        <li className="bg-zinc-900/50 px-4 py-3">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_9rem_8rem_8rem]">
                {entry.game ? (
                    <div className="flex min-w-0 gap-3">
                        <Cover game={entry.game} />
                        <div className="min-w-0 self-center">
                            <p className="truncate text-sm font-medium text-zinc-100">
                                {entry.game.title}
                            </p>
                            <p className="mt-1 text-xs text-zinc-400">
                                {formatRelease(entry.game)}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-red-300">
                        Brak rekordu gry w katalogu.
                    </div>
                )}
                <p className="self-center text-sm text-zinc-300">
                    {statusLabels[entry.status]}
                </p>
                {shouldShowInterest(entry.status) ? (
                    <p className="self-center text-sm text-zinc-400">
                        Interest: {entry.interest}
                    </p>
                ) : (
                    <p className="self-center text-sm text-zinc-500">Bez priorytetu</p>
                )}
                <div className="self-center md:text-right">
                    <button
                        type="button"
                        onClick={() => {
                            setIsEditing((current) => !current)
                            setIsConfirmingDelete(false)
                            setError(null)
                        }}
                        className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-800 px-3 text-sm font-medium text-zinc-100 transition hover:bg-zinc-700"
                    >
                        {isEditing ? 'Zamknij' : 'Edytuj'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsShowingRuns((current) => !current)}
                        className="mt-2 inline-flex h-9 items-center justify-center rounded-md bg-zinc-800 px-3 text-sm font-medium text-zinc-100 transition hover:bg-zinc-700 md:mt-0 md:ml-2"
                    >
                        {isShowingRuns ? 'Ukryj runy' : 'Runy'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsShowingAccess((current) => !current)}
                        className="mt-2 inline-flex h-9 items-center justify-center rounded-md bg-zinc-800 px-3 text-sm font-medium text-zinc-100 transition hover:bg-zinc-700 md:mt-0 md:ml-2"
                    >
                        {isShowingAccess ? 'Ukryj dostęp' : 'Dostęp'}
                    </button>
                    {isConfirmingDelete ? (
                        <button
                            type="button"
                            onClick={() => void handleDelete()}
                            disabled={isDeleting}
                            className="mt-2 inline-flex h-9 items-center justify-center rounded-md bg-red-500 px-3 text-sm font-semibold text-red-50 transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60 md:mt-0 md:ml-2"
                        >
                            {isDeleting ? 'Usuwanie...' : 'Potwierdź'}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => {
                                setIsConfirmingDelete(true)
                                setIsEditing(false)
                                setError(null)
                            }}
                            className="mt-2 inline-flex h-9 items-center justify-center rounded-md bg-red-950/60 px-3 text-sm font-medium text-red-200 transition hover:bg-red-900 md:mt-0 md:ml-2"
                        >
                            Usuń
                        </button>
                    )}
                </div>
            </div>

            {error && !isEditing ? (
                <p className="mt-2 text-sm text-red-300">{error}</p>
            ) : null}
            {message && !isEditing ? (
                <p className="mt-2 text-sm text-teal-200">{message}</p>
            ) : null}

            {runSuggestion && !isEditing ? (
                <div className="mt-3 rounded-md border border-teal-900/70 bg-teal-950/30 p-3">
                    <p className="text-sm text-teal-100">{runSuggestion}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {suggestedRunStatus && entry.lastRunId ? (
                            <button
                                type="button"
                                onClick={() => void handleRunSuggestion('latest')}
                                disabled={runSuggestionMode !== null}
                                className="inline-flex h-8 items-center justify-center rounded-md bg-teal-300 px-2.5 text-xs font-semibold text-zinc-950 transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {runSuggestionMode === 'latest'
                                    ? 'Aktualizuję...'
                                    : getRunSuggestionActionLabel(
                                          'latest',
                                          suggestedRunStatus,
                                      )}
                            </button>
                        ) : null}
                        {suggestedRunStatus ? (
                            <button
                                type="button"
                                onClick={() => void handleRunSuggestion('new')}
                                disabled={runSuggestionMode !== null}
                                className="inline-flex h-8 items-center justify-center rounded-md bg-zinc-100 px-2.5 text-xs font-semibold text-zinc-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {runSuggestionMode === 'new'
                                    ? 'Tworzę...'
                                    : getRunSuggestionActionLabel(
                                          'new',
                                          suggestedRunStatus,
                                      )}
                            </button>
                        ) : null}
                        <button
                            type="button"
                            onClick={() => setIsShowingRuns(true)}
                            className="inline-flex h-8 items-center justify-center rounded-md bg-teal-300 px-2.5 text-xs font-semibold text-zinc-950 transition hover:bg-teal-200"
                        >
                            Pokaż runy
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setRunSuggestion(null)
                                setSuggestedRunStatus(null)
                            }}
                            className="inline-flex h-8 items-center justify-center rounded-md bg-zinc-800 px-2.5 text-xs font-medium text-zinc-100 transition hover:bg-zinc-700"
                        >
                            Zamknij sugestię
                        </button>
                    </div>
                </div>
            ) : null}

            {isEditing ? (
                <form
                    onSubmit={(event) => void handleSubmit(event)}
                    className="mt-3 space-y-3 rounded-md border border-zinc-800 bg-zinc-950/60 p-3"
                >
                    <div
                        className={`grid gap-4 ${
                            showsInterest ? 'md:grid-cols-[minmax(0,1fr)_14rem]' : ''
                        }`}
                    >
                        <div className="space-y-1.5">
                            <label
                                htmlFor={`library-edit-status-${entry._id}`}
                                className="text-sm text-zinc-300"
                            >
                                Status
                            </label>
                            <select
                                id={`library-edit-status-${entry._id}`}
                                value={status}
                                onChange={(event) =>
                                    setStatus(event.target.value as UserGameStatus)
                                }
                                className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                            >
                                {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {showsInterest ? (
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between gap-3">
                                    <label
                                        htmlFor={`library-edit-interest-${entry._id}`}
                                        className="text-sm text-zinc-300"
                                    >
                                        Zainteresowanie
                                    </label>
                                    <span className="text-sm font-medium text-zinc-100">
                                        {interest}
                                    </span>
                                </div>
                                <input
                                    id={`library-edit-interest-${entry._id}`}
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="1"
                                    value={interest}
                                    onChange={(event) =>
                                        setInterest(Number(event.target.value))
                                    }
                                    className="h-10 w-full accent-teal-300"
                                />
                            </div>
                        ) : null}
                    </div>

                    {error ? <p className="text-sm text-red-300">{error}</p> : null}

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex h-9 items-center justify-center rounded-md bg-teal-300 px-3 text-sm font-semibold text-zinc-950 transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? 'Zapisywanie...' : 'Zapisz'}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="inline-flex h-9 items-center justify-center rounded-md bg-zinc-800 px-3 text-sm font-medium text-zinc-100 transition hover:bg-zinc-700"
                        >
                            Anuluj
                        </button>
                    </div>
                </form>
            ) : null}

            {isShowingRuns ? <RunsPanel userGameId={entry._id} /> : null}
            {isShowingAccess ? <AccessPanel userGameId={entry._id} /> : null}
        </li>
    )
}

const AddToLibraryPanel = () => {
    const addGameToLibrary = useMutation(api.library.addGameToLibrary)
    const [searchText, setSearchText] = useState('')
    const [selectedGame, setSelectedGame] = useState<CatalogSearchGame | null>(null)
    const [status, setStatus] = useState<UserGameStatus>('wanted')
    const [interest, setInterest] = useState(50)
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const showsInterest = shouldShowInterest(status)
    const searchArgs = useMemo(() => {
        const trimmed = searchText.trim()
        return trimmed.length >= 2 ? { searchText: trimmed, limit: 10 } : 'skip'
    }, [searchText])
    const results = useQuery(api.library.searchCatalogForLibrary, searchArgs)

    const handleSelectGame = (game: CatalogSearchGame) => {
        setSelectedGame(game)
        setMessage(null)
        setError(null)
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()

        if (!selectedGame) {
            setError('Wybierz grę z katalogu.')
            return
        }

        setMessage(null)
        setError(null)
        setIsSubmitting(true)

        try {
            await addGameToLibrary({
                gameId: selectedGame._id,
                status,
                interest: showsInterest ? interest : 0,
            })
            setMessage(`Dodano: ${selectedGame.title}.`)
            setSelectedGame(null)
            setSearchText('')
            setStatus('wanted')
            setInterest(50)
        } catch (error) {
            setError(getLibraryErrorMessage(error, 'Nie udało się dodać gry.'))
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4">
            <div>
                <h2 className="font-medium text-white">Dodaj grę z katalogu</h2>
                <p className="mt-1 text-sm text-zinc-400">
                    Wyszukaj grę po tytule i ustaw jej początkowy status.
                </p>
            </div>

            <form
                onSubmit={(event) => void handleSubmit(event)}
                className="mt-4 space-y-4"
            >
                <div className="space-y-1.5">
                    <label
                        htmlFor="library-catalog-search"
                        className="text-sm text-zinc-300"
                    >
                        Szukaj w katalogu
                    </label>
                    <input
                        id="library-catalog-search"
                        value={searchText}
                        onChange={(event) => {
                            setSearchText(event.target.value)
                            setSelectedGame(null)
                        }}
                        className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-teal-300"
                        placeholder="Minimum 2 znaki"
                        autoCapitalize="off"
                        autoCorrect="off"
                        spellCheck={false}
                    />
                </div>

                {searchText.trim().length >= 2 ? (
                    <div className="overflow-hidden rounded-md border border-zinc-800">
                        {results === undefined ? (
                            <div className="bg-zinc-950/50 px-3 py-4 text-sm text-zinc-400">
                                Szukam...
                            </div>
                        ) : results.length > 0 ? (
                            <ul className="max-h-80 divide-y divide-zinc-800 overflow-auto">
                                {results.map((game) => {
                                    const isSelected = selectedGame?._id === game._id
                                    return (
                                        <li key={game._id}>
                                            <button
                                                type="button"
                                                onClick={() => handleSelectGame(game)}
                                                disabled={game.isInLibrary}
                                                className={`grid w-full grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-3 bg-zinc-950/50 px-3 py-3 text-left transition ${
                                                    isSelected
                                                        ? 'outline outline-1 outline-teal-300'
                                                        : ''
                                                } ${
                                                    game.isInLibrary
                                                        ? 'cursor-not-allowed opacity-55'
                                                        : 'hover:bg-zinc-900'
                                                }`}
                                            >
                                                <Cover game={game} />
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium text-zinc-100">
                                                        {game.title}
                                                    </p>
                                                    <p className="mt-1 text-xs text-zinc-400">
                                                        {formatRelease(game)}
                                                    </p>
                                                </div>
                                                <span className="text-xs text-zinc-500">
                                                    {game.isInLibrary
                                                        ? 'już dodana'
                                                        : isSelected
                                                          ? 'wybrana'
                                                          : 'wybierz'}
                                                </span>
                                            </button>
                                        </li>
                                    )
                                })}
                            </ul>
                        ) : (
                            <div className="bg-zinc-950/50 px-3 py-4 text-sm text-zinc-400">
                                Brak wyników.
                            </div>
                        )}
                    </div>
                ) : null}

                <div
                    className={`grid gap-4 ${
                        showsInterest ? 'md:grid-cols-[minmax(0,1fr)_14rem]' : ''
                    }`}
                >
                    <div className="space-y-1.5">
                        <label htmlFor="library-status" className="text-sm text-zinc-300">
                            Status
                        </label>
                        <select
                            id="library-status"
                            value={status}
                            onChange={(event) =>
                                setStatus(event.target.value as UserGameStatus)
                            }
                            className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                        >
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {showsInterest ? (
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-3">
                                <label
                                    htmlFor="library-interest"
                                    className="text-sm text-zinc-300"
                                >
                                    Zainteresowanie
                                </label>
                                <span className="text-sm font-medium text-zinc-100">
                                    {interest}
                                </span>
                            </div>
                            <input
                                id="library-interest"
                                type="range"
                                min="0"
                                max="100"
                                step="1"
                                value={interest}
                                onChange={(event) =>
                                    setInterest(Number(event.target.value))
                                }
                                className="h-10 w-full accent-teal-300"
                            />
                        </div>
                    ) : null}
                </div>

                {selectedGame ? (
                    <div className="flex items-center gap-3 rounded-md border border-zinc-800 bg-zinc-950/50 p-3">
                        <Cover game={selectedGame} />
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-zinc-100">
                                {selectedGame.title}
                            </p>
                            <p className="mt-1 text-xs text-zinc-400">
                                {formatRelease(selectedGame)}
                            </p>
                        </div>
                    </div>
                ) : null}

                {message ? <p className="text-sm text-teal-200">{message}</p> : null}
                {error ? <p className="text-sm text-red-300">{error}</p> : null}

                <button
                    type="submit"
                    disabled={isSubmitting || !selectedGame || selectedGame.isInLibrary}
                    className="inline-flex h-10 items-center justify-center rounded-md bg-teal-300 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting ? 'Dodawanie...' : 'Dodaj do kupki'}
                </button>
            </form>
        </section>
    )
}

export const LibraryPage = () => {
    const [activeView, setActiveView] = useState<LibraryView>('all')

    return (
        <div className="mt-8 space-y-5">
            <AddToLibraryPanel />
            <LibraryViewTabs activeView={activeView} onChange={setActiveView} />

            {activeView === 'all' ? <LibraryAllPanel /> : null}
            {activeView === 'backlog' ? <BacklogPanel /> : null}
            {activeView === 'active' ? <ActiveRunsPanel /> : null}
            {activeView === 'history' ? <HistoryPanel /> : null}
            {activeView === 'releases' ? <ReleaseCalendarPanel /> : null}
        </div>
    )
}
