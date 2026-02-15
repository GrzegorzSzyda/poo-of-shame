import { ConvexError } from 'convex/values'
import type { Doc } from '../../_generated/dataModel'
import { ERRORS } from '../../common/errors'
import type { Platform } from './types'

export const normalizeLibraryPlatforms = (platforms: Platform[]) => {
    return [...new Set(platforms)]
}

export const assertValidRating = (rating: number) => {
    if (!Number.isFinite(rating) || !Number.isInteger(rating) || rating < 0 || rating > 100) {
        throw new ConvexError(ERRORS.RATING_INVALID)
    }
}

export const assertValidWantsToPlay = (wantsToPlay: number) => {
    if (
        !Number.isFinite(wantsToPlay) ||
        !Number.isInteger(wantsToPlay) ||
        wantsToPlay < 0 ||
        wantsToPlay > 100
    ) {
        throw new ConvexError(ERRORS.WANTS_TO_PLAY_INVALID)
    }
}

export const assertValidWantsToPlayMin = (wantsToPlayMin: number) => {
    if (
        !Number.isFinite(wantsToPlayMin) ||
        !Number.isInteger(wantsToPlayMin) ||
        wantsToPlayMin < 0 ||
        wantsToPlayMin > 100
    ) {
        throw new ConvexError(ERRORS.WANTS_TO_PLAY_MIN_INVALID)
    }
}

export const requireLibraryGame = (game: Doc<'games'> | null): Doc<'games'> => {
    if (!game) {
        throw new ConvexError(ERRORS.GAME_NOT_FOUND)
    }
    return game
}

export const assertLibraryEntryNotExists = (entry: Doc<'libraryEntries'> | null) => {
    if (entry) {
        throw new ConvexError(ERRORS.LIB_ENTRY_ALREADY_EXISTS)
    }
}

export const requireLibraryEntry = (entry: Doc<'libraryEntries'> | null): Doc<'libraryEntries'> => {
    if (!entry) {
        throw new ConvexError(ERRORS.LIB_ENTRY_NOT_FOUND)
    }
    return entry
}

export const assertLibraryEntryOwner = (entry: Doc<'libraryEntries'>, userId: string) => {
    if (entry.userId !== userId) {
        throw new ConvexError(ERRORS.FORBIDDEN)
    }
}
