import { ConvexError } from 'convex/values'

export const PLATFORM_OPTIONS = [
    'ps_disc',
    'ps_store',
    'ps_plus',
    'steam',
    'epic',
    'gog',
    'amazon_gaming',
    'ubisoft_connect',
    'xbox',
    'switch',
    'other',
] as const

export type Platform = (typeof PLATFORM_OPTIONS)[number]

export const PROGRESS_STATUS_OPTIONS = [
    'backlog',
    'playing',
    'completed',
    'done',
    'dropped',
] as const

export type ProgressStatus = (typeof PROGRESS_STATUS_OPTIONS)[number]

export type LibraryEntryDraft = {
    gameId: string
    platforms: Platform[]
    rating: number
    wantsToPlay: number
    progressStatus: ProgressStatus
}

export const createDefaultLibraryEntryDraft = (): LibraryEntryDraft => ({
    gameId: '',
    platforms: [],
    rating: 50,
    wantsToPlay: 50,
    progressStatus: 'backlog',
})

const errorMessages: Record<string, string> = {
    UNAUTHORIZED: 'Musisz być zalogowany.',
    GAME_NOT_FOUND: 'Nie znaleziono gry.',
    LIB_ENTRY_ALREADY_EXISTS: 'Ta gra jest już w Twojej bibliotece.',
    LIB_ENTRY_NOT_FOUND: 'Wpis nie istnieje.',
    FORBIDDEN: 'Brak dostępu do tego wpisu.',
    RATING_INVALID: 'Ocena musi być liczbą całkowitą 0-100.',
    WANTS_TO_PLAY_INVALID: 'Wants to play musi być liczbą całkowitą 0-100.',
}

export const parseLibraryErrorCode = (error: unknown) => {
    if (error instanceof ConvexError) {
        return String(error.data)
    }
    return 'UNKNOWN_ERROR'
}

export const toLibraryErrorMessage = (errorCode: string | null) => {
    if (!errorCode) return null
    return errorMessages[errorCode] ?? 'Wystąpił nieoczekiwany błąd.'
}
