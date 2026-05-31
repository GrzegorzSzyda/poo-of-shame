import { DatabaseIcon, UploadSimpleIcon } from '@phosphor-icons/react'
import { useConvexAuth, useMutation, useQuery } from 'convex/react'
import { useMemo, useState } from 'react'
import { Button } from '~/components/Button'
import { H1 } from '~/components/H1'
import { useToast } from '~/components/Toast'
import { api } from '../../convex/_generated/api'
import { ErrorView } from '../layout/ErrorView'

type ParsedItem = {
    title: string
    releaseDate: string
    coverImageUrl: string
}

const isValidIsoDate = (value: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
    const parsed = new Date(`${value}T00:00:00.000Z`)
    if (Number.isNaN(parsed.getTime())) return false
    return parsed.toISOString().slice(0, 10) === value
}

const normalizeReleaseDate = (value: string) => {
    const trimmed = value.trim()
    if (isValidIsoDate(trimmed)) return trimmed

    const plMatch = trimmed.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
    if (!plMatch) return ''
    const [, day, month, year] = plMatch
    const iso = `${year}-${month}-${day}`
    return isValidIsoDate(iso) ? iso : ''
}

const normalizeCoverUrl = (value: string) => {
    const trimmed = value.trim()
    if (trimmed.length === 0) return ''
    try {
        const parsed = new URL(trimmed)
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return ''
        return parsed.toString()
    } catch {
        return ''
    }
}

const parseInput = (input: string) => {
    const lines = input
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)

    const valid: ParsedItem[] = []
    const errors: string[] = []

    lines.forEach((line, index) => {
        const parts = line.split('|').map((part) => part.trim())
        if (parts.length < 3) {
            errors.push(`Linia ${index + 1}: niepoprawny format.`)
            return
        }

        const title = parts[0] ?? ''
        const releaseDate = normalizeReleaseDate(parts[1] ?? '')
        const coverImageUrl = normalizeCoverUrl(parts.slice(2).join('|'))

        if (!title) {
            errors.push(`Linia ${index + 1}: pusty tytuł.`)
            return
        }

        if (!releaseDate) {
            errors.push(`Linia ${index + 1}: niepoprawna data.`)
            return
        }

        if (!coverImageUrl) {
            errors.push(`Linia ${index + 1}: niepoprawny URL okładki.`)
            return
        }

        valid.push({ title, releaseDate, coverImageUrl })
    })

    return { valid, errors, total: lines.length }
}

export const CheatsBulkImportPage = () => {
    const { isAuthenticated } = useConvexAuth()
    const canManageGames = useQuery(api.games.canManage, isAuthenticated ? {} : 'skip')
    const bulkUpsertGames = useMutation(api.games.bulkUpsertGames)
    const { success, error: showError } = useToast()

    const [inputValue, setInputValue] = useState('')
    const [errorValue, setErrorValue] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [summary, setSummary] = useState<{
        total: number
        accepted: number
        created: number
        updated: number
    } | null>(null)

    const parsedPreview = useMemo(() => parseInput(inputValue), [inputValue])

    const handleImport = async () => {
        const parsed = parseInput(inputValue)
        setErrorValue(parsed.errors.join('\n'))

        if (parsed.total === 0) {
            showError('Wklej przynajmniej jedną linię.')
            return
        }

        if (parsed.valid.length === 0) {
            showError('Brak poprawnych rekordów do importu.')
            return
        }

        setIsSubmitting(true)

        try {
            const result = await bulkUpsertGames({ items: parsed.valid })
            setSummary({
                total: parsed.total,
                accepted: parsed.valid.length,
                created: result.created,
                updated: result.updated,
            })
            success(
                `Import zakończony (${result.created} nowych, ${result.updated} zaktualizowanych).`,
            )
        } catch {
            showError('Nie udało się wykonać importu.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (canManageGames === undefined) {
        return <div className="text-text/70">Ładowanie importu...</div>
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
            <H1 startIcon={DatabaseIcon}>Cheaty: Import wzbogaconych list</H1>
            <p className="text-text/80">
                Wklej linie w formacie: <code>tytuł | data | cover URL</code>. Data może
                być w formacie <code>YYYY-MM-DD</code> albo <code>DD.MM.YYYY</code>.
            </p>

            <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                    <p className="text-sm text-teal-100">Dane wejściowe</p>
                    <textarea
                        className="placeholder:text-text/45 h-[24rem] w-full resize-y rounded-md border border-teal-300/40 bg-black/20 px-3 py-2 text-base leading-relaxed text-teal-100 transition-colors outline-none focus:border-teal-400"
                        placeholder={`Baldur's Gate 3 | 03.08.2023 | https://...\nCyberpunk 2077 | 2020-12-10 | https://...`}
                        value={inputValue}
                        onChange={(event) => setInputValue(event.target.value)}
                        autoCapitalize="off"
                        autoCorrect="off"
                        spellCheck={false}
                    />
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <p className="text-sm text-red-200">Błędy parsowania</p>
                        <textarea
                            className="placeholder:text-text/45 h-[14rem] w-full resize-y rounded-md border border-red-300/45 bg-black/20 px-3 py-2 text-base leading-relaxed text-red-100 outline-none"
                            value={errorValue}
                            readOnly
                        />
                    </div>

                    <div className="border-text/20 bg-bg/35 rounded-md border px-3 py-2 text-sm">
                        <p className="text-text/90">
                            Podgląd: {parsedPreview.valid.length}/{parsedPreview.total}{' '}
                            poprawnych rekordów
                        </p>
                        {summary ? (
                            <p className="text-text/70 mt-1">
                                Ostatni import: {summary.accepted}/{summary.total}{' '}
                                przyjętych,
                                {` ${summary.created}`} nowych, {summary.updated}{' '}
                                zaktualizowanych.
                            </p>
                        ) : null}
                    </div>
                </div>
            </div>

            <Button
                type="button"
                startIcon={UploadSimpleIcon}
                onClick={handleImport}
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Importowanie...' : 'Importuj do Convexa (1 request)'}
            </Button>
        </section>
    )
}
