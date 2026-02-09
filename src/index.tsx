import { serve } from 'bun'
import index from './index.html'
import { igdbRoutes } from './server/igdbProxy'

const server = serve({
    routes: {
        ...igdbRoutes,
        '/*': index,
    },

    development: process.env.NODE_ENV !== 'production' && {
        hmr: true,
        console: true,
    },
})

console.log(`🚀 Server running at ${server.url}`)
