import { fetchJson } from './fetchJson'

export const fetchIgdb = <T>(resource: string, body: string): Promise<T> => {
    const sanitizedResource = resource.replace(/^\/+/, '')
    if (!sanitizedResource) {
        throw new Error('IGDB resource is required')
    }
    const base = getProxyOrigin()
    const targetUrl = `${base}/igdb/${sanitizedResource}`
    return fetchJson<T>(targetUrl, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'text/plain' },
        body,
    })
}

const getProxyOrigin = () => {
    const fromProcess = (globalThis as { process?: { env?: Record<string, string> } })
        ?.process?.env?.['BUN_PUBLIC_IGDB_PROXY_ORIGIN']
    const fromImportMeta =
        typeof import.meta !== 'undefined'
            ? ((import.meta as unknown as { env?: Record<string, string | undefined> })
                  .env?.['BUN_PUBLIC_IGDB_PROXY_ORIGIN'] as string | undefined)
            : undefined
    const origin = fromProcess ?? fromImportMeta ?? defaultProxyOrigin()
    return origin.replace(/\/$/, '')
}

const defaultProxyOrigin = () => {
    if (typeof window !== 'undefined') {
        const { hostname } = window.location
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:8787'
        }
    }
    return ''
}
