import { useMutation } from 'convex/react'
import { useToast } from '~/components/Toast'
import { api } from '../../convex/_generated/api'
import { type Doc } from '../../convex/_generated/dataModel'
import { GameForm } from './GameForm'

type Props = {
    game: Doc<'games'>
    onDone?: () => void
}

export const EditGameForm = ({ game, onDone }: Props) => {
    const updateGame = useMutation(api.games.update)
    const { success } = useToast()
    const initialReleaseDate =
        game.releaseDate ??
        (game.releaseYear !== undefined ? `${game.releaseYear}-01-01` : '')

    return (
        <GameForm
            submitLabel="Zapisz zmiany"
            initialValues={{
                title: game.title,
                releaseDate: initialReleaseDate,
                coverImageUrl: game.coverImageUrl ?? '',
            }}
            onSubmit={async (values) => {
                await updateGame({
                    gameId: game._id,
                    title: values.title,
                    releaseDate: values.releaseDate,
                    coverImageUrl: values.coverImageUrl,
                })
                success('Zapisano zmiany gry.')
                onDone?.()
            }}
        />
    )
}
