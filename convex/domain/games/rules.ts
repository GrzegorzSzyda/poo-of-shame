import { ConvexError } from 'convex/values'
import { ERRORS } from '../../common/errors'
import { getMaxReleaseDate, MIN_RELEASE_DATE } from './constants'
import type { GameDoc, GameId } from './types'

export const normalizeGameTitle = (title: string) =>
    title.trim().toLowerCase().replace(/\s+/g, ' ')

export const assertTitleRequired = (normalizedTitle: string) => {
    if (normalizedTitle.length === 0) {
        throw new ConvexError(ERRORS.TITLE_REQUIRED)
    }
}

const isValidIsoDate = (value: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
    const parsed = new Date(`${value}T00:00:00.000Z`)
    if (Number.isNaN(parsed.getTime())) return false
    return parsed.toISOString().slice(0, 10) === value
}

export const assertValidReleaseDate = (releaseDate: string) => {
    if (!isValidIsoDate(releaseDate)) {
        throw new ConvexError(ERRORS.RELEASE_DATE_INVALID)
    }
    if (releaseDate < MIN_RELEASE_DATE) {
        throw new ConvexError(ERRORS.RELEASE_DATE_INVALID)
    }
    if (releaseDate > getMaxReleaseDate()) {
        throw new ConvexError(ERRORS.RELEASE_DATE_INVALID)
    }
}

export const requireGame = (game: GameDoc | null): GameDoc => {
    if (!game) {
        throw new ConvexError(ERRORS.GAME_NOT_FOUND)
    }
    return game
}

export const assertUniqueGameTitleDate = (existing: GameDoc | null, gameId?: GameId) => {
    if (!existing) return
    if (!gameId || existing._id !== gameId) {
        throw new ConvexError(ERRORS.GAME_TITLE_DATE_ALREADY_EXISTS)
    }
}
