import { useState } from 'react'
import type { UserGameEntry } from '~/types/UserGameEntry'

type AddGameData = {
    englishTitle: string
    polishTitle: string
} & UserGameEntry

const defaultData: AddGameData = {
    englishTitle: '',
    polishTitle: '',
    gameId: '',
    library: [],
    isPlayed: false,
    playedEntries: [
        {
            completionStatus: '',
            finishedDateChoice: 'recent',
            finishedDate: '',
            rate: 0,
            hoursSpent: 0,
            platform: '',
            libraryId: '',
            note: '',
        },
    ],
    interestScore: null,
    note: '',
}

export const useAddGameForm = () => {
    const [formData, setFormData] = useState<AddGameData>(defaultData)

    const setValue = <Key extends keyof AddGameData>(
        key: Key,
        value: AddGameData[Key],
    ) => {
        setFormData((prev) => ({ ...prev, [key]: value }))
    }

    return { formData, setValue }
}
