import { ShieldCheckIcon, SparkleIcon } from '@phosphor-icons/react'
import { useConvexAuth, useQuery } from 'convex/react'
import { useEffect, useMemo, useState } from 'react'
import type { IgdbGame } from '~/api/IgdbGame'
import { api as igdbApi } from '~/api/api'
import { Button } from '~/components/Button'
import { H1 } from '~/components/H1'
import { useToast } from '~/components/Toast'
import { formatIsoDatePl } from '~/utils/date'
import { api } from '../../convex/_generated/api'
import { ErrorView } from '../layout/ErrorView'

const ENRICHED_GAMES_STORAGE_KEY = 'cheats:enriched-games'
const FAILED_GAMES_STORAGE_KEY = 'cheats:failed-games'
const PROCESSING_HISTORY_STORAGE_KEY = 'cheats:processing-history'
const MAX_HISTORY_ITEMS = 20

type EnrichedGame = {
    title: string
    releaseDate: string
    coverUrl: string
}

type ProcessingHistoryItem = {
    id: string
    createdAt: number
    total: number
    successCount: number
    failedCount: number
    inputValue: string
    failedValue: string
    enrichedGames: EnrichedGame[]
}

const parseGameTitles = (value: string) =>
    value
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)

const escapeIgdbSearch = (value: string) =>
    value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')

const toReleaseDate = (firstReleaseDate?: number): string => {
    if (!firstReleaseDate) return ''
    const date = new Date(firstReleaseDate * 1000)
    if (Number.isNaN(date.getTime())) return ''
    return date.toISOString().slice(0, 10)
}

