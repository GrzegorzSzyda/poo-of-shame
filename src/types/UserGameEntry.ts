export type UserGameEntry = {
    gameId: string
    library: string[]
    isPlayed: boolean
    playedEntries: PlayedEntry[]
    interestScore: number | null
    note: string
}

export type PlayedEntry = {
    completionStatus: string
    finishedDateChoice: 'past' | 'recent' | 'custom'
    finishedDate: string
    rate: number
    hoursSpent: number
    platform: string
    libraryId: string
    note: string
}
