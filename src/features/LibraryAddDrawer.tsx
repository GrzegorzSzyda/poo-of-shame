import { PlusIcon } from '@phosphor-icons/react'
import { useMutation } from 'convex/react'
import { useState } from 'react'
import { Drawer } from '~/components/Drawer'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { LibraryEntryForm } from './LibraryEntryForm'
import {
    createDefaultLibraryEntryDraft,
    parseLibraryErrorCode,
    toLibraryErrorMessage,
} from './libraryShared'

type GameOption = {
    _id: Id<'games'>
    title: string
    releaseYear: number
}

type Props = {
    isOpen: boolean
    onClose: () => void
    games?: GameOption[]
}

export const LibraryAddDrawer = ({ isOpen, onClose, games }: Props) => {
    const addToLibrary = useMutation(api.library.addToLibrary)
    const [errorCode, setErrorCode] = useState<string | null>(null)

    const handleSubmit = async ({
        gameId,
        platforms,
        rating,
        wantsToPlay,
        progressStatus,
    }: ReturnType<typeof createDefaultLibraryEntryDraft>) => {
        setErrorCode(null)

        if (!gameId) {
            setErrorCode('GAME_NOT_FOUND')
            return
        }

        try {
            await addToLibrary({
                gameId: gameId as Id<'games'>,
                platforms,
                rating,
                wantsToPlay,
                progressStatus,
            })
            onClose()
        } catch (error) {
            setErrorCode(parseLibraryErrorCode(error))
        }
    }

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title="Dodaj do biblioteki"
            titleStartIcon={PlusIcon}
        >
            <LibraryEntryForm
                mode="add"
                initialValues={createDefaultLibraryEntryDraft()}
                submitLabel="Dodaj wpis"
                onSubmit={handleSubmit}
                onCancel={onClose}
                errorMessage={toLibraryErrorMessage(errorCode)}
                gameOptions={
                    games?.map((game) => ({
                        id: game._id,
                        label: `${game.title} (${game.releaseYear})`,
                    })) ?? []
                }
            />
        </Drawer>
    )
}
