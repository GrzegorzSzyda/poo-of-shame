import type { UserGame } from '~/types/UserGame'

export const fetchUserGames = async (): Promise<UserGame[]> => {
    try {
        const raw = window.localStorage.getItem('userGames')
        return raw === null ? [] : (JSON.parse(raw) as UserGame[])
    } catch (error) {
        console.error('[fetchUserGames] JSON parse or access error:', error)
        return []
    }
}
