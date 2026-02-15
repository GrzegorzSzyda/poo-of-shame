import { PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react'
import { useMutation } from 'convex/react'
import { useState } from 'react'
import { Button } from '~/components/Button'
import { Drawer } from '~/components/Drawer'
import { FormActions } from '~/components/FormActions'
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
    const removeFromLibrary = useMutation(api.library.removeFromLibrary)
    const [errorCode, setErrorCode] = useState<string | null>(null)
    const [isDeleteConfirming, setIsDeleteConfirming] = useState(false)

    const handleClose = () => {
        setIsDeleteConfirming(false)
        onClose()
    }

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
            setIsDeleteConfirming(false)
            onClose()
        } catch (error) {
            setErrorCode(parseLibraryErrorCode(error))
        }
    }

    const handleDelete = async () => {
        if (!entry) return
        setErrorCode(null)

        try {
            await removeFromLibrary({ entryId: entry._id })
            setIsDeleteConfirming(false)
            handleClose()
        } catch (error) {
            setErrorCode(parseLibraryErrorCode(error))
        }
    }

    return (
        <Drawer
            isOpen={isOpen}
            onClose={handleClose}
            title={entry?.game?.title ?? 'Edytuj'}
            titleStartIcon={PencilSimpleIcon}
        >
            {entry ? (
                <div className="flex min-h-full flex-col">
                    <LibraryEntryForm
                        initialValues={{
                            gameId: entry.gameId,
                            platforms: [...entry.platforms],
                            rating: entry.rating,
                            wantsToPlay: entry.wantsToPlay,
                            progressStatus: entry.progressStatus,
                        }}
                        submitLabel="Zapisz zmiany"
                        onSubmit={handleSubmit}
                        onCancel={handleClose}
                        errorMessage={toLibraryErrorMessage(errorCode)}
                    />
                    <div className="mt-auto pt-4">
                        <FormActions align="center">
                            {isDeleteConfirming ? (
                                <>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="primary"
                                        tone="danger"
                                        startIcon={TrashIcon}
                                        title="Potwierdź usunięcie z kupki"
                                        onClick={() => void handleDelete()}
                                    >
                                        Potwierdź usunięcie
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="secondary"
                                        tone="danger"
                                        title="Anuluj usuwanie"
                                        onClick={() => setIsDeleteConfirming(false)}
                                    >
                                        Anuluj
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    tone="danger"
                                    startIcon={TrashIcon}
                                    title="Usuń z kupki"
                                    onClick={() => setIsDeleteConfirming(true)}
                                >
                                    Usuń z kupki
                                </Button>
                            )}
                        </FormActions>
                    </div>
                </div>
            ) : null}
        </Drawer>
    )
}
