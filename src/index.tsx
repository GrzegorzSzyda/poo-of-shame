import { serve } from 'bun'
import index from './index.html'

const server = serve({
    routes: {
        '/*': index,
    },
})

console.info(`🚀 Server running at ${server.url}`)
