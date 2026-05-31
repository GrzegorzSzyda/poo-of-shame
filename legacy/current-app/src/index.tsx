import { serve } from 'bun'
import index from './index.html'
import { igdbRoutes } from './server/igdbProxy'

const convexUrl = Bun.env.CONVEX_URL
if (typeof convexUrl !== 'string' || convexUrl.length === 0) {
    throw new Error('CONVEX_URL is not defined in .env')
}

const clerkPublishableKey = Bun.env.CLERK_PUBLISHABLE_KEY
if (typeof clerkPublishableKey !== 'string' || clerkPublishableKey.length === 0) {
    throw new Error('CLERK_PUBLISHABLE_KEY is not defined in .env')
}

const server = serve({
    routes: {
        '/config': {
            GET: () => Response.json({ convexUrl, clerkPublishableKey }),
        },
        ...igdbRoutes,
        '/*': index,
    },

    development: process.env.NODE_ENV !== 'production' && {
        hmr: true,
        console: true,
    },
})

console.log(`🚀 Server running at ${server.url}`)
