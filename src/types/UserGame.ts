import type { Libraries } from './Libraries'
import type { UserGameStatus } from './UserGameStatus'

export type UserGame = {
    gameId: string
    status: UserGameStatus | null
    rate: number | null
    interest: number | null
    libraries: Libraries[]
}

export type Run = {
    status: UserGameStatus | null
    startDate: string | null
    endDate: string | null
    rate: number | null
    library: Libraries | null
    note: string | null
}
