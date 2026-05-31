import { useQuery } from 'convex/react'
import { useEffect, useState } from 'react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

type CachedLibraryGame = {
    _id: Id<'games'>
    title: string
    releaseDate?: string
    releaseYear?: number
    coverImageUrl?: string
}

const STORAGE_KEY = 'library:games-cache:v1'

const readCache = (): CachedLibraryGame[] | undefined => {
    if (typeof window === 'undefined') return undefined

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (!raw) return undefined

        const parsed = JSON.parse(raw) as unknown
        if (!Array.isArray(parsed)) return undefined

        return parsed.filter(
            (item): item is CachedLibraryGame =>
                typeof item === 'object' &&
                item !== null &&
                typeof item._id === 'string' &&
                typeof item.title === 'string',
        )
    } catch {
        return undefined
    }
}

const writeCache = (games: CachedLibraryGame[]) => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(games))
}

export const useCachedLibraryGames = (authReady: boolean) => {
    const liveGames = useQuery(api.games.listAll, authReady ? {} : 'skip')
    const [cachedGames, setCachedGames] = useState<CachedLibraryGame[] | undefined>(() =>
        readCache(),
    )

    useEffect(() => {
        if (!authReady) return
        if (!liveGames) return

        setCachedGames(liveGames)
        writeCache(liveGames)
    }, [authReady, liveGames])

    return {
        games: liveGames ?? cachedGames,
        isUsingCache: liveGames === undefined && cachedGames !== undefined,
    }
}
