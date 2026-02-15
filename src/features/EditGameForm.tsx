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

    return (
        <GameForm
            submitLabel="Zapisz zmiany"
            initialValues={{
                title: game.title,
                releaseYear: game.releaseYear,
                coverImageUrl: game.coverImageUrl ?? '',
            }}
            onSubmit={async (values) => {
                await updateGame({
                    gameId: game._id,
                    title: values.title,
                    releaseYear: values.releaseYear,
                    coverImageUrl: values.coverImageUrl,
                })
                success('Zapisano zmiany gry.')
                onDone?.()
            }}
        />
    )
}
