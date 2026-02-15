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

const PLATFORM_LABELS: Record<Platform, string> = {
    ps_disc: 'PlayStation (płyta)',
    ps_store: 'PlayStation Store',
    ps_plus: 'PlayStation Plus',
    steam: 'Steam',
    epic: 'Epic Games',
    gog: 'GOG',
    amazon_gaming: 'Amazon Gaming',
    ubisoft_connect: 'Ubisoft Connect',
    xbox: 'Xbox',
    switch: 'Nintendo Switch',
    other: 'Inne',
}

export const platformLabel = (platform: Platform) => PLATFORM_LABELS[platform]

export const PROGRESS_STATUS_OPTIONS = [
    'backlog',
    'playing',
    'completed',
    'done',
    'dropped',
] as const

export type ProgressStatus = (typeof PROGRESS_STATUS_OPTIONS)[number]

type ProgressStatusMeta = {
    label: string
    textTone: string
    selectorTone: string
    displayTone: string
    usesWantsToPlay: boolean
}

const PROGRESS_STATUS_META: Record<ProgressStatus, ProgressStatusMeta> = {
    backlog: {
        label: 'Na kupce',
        textTone: 'text-teal-300',
        selectorTone:
            'text-teal-400 hover:bg-teal-300/12 hover:text-teal-300 data-[active=true]:bg-teal-400/82 data-[active=true]:text-teal-950 data-[active=true]:shadow-[0_0_12px_rgba(45,212,191,0.28)]',
        displayTone: 'border-teal-300/40 bg-teal-400/78 text-teal-950',
        usesWantsToPlay: true,
    },
    playing: {
        label: 'Ogrywana',
        textTone: 'text-sky-300',
        selectorTone:
            'text-sky-400 hover:bg-sky-300/12 hover:text-sky-300 data-[active=true]:bg-sky-400/82 data-[active=true]:text-sky-950 data-[active=true]:shadow-[0_0_12px_rgba(56,189,248,0.28)]',
        displayTone: 'border-sky-300/40 bg-sky-400/78 text-sky-950',
        usesWantsToPlay: true,
    },
    completed: {
        label: 'Ukończona',
        textTone: 'text-lime-300',
        selectorTone:
            'text-lime-400 hover:bg-lime-300/12 hover:text-lime-300 data-[active=true]:bg-lime-400/82 data-[active=true]:text-lime-950 data-[active=true]:shadow-[0_0_12px_rgba(163,230,53,0.3)]',
        displayTone: 'border-lime-300/40 bg-lime-400/78 text-lime-950',
        usesWantsToPlay: false,
    },
    done: {
        label: 'Wymaksowana',
        textTone: 'text-amber-300',
        selectorTone:
            'text-amber-400 hover:bg-amber-300/12 hover:text-amber-300 data-[active=true]:bg-amber-400/82 data-[active=true]:text-amber-950 data-[active=true]:shadow-[0_0_12px_rgba(251,191,36,0.28)]',
        displayTone: 'border-amber-300/40 bg-amber-400/78 text-amber-950',
        usesWantsToPlay: false,
    },
    dropped: {
        label: 'Porzucona',
        textTone: 'text-rose-300',
        selectorTone:
            'text-rose-400 hover:bg-rose-300/12 hover:text-rose-300 data-[active=true]:bg-rose-400/82 data-[active=true]:text-rose-950 data-[active=true]:shadow-[0_0_12px_rgba(251,113,133,0.28)]',
        displayTone: 'border-rose-300/40 bg-rose-400/78 text-rose-950',
        usesWantsToPlay: false,
    },
}

export const progressStatusLabel = (status: ProgressStatus) =>
    PROGRESS_STATUS_META[status].label

export const progressStatusTextTone = (status: ProgressStatus) =>
    PROGRESS_STATUS_META[status].textTone

export const progressStatusSelectorTone = (status: ProgressStatus) =>
    PROGRESS_STATUS_META[status].selectorTone

export const progressStatusDisplayTone = (status: ProgressStatus) =>
    PROGRESS_STATUS_META[status].displayTone

export const progressStatusUsesWantsToPlay = (status: ProgressStatus) =>
    PROGRESS_STATUS_META[status].usesWantsToPlay

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
    LIB_ENTRY_ALREADY_EXISTS: 'Ta gra jest już w Twojej kupce.',
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
