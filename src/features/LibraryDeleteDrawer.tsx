import { TrashIcon } from '@phosphor-icons/react'
import { useMutation } from 'convex/react'
import { useState } from 'react'
import { Button } from '~/components/Button'
import { Drawer } from '~/components/Drawer'
import { FormActions } from '~/components/FormActions'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import { parseLibraryErrorCode, toLibraryErrorMessage } from './libraryShared'

type DeletableEntry = {
    _id: Id<'libraryEntries'>
    game: {
        title: string
        releaseYear: number
        coverImageUrl?: string
    } | null
}

type Props = {
    isOpen: boolean
    onClose: () => void
    entry: DeletableEntry | null
}

export const LibraryDeleteDrawer = ({ isOpen, onClose, entry }: Props) => {
    const removeFromLibrary = useMutation(api.library.removeFromLibrary)
    const [errorCode, setErrorCode] = useState<string | null>(null)

    const handleDelete = async () => {
        if (!entry) return
        setErrorCode(null)

        try {
            await removeFromLibrary({ entryId: entry._id })
            onClose()
        } catch (error) {
            setErrorCode(parseLibraryErrorCode(error))
        }
    }

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title="Usunąć wpis?"
            titleStartIcon={TrashIcon}
        >
            <p className="text-text/80 text-base">
                Czy na pewno chcesz usunąć ten wpis z kupki?
            </p>
            {entry?.game?.title ? (
                <p className="text-text mt-2 text-sm">{entry.game.title}</p>
            ) : null}
            <FormActions align="center">
                <Button
                    type="button"
                    startIcon={TrashIcon}
                    title="Potwierdź usunięcie wpisu"
                    onClick={() => void handleDelete()}
                >
                    Usuń
                </Button>
                <Button
                    type="button"
                    variant="secondary"
                    title="Anuluj usuwanie wpisu"
                    onClick={onClose}
                >
                    Anuluj
                </Button>
            </FormActions>
            {errorCode ? (
                <p className="text-red-700">{toLibraryErrorMessage(errorCode)}</p>
            ) : null}
        </Drawer>
    )
}
