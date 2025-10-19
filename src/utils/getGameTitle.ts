import type { Game } from '~/types/Game'

export const getGameTitle = (game: Game): string | undefined =>
    game.titlePolish || game.titleEnglish || game.title
