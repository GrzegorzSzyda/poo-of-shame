import { PencilSimpleIcon } from '@phosphor-icons/react'
import { useMutation } from 'convex/react'
import { useState } from 'react'
import { Drawer } from '~/components/Drawer'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { LibraryEntryForm } from './LibraryEntryForm'
import {
    type Platform,
    type ProgressStatus,
    parseLibraryErrorCode,
    toLibraryErrorMessage,
} from './libraryShared'

type EditableEntry = {
    _id: Id<'libraryEntries'>
    gameId: Id<'games'>
    platforms: ReadonlyArray<Platform>
    rating: number
    wantsToPlay: number
    progressStatus: ProgressStatus
    game: {
        title: string
        releaseYear: number
        coverImageUrl?: string
    } | null
}

type Props = {
    isOpen: boolean
    onClose: () => void
    entry: EditableEntry | null
}

export const LibraryEditDrawer = ({ isOpen, onClose, entry }: Props) => {
    const updateLibraryEntry = useMutation(api.library.updateLibraryEntry)
    const [errorCode, setErrorCode] = useState<string | null>(null)

    const handleSubmit = async ({
        platforms,
        rating,
        wantsToPlay,
        progressStatus,
    }: {
        gameId: string
        platforms: Platform[]
        rating: number
        wantsToPlay: number
        progressStatus: ProgressStatus
    }) => {
        if (!entry) return
        setErrorCode(null)

        try {
            await updateLibraryEntry({
                entryId: entry._id,
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
            title="Edytuj wpis biblioteki"
            titleStartIcon={PencilSimpleIcon}
        >
            {entry ? (
                <LibraryEntryForm
                    mode="edit"
                    initialValues={{
                        gameId: entry.gameId,
                        platforms: [...entry.platforms],
                        rating: entry.rating,
                        wantsToPlay: entry.wantsToPlay,
                        progressStatus: entry.progressStatus,
                    }}
                    submitLabel="Zapisz zmiany"
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    errorMessage={toLibraryErrorMessage(errorCode)}
                />
            ) : null}
        </Drawer>
    )
}
