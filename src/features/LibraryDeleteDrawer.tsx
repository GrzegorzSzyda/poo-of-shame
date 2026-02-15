import { TrashIcon } from '@phosphor-icons/react'
import { useMutation } from 'convex/react'
import { Button } from '~/components/Button'
import { Drawer } from '~/components/Drawer'
import { FormActions } from '~/components/FormActions'
import { useToast } from '~/components/Toast'
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
    const { success, error: showError } = useToast()

    const handleDelete = async () => {
        if (!entry) return

        try {
            await removeFromLibrary({ entryId: entry._id })
            success('Usunięto wpis z kupki.')
            onClose()
        } catch (error) {
            const code = parseLibraryErrorCode(error)
            showError(toLibraryErrorMessage(code) ?? 'Wystąpił nieoczekiwany błąd.')
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
                    variant="ghost"
                    title="Anuluj usuwanie wpisu"
                    onClick={onClose}
                >
                    Anuluj
                </Button>
            </FormActions>
        </Drawer>
    )
}
