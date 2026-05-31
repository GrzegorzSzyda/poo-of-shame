import { serve } from 'bun'
import index from './index.html'

const convexUrl = Bun.env.CONVEX_URL
const clerkPublishableKey = Bun.env.CLERK_PUBLISHABLE_KEY
const port = Number(Bun.env.PORT ?? 3001)

if (!convexUrl) {
    throw new Error('CONVEX_URL is not defined.')
}

if (!clerkPublishableKey) {
    throw new Error('CLERK_PUBLISHABLE_KEY is not defined.')
}

const server = serve({
    port,
    routes: {
        '/config': {
            GET: () => Response.json({ convexUrl, clerkPublishableKey }),
        },
        '/*': index,
    },
    development: process.env.NODE_ENV !== 'production' && {
        hmr: true,
        console: true,
    },
})

console.log(`Server running at ${server.url}`)
