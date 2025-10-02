import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const isCI = !!process.env.CI
const DEV_PORT = Number(process.env.VITE_PORT || 5173)
const PREVIEW_PORT = Number(process.env.VITE_PREVIEW_PORT || 4173)

export default defineConfig({
    plugins: [react()],
    resolve: { alias: { '~': '/src' } },
    envPrefix: 'VITE_',
    cacheDir: '.vite',
    server: {
        port: DEV_PORT,
        strictPort: isCI,
        cors: true,
        hmr: { overlay: true },
        watch: { ignored: ['**/dist/**', '**/.vite/**', '**/coverage/**'] },
    },
    preview: {
        port: PREVIEW_PORT,
        strictPort: isCI,
    },
    build: {
        target: 'es2022',
        sourcemap: isCI ? 'hidden' : false,
    },
})
