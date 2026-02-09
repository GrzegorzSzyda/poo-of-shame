import { serve } from 'bun'
import index from './index.html'
import { igdbRoutes } from './server/igdbProxy'

const convexUrl = Bun.env.CONVEX_URL

if (typeof convexUrl !== 'string' || convexUrl.length === 0) {
    throw new Error('CONVEX_URL is not defined in .env')
}

const server = serve({
    routes: {
        '/config': {
            GET: () => Response.json({ convexUrl }),
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
