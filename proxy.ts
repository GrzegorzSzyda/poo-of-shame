// oxlint-disable no-default-export
// oxlint-disable func-style
const env = process.env || {}

const CLIENT_ID = env['TWITCH_CLIENT_ID']
const CLIENT_SECRET = env['TWITCH_CLIENT_SECRET']
const STATIC_TOKEN = env['TWITCH_TOKEN']
const PORT = Number(env['PROXY_PORT'] || 8787)
const ALLOWED_ORIGIN = env['ALLOWED_ORIGIN'] || 'http://localhost:3000'

if (!CLIENT_ID) {
    throw new Error('Brakuje TWITCH_CLIENT_ID w env.')
}
const CLIENT_ID_VALUE = CLIENT_ID

let cachedToken: string | null = null
let tokenExp = 0
const preferStaticToken = Boolean(STATIC_TOKEN && !CLIENT_SECRET)

async function fetchAppToken(forceRefresh = false): Promise<string> {
    if (preferStaticToken) return STATIC_TOKEN!

    const now = Math.floor(Date.now() / 1000)
    if (!forceRefresh && cachedToken && now < tokenExp - 60) return cachedToken

    const clientSecret = CLIENT_SECRET
    if (!clientSecret) {
        throw new Error(
            'Brakuje TWITCH_CLIENT_SECRET. Podaj TWITCH_TOKEN albo TWITCH_CLIENT_SECRET w env.',
        )
    }

    const body = new URLSearchParams({
        client_id: CLIENT_ID_VALUE,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
    })

    const r = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
    })

    if (!r.ok) {
        const t = await r.text()
        throw new Error(`Token error: ${r.status} ${t}`)
    }
    const j = (await r.json()) as { access_token: string; expires_in: number }
    cachedToken = j.access_token
    tokenExp = Math.floor(Date.now() / 1000) + j.expires_in
    return cachedToken!
}

function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    }
}

function badRequest(msg: string, code = 400) {
    return new Response(JSON.stringify({ error: msg }), {
        status: code,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    })
}

export default {
    port: PORT,
    fetch: async (req: Request) => {
        const url = new URL(req.url)
        if (req.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders() })
        }

        if (url.pathname.startsWith('/igdb/')) {
            const resource = url.pathname.replace('/igdb/', '')
            if (!resource) return badRequest('Brakuje resource (np. /igdb/games)')

            const apicalypse = await req.text()

            const forward = async (tokenValue: string) =>
                fetch(`https://api.igdb.com/v4/${resource}`, {
                    method: 'POST',
                    headers: {
                        'Client-ID': CLIENT_ID_VALUE,
                        'Authorization': `Bearer ${tokenValue}`,
                        'Accept': 'application/json',
                        'Content-Type': 'text/plain',
                    },
                    body: apicalypse,
                })

            let token = await fetchAppToken()
            let upstream = await forward(token)

            if (upstream.status === 401 && !preferStaticToken) {
                cachedToken = null
                tokenExp = 0
                token = await fetchAppToken(true)
                upstream = await forward(token)
            }

            const responseBody = await upstream.arrayBuffer()
            const h = new Headers(corsHeaders())
            h.set(
                'Content-Type',
                upstream.headers.get('Content-Type') || 'application/json',
            )
            const pass = ['Ratelimit-Limit', 'Ratelimit-Remaining', 'Ratelimit-Reset']
            for (const k of pass) {
                const v = upstream.headers.get(k)
                if (v) h.set(`x-igdb-${k.toLowerCase()}`, v)
            }
            return new Response(responseBody, { status: upstream.status, headers: h })
        }

        return badRequest('Użyj ścieżki /igdb/<resource> (np. /igdb/games).')
    },
}

console.log(`IGDB proxy running on http://localhost:${PORT}`)
