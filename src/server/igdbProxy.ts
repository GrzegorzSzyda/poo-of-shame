import { type BunRequest } from 'bun'

const IGDB_API_BASE_URL = 'https://api.igdb.com/v4'
const IGDB_CLIENT_ID = Bun.env.IGDB_CLIENT_ID
const IGDB_CLIENT_SECRET = Bun.env.IGDB_CLIENT_SECRET
const IGDB_STATIC_TOKEN = Bun.env.IGDB_ACCESS_TOKEN

if (!IGDB_CLIENT_ID) {
    throw new Error('Missing IGDB_CLIENT_ID in environment variables.')
}

type TokenCache = {
    token: string
    expiresAt: number
    static: boolean
}

let cachedToken: TokenCache | null = IGDB_STATIC_TOKEN
    ? {
          token: IGDB_STATIC_TOKEN,
          expiresAt: Number.POSITIVE_INFINITY,
          static: true,
      }
    : null

const corsHeaders = (origin: string | null) => ({
    'Access-Control-Allow-Origin': origin ?? '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
})

const fetchNewToken = async () => {
    if (!IGDB_CLIENT_SECRET) {
        throw new Error(
            'Missing IGDB_CLIENT_SECRET. Provide IGDB_ACCESS_TOKEN or IGDB_CLIENT_SECRET in env.',
        )
    }

    const body = new URLSearchParams({
        client_id: IGDB_CLIENT_ID,
        client_secret: IGDB_CLIENT_SECRET,
        grant_type: 'client_credentials',
    })

    const response = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(
            `Unable to obtain Twitch access token (${response.status}): ${error}`,
        )
    }

    const payload = (await response.json()) as {
        access_token: string
        expires_in: number
    }

    cachedToken = {
        token: payload.access_token,
        expiresAt: Date.now() + payload.expires_in * 1000 - 60_000,
        static: false,
    }

    return cachedToken
}

const getAccessToken = async (forceRefresh = false) => {
    if (!forceRefresh && cachedToken && cachedToken.expiresAt > Date.now()) {
        return cachedToken
    }
    return fetchNewToken()
}

const sanitizeResource = (resource: string) => {
    const trimmed = resource.replace(/^\/+/, '').replace(/\/+$/, '')
    if (!trimmed) {
        throw new Error('Resource cannot be empty.')
    }
    if (!/^[a-z0-9/_-]+$/i.test(trimmed)) {
        throw new Error('Invalid IGDB resource path.')
    }
    return trimmed
}

const forwardIgdbRequest = async (
    resource: string,
    query: string,
    token: string,
) =>
    fetch(`${IGDB_API_BASE_URL}/${resource}`, {
        method: 'POST',
        headers: {
            'Client-ID': IGDB_CLIENT_ID,
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'text/plain',
        },
        body: query,
    })

const handleIgdbPost = async (
    req: BunRequest<'/api/igdb/:resource'>,
): Promise<Response> => {
    const origin = req.headers.get('origin')
    let requestPayload: unknown

    try {
        requestPayload = await req.json()
    } catch {
        return new Response(
            JSON.stringify({ error: 'Invalid JSON payload received.' }),
            {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders(origin),
                },
            },
        )
    }

    const query =
        typeof requestPayload === 'object' && requestPayload !== null
            ? (requestPayload as { query?: unknown }).query
            : undefined

    if (typeof query !== 'string' || !query.trim()) {
        return new Response(JSON.stringify({ error: 'Query is required.' }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders(origin),
            },
        })
    }

    let resource: string
    try {
        resource = sanitizeResource(req.params.resource)
    } catch (error) {
        return new Response(
            JSON.stringify({ error: (error as Error).message }),
            {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders(origin),
                },
            },
        )
    }

    let token = await getAccessToken()
    let igdbResponse = await forwardIgdbRequest(resource, query, token.token)

    if (igdbResponse.status === 401 && !token.static) {
        cachedToken = null
        token = await getAccessToken(true)
        igdbResponse = await forwardIgdbRequest(resource, query, token.token)
    }

    const responseHeaders = new Headers({
        ...corsHeaders(origin),
        'Content-Type':
            igdbResponse.headers.get('Content-Type') ?? 'application/json',
    })

    const rateLimitHeaders = [
        'Ratelimit-Limit',
        'Ratelimit-Remaining',
        'Ratelimit-Reset',
    ]

    for (const header of rateLimitHeaders) {
        const value = igdbResponse.headers.get(header)
        if (value) {
            responseHeaders.set(`x-igdb-${header.toLowerCase()}`, value)
        }
    }

    const responseBody = await igdbResponse.arrayBuffer()

    return new Response(responseBody, {
        status: igdbResponse.status,
        headers: responseHeaders,
    })
}

const handleIgdbOptions = (req: BunRequest<'/api/igdb/:resource'>) =>
    new Response(null, {
        status: 204,
        headers: corsHeaders(req.headers.get('origin')),
    })

export const igdbRoutes = {
    '/api/igdb/:resource': {
        OPTIONS: handleIgdbOptions,
        POST: handleIgdbPost,
    },
}
