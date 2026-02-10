import { ConvexError } from 'convex/values'
import { ERRORS } from '../../common/errors'
import { getMaxReleaseYear, MIN_RELEASE_YEAR } from './constants'
import type { GameDoc, GameId } from './types'

export const normalizeGameTitle = (title: string) =>
    title.trim().toLowerCase().replace(/\s+/g, ' ')

export const assertTitleRequired = (normalizedTitle: string) => {
    if (normalizedTitle.length === 0) {
        throw new ConvexError(ERRORS.TITLE_REQUIRED)
    }
}

export const assertValidReleaseYear = (year: number) => {
    if (!Number.isFinite(year) || !Number.isInteger(year)) {
        throw new ConvexError(ERRORS.RELEASE_YEAR_INVALID)
    }
    if (year < MIN_RELEASE_YEAR) {
        throw new ConvexError(ERRORS.RELEASE_YEAR_INVALID)
    }
    if (year > getMaxReleaseYear()) {
        throw new ConvexError(ERRORS.RELEASE_YEAR_INVALID)
    }
}

export const requireGame = (game: GameDoc | null): GameDoc => {
    if (!game) {
        throw new ConvexError(ERRORS.GAME_NOT_FOUND)
    }
    return game
}

export const assertUniqueGameTitleYear = (existing: GameDoc | null, gameId?: GameId) => {
    if (!existing) return
    if (!gameId || existing._id !== gameId) {
        throw new ConvexError(ERRORS.GAME_TITLE_YEAR_ALREADY_EXISTS)
    }
}
