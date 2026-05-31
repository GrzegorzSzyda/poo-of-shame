import { useMutation } from 'convex/react'
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { api } from '../../../convex/_generated/api'

type IgdbSettings = {
    clientId: string
    hasClientSecret: boolean
} | null

export const IgdbSettingsForm = ({ igdb }: { igdb?: IgdbSettings }) => {
    const saveIgdbCredentials = useMutation(api.admin.saveIgdbCredentials)
    const [clientId, setClientId] = useState('')
    const [clientSecret, setClientSecret] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (!igdb) return
        setClientId(igdb.clientId)
    }, [igdb])

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setIsSaving(true)
        try {
            await saveIgdbCredentials({
                clientId,
                clientSecret: clientSecret.trim().length > 0 ? clientSecret : undefined,
            })
            setClientSecret('')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <form
            onSubmit={(event) => void handleSubmit(event)}
            className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4"
        >
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
                <div className="space-y-4">
                    <div>
                        <h3 className="font-medium text-white">Konfiguracja IGDB</h3>
                        <p className="mt-1 text-sm text-zinc-400">
                            Sekret jest zapisywany backendowo i nie wraca do przeglądarki.
                            Puste pole sekretu zostawia poprzedni sekret bez zmian.
                        </p>
                    </div>
                    <label className="block">
                        <span className="text-sm text-zinc-300">Client ID</span>
                        <input
                            value={clientId}
                            onChange={(event) => setClientId(event.target.value)}
                            className="mt-1 h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-teal-300"
                            autoCapitalize="off"
                            autoCorrect="off"
                            spellCheck={false}
                        />
                    </label>
                    <label className="block">
                        <span className="text-sm text-zinc-300">Client Secret</span>
                        <input
                            value={clientSecret}
                            onChange={(event) => setClientSecret(event.target.value)}
                            type="password"
                            className="mt-1 h-10 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:border-teal-300"
                            autoCapitalize="off"
                            autoCorrect="off"
                            spellCheck={false}
                            placeholder={
                                igdb?.hasClientSecret
                                    ? 'Sekret jest zapisany'
                                    : 'Wymagany przy pierwszym zapisie'
                            }
                        />
                    </label>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="inline-flex h-10 items-center justify-center rounded-md bg-teal-300 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSaving ? 'Zapisywanie...' : 'Zapisz IGDB'}
                    </button>
                </div>

                <aside className="rounded-md border border-zinc-800 bg-zinc-950/70 p-4 text-sm leading-6 text-zinc-300">
                    <h4 className="font-medium text-zinc-100">
                        Jak wygenerować świeże dane IGDB
                    </h4>
                    <ol className="mt-2 list-decimal space-y-1 pl-4">
                        <li>Wejdź w Twitch Developer Console.</li>
                        <li>Zarejestruj aplikację albo otwórz istniejącą.</li>
                        <li>Skopiuj Client ID.</li>
                        <li>Wygeneruj nowy Client Secret i wklej go tutaj.</li>
                        <li>
                            IGDB używa Twitch OAuth client credentials, więc token
                            aplikacyjny generuje backend z Client ID i Secret.
                        </li>
                    </ol>
                    <div className="mt-3 flex flex-wrap gap-3">
                        <a
                            href="https://dev.twitch.tv/console/apps"
                            target="_blank"
                            rel="noreferrer"
                            className="text-teal-300 hover:text-teal-200"
                        >
                            Twitch Console
                        </a>
                        <a
                            href="https://api-docs.igdb.com/#getting-started"
                            target="_blank"
                            rel="noreferrer"
                            className="text-teal-300 hover:text-teal-200"
                        >
                            IGDB docs
                        </a>
                    </div>
                </aside>
            </div>
        </form>
    )
}