const toCoverUrl = (imageId?: string): string =>
    imageId ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${imageId}.jpg` : ''

const formatEnrichedGames = (items: EnrichedGame[]) =>
    items
        .map(
            (item) =>
                `${item.title} | ${formatIsoDatePl(item.releaseDate)} | ${item.coverUrl}`,
        )
        .join('\n')

const formatHistoryDateTime = (timestamp: number) => {
    const date = new Date(timestamp)
    if (Number.isNaN(date.getTime())) return 'Nieznana data'
    return new Intl.DateTimeFormat('pl-PL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date)
}

export const CheatsDataEnrichmentPage = () => {
    const { isAuthenticated } = useConvexAuth()
    const canManageGames = useQuery(api.games.canManage, isAuthenticated ? {} : 'skip')
    const { success, error: showError } = useToast()

    const [inputValue, setInputValue] = useState('')
    const [failedValue, setFailedValue] = useState('')
    const [enrichedGames, setEnrichedGames] = useState<EnrichedGame[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [progress, setProgress] = useState({ done: 0, total: 0 })
    const [history, setHistory] = useState<ProcessingHistoryItem[]>([])

    useEffect(() => {
        try {
            const raw = window.localStorage.getItem(ENRICHED_GAMES_STORAGE_KEY)
            if (!raw) return
            const parsed = JSON.parse(raw) as unknown
            if (!Array.isArray(parsed)) return
            const normalized = parsed
                .filter(
                    (item): item is EnrichedGame =>
                        typeof item === 'object' &&
                        item !== null &&
                        typeof (item as EnrichedGame).title === 'string' &&
                        typeof (item as EnrichedGame).releaseDate === 'string' &&
                        typeof (item as EnrichedGame).coverUrl === 'string',
                )
                .map((item) => ({
                    title: item.title.trim(),
                    releaseDate: item.releaseDate.trim(),
                    coverUrl: item.coverUrl.trim(),
                }))
                .filter(
                    (item) =>
                        item.title.length > 0 &&
                        item.releaseDate.length > 0 &&
                        item.coverUrl.length > 0,
                )
            setEnrichedGames(normalized)
        } catch {
            setEnrichedGames([])
        }
    }, [])

    useEffect(() => {
        const storedFailed = window.localStorage.getItem(FAILED_GAMES_STORAGE_KEY)
        if (!storedFailed) return
        setFailedValue(storedFailed)
    }, [])

    useEffect(() => {
        try {
            const raw = window.localStorage.getItem(PROCESSING_HISTORY_STORAGE_KEY)
            if (!raw) return
            const parsed = JSON.parse(raw) as unknown
            if (!Array.isArray(parsed)) return

            const normalized = parsed
                .filter(
                    (item): item is ProcessingHistoryItem =>
                        typeof item === 'object' &&
                        item !== null &&
                        typeof (item as ProcessingHistoryItem).id === 'string' &&
                        typeof (item as ProcessingHistoryItem).createdAt === 'number' &&
                        typeof (item as ProcessingHistoryItem).total === 'number' &&
                        typeof (item as ProcessingHistoryItem).successCount ===
                            'number' &&
                        typeof (item as ProcessingHistoryItem).failedCount === 'number' &&
                        typeof (item as ProcessingHistoryItem).inputValue === 'string' &&
                        typeof (item as ProcessingHistoryItem).failedValue === 'string' &&
                        Array.isArray((item as ProcessingHistoryItem).enrichedGames),
                )
                .slice(0, MAX_HISTORY_ITEMS)

            setHistory(normalized)
        } catch {
            setHistory([])
        }
    }, [])

    const enrichedValue = useMemo(
        () => formatEnrichedGames(enrichedGames),
        [enrichedGames],
    )

    const handleEnrich = async () => {
        const titles = parseGameTitles(inputValue)
        if (titles.length === 0) {
            showError('Wpisz przynajmniej jeden tytuł gry.')
            return
        }

        setIsProcessing(true)
        setProgress({ done: 0, total: titles.length })

        const failedTitles: string[] = []
        const nextEnrichedGames: EnrichedGame[] = []
        let processedCount = 0

        try {
            for (const title of titles) {
                const query = `fields name,first_release_date,cover.image_id; search "${escapeIgdbSearch(
                    title,
                )}"; limit 1;`
                const results = await igdbApi.fetchIgdb<IgdbGame[]>('games', query)
                const match = results[0]
                if (!match) {
                    failedTitles.push(title)
                    processedCount += 1
                    setProgress({ done: processedCount, total: titles.length })
                    continue
                }

                const releaseDate = toReleaseDate(match.first_release_date)
                const coverUrl = toCoverUrl(match.cover?.image_id)
                if (!releaseDate || !coverUrl) {
                    failedTitles.push(title)
                    processedCount += 1
                    setProgress({ done: processedCount, total: titles.length })
                    continue
                }

                nextEnrichedGames.push({
                    title,
                    releaseDate,
                    coverUrl,
                })
                processedCount += 1
                setProgress({ done: processedCount, total: titles.length })
            }

            setFailedValue(failedTitles.join('\n'))
            window.localStorage.setItem(FAILED_GAMES_STORAGE_KEY, failedTitles.join('\n'))
            setEnrichedGames(nextEnrichedGames)
            window.localStorage.setItem(
                ENRICHED_GAMES_STORAGE_KEY,
                JSON.stringify(nextEnrichedGames),
            )
            const nextHistoryItem: ProcessingHistoryItem = {
                id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                createdAt: Date.now(),
                total: titles.length,
                successCount: nextEnrichedGames.length,
                failedCount: failedTitles.length,
                inputValue,
                failedValue: failedTitles.join('\n'),
                enrichedGames: nextEnrichedGames,
            }
            setHistory((current) => {
                const updated = [nextHistoryItem, ...current].slice(0, MAX_HISTORY_ITEMS)
                window.localStorage.setItem(
                    PROCESSING_HISTORY_STORAGE_KEY,
                    JSON.stringify(updated),
                )
                return updated
            })
            success(
                `Przetworzono ${nextEnrichedGames.length} gier.`,
                failedTitles.length > 0
                    ? `Nie udało się dla ${failedTitles.length}.`
                    : undefined,
            )
        } catch {
            showError('Nie udało się pobrać danych z IGDB.')
        } finally {
            setIsProcessing(false)
        }
    }

    if (canManageGames === undefined) {
        return <div className="text-text/70">Ładowanie cheatów...</div>
    }

    if (!canManageGames) {
        return (
            <ErrorView
                title="403"
                message="Ta sekcja jest dostępna tylko dla administratorów."
            />
        )
    }

    return (
        <section className="space-y-5">
            <H1 startIcon={ShieldCheckIcon}>Cheaty: Wzbogacanie danych</H1>
            <p className="text-text/80">
                Narzędzie do wzbogacania listy gier danymi z IGDB.
            </p>

            <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                    <p className="text-sm text-teal-100">
                        Lista gier (jedna linia = jeden tytuł)
                    </p>
                    <textarea
                        className="placeholder:text-text/45 h-[26rem] w-full resize-y rounded-md border border-teal-300/40 bg-black/20 px-3 py-2 text-base leading-relaxed text-teal-100 transition-colors outline-none focus:border-teal-400"
                        placeholder={`Baldur's Gate 3\nCyberpunk 2077`}
                        value={inputValue}
                        onChange={(event) => setInputValue(event.target.value)}
                        autoCapitalize="off"
                        autoCorrect="off"
                        spellCheck={false}
                    />
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <p className="text-sm text-red-200">Nie udało się przetworzyć</p>
                        <textarea
                            className="placeholder:text-text/45 h-[12rem] w-full resize-y rounded-md border border-red-300/45 bg-black/20 px-3 py-2 text-base leading-relaxed text-red-100 outline-none"
                            value={failedValue}
                            readOnly
                        />
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm text-emerald-200">
                            Przetworzone (tytuł | data premiery | cover URL)
                        </p>
                        <textarea
                            className="placeholder:text-text/45 h-[12rem] w-full resize-y rounded-md border border-emerald-300/45 bg-black/20 px-3 py-2 text-base leading-relaxed text-emerald-100 outline-none"
                            value={enrichedValue}
                            readOnly
                        />
                    </div>
                </div>
            </div>

            <Button
                type="button"
                startIcon={SparkleIcon}
                onClick={handleEnrich}
                disabled={isProcessing}
            >
                {isProcessing ? 'Przetwarzanie...' : 'Wzbogać dane z IGDB'}
            </Button>
            {progress.total > 0 ? (
                <p className="text-text/80 text-sm">
                    Postęp: {progress.done}/{progress.total}
                </p>
            ) : null}

            <div className="space-y-2">
                <p className="text-text/80 text-sm">Historia przetworzeń</p>
                {history.length === 0 ? (
                    <p className="text-text/60 text-sm">Brak zapisanej historii.</p>
                ) : (
                    <ul className="space-y-2">
                        {history.map((item) => (
                            <li
                                key={item.id}
                                className="border-text/20 bg-bg/35 flex items-center justify-between gap-3 rounded-md border px-3 py-2"
                            >
                                <div className="text-sm">
                                    <p className="text-text/90">
                                        {formatHistoryDateTime(item.createdAt)}
                                    </p>
                                    <p className="text-text/70">
                                        {item.successCount}/{item.total} sukces,{' '}
                                        {item.failedCount} błędów
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                        setInputValue(item.inputValue)
                                        setFailedValue(item.failedValue)
                                        setEnrichedGames(item.enrichedGames)
                                        window.localStorage.setItem(
                                            FAILED_GAMES_STORAGE_KEY,
                                            item.failedValue,
                                        )
                                        window.localStorage.setItem(
                                            ENRICHED_GAMES_STORAGE_KEY,
                                            JSON.stringify(item.enrichedGames),
                                        )
                                    }}
                                >
                                    Przywróć
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    )
}
