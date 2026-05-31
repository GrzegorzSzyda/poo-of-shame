import { useAction, useMutation } from 'convex/react'
import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { api } from '../../../convex/_generated/api'

type ReleasePrecision = 'exact' | 'year' | 'quarter' | 'month' | 'text' | 'unknown'

const releasePrecisionOptions: Array<{ value: ReleasePrecision; label: string }> = [
    { value: 'exact', label: 'Dokładna data' },
    { value: 'year', label: 'Rok' },
    { value: 'quarter', label: 'Kwartał' },
    { value: 'month', label: 'Miesiąc' },
    { value: 'text', label: 'Opis tekstowy' },
    { value: 'unknown', label: 'Nieznana' },
]

const FieldLabel = ({ children, htmlFor }: { children: ReactNode; htmlFor: string }) => (
    <label htmlFor={htmlFor} className="text-sm text-zinc-300">
        {children}
    </label>
)

export const AddGameForm = () => {
    const createGame = useMutation(api.games.createGame)
    const uploadCoverFromUrl = useAction(api.games.uploadCoverFromUrl)
    const [title, setTitle] = useState('')
    const [releasePrecision, setReleasePrecision] = useState<ReleasePrecision>('exact')
    const [releaseDate, setReleaseDate] = useState('')
    const [releaseYear, setReleaseYear] = useState('')
    const [releaseQuarter, setReleaseQuarter] = useState('1')
    const [releaseMonth, setReleaseMonth] = useState('1')
    const [releaseText, setReleaseText] = useState('')
    const [coverUrl, setCoverUrl] = useState('')
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const resetForm = () => {
        setTitle('')
        setReleasePrecision('exact')
        setReleaseDate('')
        setReleaseYear('')
        setReleaseQuarter('1')
        setReleaseMonth('1')
        setReleaseText('')
        setCoverUrl('')
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setMessage(null)
        setError(null)
        setIsSubmitting(true)

        try {
            const trimmedCoverUrl = coverUrl.trim()
            const uploadedCoverUrl =
                trimmedCoverUrl.length > 0
                    ? await uploadCoverFromUrl({ sourceUrl: trimmedCoverUrl })
                    : undefined

            await createGame({
                title,
                releasePrecision,
                releaseDate: releaseDate || undefined,
                releaseYear: releaseYear ? Number(releaseYear) : undefined,
                releaseQuarter: releaseQuarter ? Number(releaseQuarter) : undefined,
                releaseMonth: releaseMonth ? Number(releaseMonth) : undefined,
                releaseText: releaseText || undefined,
                coverImageUrl: uploadedCoverUrl,
            })

            resetForm()
            setMessage('Dodano grę do katalogu.')
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Nie udało się dodać gry.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form
            onSubmit={(event) => void handleSubmit(event)}
            className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4"
        >
            <div className="space-y-4">
                <div>
                    <h3 className="font-medium text-white">Dodaj grę do katalogu</h3>
                    <p className="mt-1 text-sm text-zinc-400">
                        Okładka jest opcjonalna. Jeśli podasz URL, backend pobierze obraz
                        i zapisze go w Convex storage.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                        <FieldLabel htmlFor="game-title">Tytuł</FieldLabel>
                        <input
                            id="game-title"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-teal-300"
                            placeholder="Baldur's Gate 3"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <FieldLabel htmlFor="release-precision">Premiera</FieldLabel>
                        <select
                            id="release-precision"
                            value={releasePrecision}
                            onChange={(event) =>
                                setReleasePrecision(
                                    event.target.value as ReleasePrecision,
                                )
                            }
                            className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                        >
                            {releasePrecisionOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {releasePrecision === 'exact' ? (
                    <div className="space-y-1.5">
                        <FieldLabel htmlFor="release-date">Data premiery</FieldLabel>
                        <input
                            id="release-date"
                            type="date"
                            value={releaseDate}
                            onChange={(event) => setReleaseDate(event.target.value)}
                            className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-teal-300"
                        />
                    </div>
                ) : null}

                {releasePrecision === 'year' ||
                releasePrecision === 'quarter' ||
                releasePrecision === 'month' ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1.5">
                            <FieldLabel htmlFor="release-year">Rok</FieldLabel>
                            <input
                                id="release-year"
                                type="number"
                                value={releaseYear}
                                onChange={(event) => setReleaseYear(event.target.value)}
                                className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-teal-300"
                                placeholder="2026"
                            />
                        </div>
                        {releasePrecision === 'quarter' ? (
                            <div className="space-y-1.5">
                                <FieldLabel htmlFor="release-quarter">Kwartał</FieldLabel>
                                <select
                                    id="release-quarter"
                                    value={releaseQuarter}
                                    onChange={(event) =>
                                        setReleaseQuarter(event.target.value)
                                    }
                                    className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                                >
                                    <option value="1">Q1</option>
                                    <option value="2">Q2</option>
                                    <option value="3">Q3</option>
                                    <option value="4">Q4</option>
                                </select>
                            </div>
                        ) : null}
                        {releasePrecision === 'month' ? (
                            <div className="space-y-1.5">
                                <FieldLabel htmlFor="release-month">Miesiąc</FieldLabel>
                                <select
                                    id="release-month"
                                    value={releaseMonth}
                                    onChange={(event) =>
                                        setReleaseMonth(event.target.value)
                                    }
                                    className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                                >
                                    {Array.from(
                                        { length: 12 },
                                        (_, index) => index + 1,
                                    ).map((month) => (
                                        <option key={month} value={month}>
                                            {String(month).padStart(2, '0')}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : null}
                    </div>
                ) : null}

                {releasePrecision === 'text' ? (
                    <div className="space-y-1.5">
                        <FieldLabel htmlFor="release-text">Opis premiery</FieldLabel>
                        <input
                            id="release-text"
                            value={releaseText}
                            onChange={(event) => setReleaseText(event.target.value)}
                            className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-teal-300"
                            placeholder="early access 2026"
                        />
                    </div>
                ) : null}

                <div className="space-y-1.5">
                    <FieldLabel htmlFor="cover-url">Cover URL</FieldLabel>
                    <input
                        id="cover-url"
                        type="url"
                        value={coverUrl}
                        onChange={(event) => setCoverUrl(event.target.value)}
                        className="h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-teal-300"
                        placeholder="https://..."
                        autoCapitalize="off"
                        autoCorrect="off"
                        spellCheck={false}
                    />
                </div>

                {message ? <p className="text-sm text-teal-200">{message}</p> : null}
                {error ? <p className="text-sm text-red-300">{error}</p> : null}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex h-10 items-center justify-center rounded-md bg-teal-300 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting ? 'Dodawanie...' : 'Dodaj grę'}
                </button>
            </div>
        </form>
    )
}
