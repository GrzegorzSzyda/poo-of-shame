import { ClerkProvider, useAuth } from '@clerk/clerk-react'
import { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import { type ReactNode, useEffect, useMemo, useState } from 'react'

type Config = {
    convexUrl: string
    clerkPublishableKey: string
}

const InnerProviders = ({
    client,
    publishableKey,
    children,
}: {
    client: ConvexReactClient
    publishableKey: string
    children: ReactNode
}) => (
    <ClerkProvider publishableKey={publishableKey}>
        <ConvexProviderWithClerk client={client} useAuth={useAuth}>
            {children}
        </ConvexProviderWithClerk>
    </ClerkProvider>
)

export const ConvexProviderFromConfig = ({ children }: { children: ReactNode }) => {
    const [config, setConfig] = useState<Config | null>(null)

    useEffect(() => {
        void (async () => {
            const response = await fetch('/config')
            const data = (await response.json()) as Config
            setConfig(data)
        })()
    }, [])

    const client = useMemo(() => {
        if (!config) return null
        return new ConvexReactClient(config.convexUrl)
    }, [config])

    if (!config || !client) return <div>Ładuję konfigurację…</div>

    return (
        <InnerProviders client={client} publishableKey={config.clerkPublishableKey}>
            {children}
        </InnerProviders>
    )
}
