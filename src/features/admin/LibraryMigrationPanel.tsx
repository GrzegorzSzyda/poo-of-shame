import { useMutation, useQuery } from 'convex/react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../../../convex/_generated/api'

const getMigrationErrorMessage = (error: unknown) =>
    error instanceof Error ? error.message : 'Nie udało się uruchomić migracji.'

export const LibraryMigrationPanel = () => {
    const preview = useQuery(api.migrations.getLibraryMigrationPreview, {})
    const accessBackfillPreview = useQuery(
        api.migrations.getGameAccessBackfillPreview,
        {},
    )
    const runBatch = useMutation(api.migrations.runLibraryMigrationBatch)
    const runAccessBackfill = useMutation(api.migrations.backfillGameAccessBatch)
    const [limit, setLimit] = useState(25)
    const [result, setResult] = useState<Awaited<ReturnType<typeof runBatch>> | null>(
        null,
    )
    const [accessBackfillResult, setAccessBackfillResult] = useState<Awaited<
        ReturnType<typeof runAccessBackfill>
    > | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isBackfillingAccess, setIsBackfillingAccess] = useState(false)

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setError(null)
        setResult(null)
        setIsSubmitting(true)

        try {
            const nextResult = await runBatch({ limit })
            setResult(nextResult)
        } catch (error) {
            setError(getMigrationErrorMessage(error))
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleAccessBackfill = async (event: FormEvent) => {
        event.preventDefault()
        setError(null)
        setAccessBackfillResult(null)
        setIsBackfillingAccess(true)

        try {
            const nextResult = await runAccessBackfill({ limit })
            setAccessBackfillResult(nextResult)
        } catch (error) {
            setError(getMigrationErrorMessage(error))
        } finally {
            setIsBackfillingAccess(false)
        }
    }

    return (
        <section className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900/70 p-4">
            <div>
                <h3 className="font-medium text-white">Migracja starej biblioteki</h3>
                <p className="mt-1 text-sm leading-6 text-zinc-400">
                    Przenosi `libraryEntries` do `userGames`, `gameRuns` i `gameAccess`.
                    Stare wpisy zostają w bazie i są tylko oznaczane jako zmigrowane.
                </p>
            </div>

            {preview === undefined ? (
                <p className="text-sm text-zinc-400">Ładowanie podglądu migracji...</p>
            ) : (
                <div className="grid gap-3 md:grid-cols-4">
                    <MigrationStat label="Legacy wpisy" value={preview.legacyEntries} />
                    <MigrationStat label="Do migracji" value={preview.pendingEntries} />
                    <MigrationStat label="Zmigrowane" value={preview.migratedEntries} />
                    <MigrationStat label="Brakujące gry" value={preview.missingGames} />
                    <MigrationStat
                        label="Nowe userGames"
                        value={preview.userGamesToCreate}
                    />
                    <MigrationStat
                        label="Runy do utworzenia"
                        value={preview.runsToCreate}
                    />
                    <MigrationStat
                        label="Dostępy do utworzenia"
                        value={preview.accessRecordsToCreate}
                    />
                    <MigrationStat
                        label="Już istniejące userGames"
                        value={preview.existingUserGames}
                    />
                </div>
            )}

            <form
                onSubmit={(event) => void handleSubmit(event)}
                className="flex flex-wrap items-end gap-3"
            >
                <div className="space-y-1.5">
                    <label htmlFor="migration-limit" className="text-sm text-zinc-300">
                        Rozmiar partii
                    </label>
                    <input
                        id="migration-limit"
                        type="number"
                        min="1"
                        max="100"
                        value={limit}
                        onChange={(event) => setLimit(Number(event.target.value))}
                        className="h-10 w-32 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-teal-300"
                    />
                </div>
                <button
                    type="submit"
                    disabled={
                        isSubmitting ||
                        preview === undefined ||
                        preview.pendingEntries === 0
                    }
                    className="inline-flex h-10 items-center justify-center rounded-md bg-teal-300 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting ? 'Migruję...' : 'Migruj partię'}
                </button>
            </form>

            {result ? (
                <div className="rounded-md border border-teal-900/70 bg-teal-950/30 p-3 text-sm text-teal-100">
                    Przetworzono {result.processed}. Utworzono userGames:{' '}
                    {result.createdUserGames}, runy: {result.createdRuns}, dostępy:{' '}
                    {result.createdAccessRecords}. Pozostało: {result.remaining}.
                </div>
            ) : null}

            <div className="border-t border-zinc-800 pt-4">
                <div>
                    <h4 className="font-medium text-white">Backfill dostępu z legacy</h4>
                    <p className="mt-1 text-sm leading-6 text-zinc-400">
                        Uzupełnia brakujące rekordy `gameAccess` na podstawie starych
                        `libraryEntries.platforms`, także dla wpisów już wcześniej
                        oznaczonych jako zmigrowane.
                    </p>
                </div>

                {accessBackfillPreview === undefined ? (
                    <p className="mt-3 text-sm text-zinc-400">
                        Ładowanie podglądu backfillu dostępu...
                    </p>
                ) : (
                    <div className="mt-4 grid gap-3 md:grid-cols-4">
                        <MigrationStat
                            label="Legacy z platformami"
                            value={accessBackfillPreview.legacyEntriesWithPlatforms}
                        />
                        <MigrationStat
                            label="Z mapą do userGame"
                            value={accessBackfillPreview.entriesWithResolvableUserGame}
                        />
                        <MigrationStat
                            label="Brak userGame"
                            value={accessBackfillPreview.entriesMissingUserGame}
                        />
                        <MigrationStat
                            label="Brakujące dostępy"
                            value={accessBackfillPreview.accessRecordsMissing}
                        />
                    </div>
                )}

                <form
                    onSubmit={(event) => void handleAccessBackfill(event)}
                    className="mt-4 flex flex-wrap items-end gap-3"
                >
                    <div className="space-y-1.5">
                        <label
                            htmlFor="migration-access-limit"
                            className="text-sm text-zinc-300"
                        >
                            Rozmiar partii
                        </label>
                        <input
                            id="migration-access-limit"
                            type="number"
                            min="1"
                            max="100"
                            value={limit}
                            onChange={(event) => setLimit(Number(event.target.value))}
                            className="h-10 w-32 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-teal-300"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={
                            isBackfillingAccess ||
                            accessBackfillPreview === undefined ||
                            accessBackfillPreview.accessRecordsMissing === 0
                        }
                        className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-100 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isBackfillingAccess ? 'Uzupełniam...' : 'Uzupełnij dostępy'}
                    </button>
                </form>

                {accessBackfillResult ? (
                    <div className="mt-4 rounded-md border border-teal-900/70 bg-teal-950/30 p-3 text-sm text-teal-100">
                        Sprawdzono {accessBackfillResult.inspectedEntries} wpisów.
                        Uzupełniono wpisy: {accessBackfillResult.entriesWithCreatedAccess}
                        , dodane dostępy: {accessBackfillResult.createdAccessRecords}.
                        Brakujący `userGame`:{' '}
                        {accessBackfillResult.skippedMissingUserGame}. Pozostało
                        brakujących dostępów:{' '}
                        {accessBackfillResult.remainingAccessRecordsMissing}.
                    </div>
                ) : null}
            </div>

            {error ? <p className="text-sm text-red-300">{error}</p> : null}
        </section>
    )
}

const MigrationStat = ({ label, value }: { label: string; value: number }) => (
    <div className="rounded-md border border-zinc-800 bg-zinc-950/60 p-3">
        <p className="text-xs text-zinc-500">{label}</p>
        <p className="mt-1 text-lg font-semibold text-zinc-100">{value}</p>
    </div>
)
