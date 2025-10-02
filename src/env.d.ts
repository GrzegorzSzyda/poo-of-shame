interface ImportMetaEnv {
    readonly VITE_API_URL?: string
    readonly VITE_PORT?: string
    readonly VITE_PREVIEW_PORT?: string
}
interface ImportMeta {
    readonly env: ImportMetaEnv
}
