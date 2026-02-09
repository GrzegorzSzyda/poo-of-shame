import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { type ReactNode, useEffect, useMemo, useState } from 'react'

type Config = {
    convexUrl: string
}

export const ConvexProviderFromConfig = ({ children }: { children: ReactNode }) => {
    const [convexUrl, setConvexUrl] = useState<string | null>(null)

    useEffect(() => {
        void (async () => {
            const response = await fetch('/config')
            if (!response.ok) {
                throw new Error('Failed to load /config')
            }

            const data = (await response.json()) as Config

            if (typeof data.convexUrl !== 'string' || data.convexUrl.length === 0) {
                throw new Error('Invalid /config response: convexUrl missing')
            }

            setConvexUrl(data.convexUrl)
        })()
    }, [])

    const client = useMemo(() => {
        if (!convexUrl) return null
        return new ConvexReactClient(convexUrl)
    }, [convexUrl])

    if (!client) {
        return <div style={{ padding: 16 }}>Ładuję konfigurację…</div>
    }

    return <ConvexProvider client={client}>{children}</ConvexProvider>
}
