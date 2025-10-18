import type { UserGame } from '~/types/UserGame'

export const getUserGamesByGameId = (
    userGames: UserGame[],
    gameId: string,
): UserGame | null => userGames.find((userGame) => userGame.gameId === gameId) || null
