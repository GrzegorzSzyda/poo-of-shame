import type { Game } from '~/types/Game'

export const getGameTitle = (game: Game): string | null =>
    game.titlePolish || game.titleEnglish || game.title
