import { ClerkProvider, useAuth } from '@clerk/clerk-react'
import { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { type ReactNode, useEffect, useMemo, useState } from 'react'

type RuntimeConfig = {
    convexUrl: string
    clerkPublishableKey: string
}

const ConfigLoading = () => (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-zinc-100">
        <p className="text-sm text-zinc-400">Ładowanie konfiguracji...</p>
    </main>
)

const ConfigError = ({ message }: { message: string }) => (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-zinc-100">
        <div className="max-w-md rounded-lg border border-red-500/30 bg-red-950/30 p-5">
            <h1 className="text-lg font-semibold text-red-100">Brak konfiguracji</h1>
            <p className="mt-2 text-sm leading-6 text-red-100/80">{message}</p>
        </div>
    </main>
)

const InnerProviders = ({
    children,
    client,
    publishableKey,
}: {
    children: ReactNode
    client: ConvexReactClient
    publishableKey: string
}) => (
    <ClerkProvider publishableKey={publishableKey}>
        <ConvexProviderWithClerk client={client} useAuth={useAuth}>
            {children}
        </ConvexProviderWithClerk>
    </ClerkProvider>
)

export const ConvexProviderFromConfig = ({ children }: { children: ReactNode }) => {
    const [config, setConfig] = useState<RuntimeConfig | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadConfig = async () => {
            try {
                const response = await fetch('/config')
                if (!response.ok) {
                    throw new Error('Serwer nie zwrócił konfiguracji runtime.')
                }
                setConfig((await response.json()) as RuntimeConfig)
            } catch (error) {
                setError(error instanceof Error ? error.message : 'Nieznany błąd.')
            }
        }

        void loadConfig()
    }, [])

    const client = useMemo(() => {
        if (!config) return null
        return new ConvexReactClient(config.convexUrl)
    }, [config])

    if (error) return <ConfigError message={error} />
    if (!config || !client) return <ConfigLoading />

    return (
        <InnerProviders client={client} publishableKey={config.clerkPublishableKey}>
            {children}
        </InnerProviders>
    )
}
