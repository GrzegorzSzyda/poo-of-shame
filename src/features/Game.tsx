import { useMutation } from 'convex/react'
import { useState } from 'react'
import { Button } from '~/components/Button'
import { api } from '../../convex/_generated/api'
import { type Doc } from '../../convex/_generated/dataModel'
import { EditGameForm } from './EditGameForm'

type Props = {
    game: Doc<'games'>
}

export const Game = ({ game }: Props) => {
    const removeGame = useMutation(api.games.remove)
    const [isEditing, setIsEditing] = useState(false)

    return (
        <li className="border-text flex items-center gap-2 border-b-2 p-5">
            {isEditing ? (
                <EditGameForm game={game} onDone={() => setIsEditing(false)} />
            ) : (
                <div className="flex gap-4">
                    {game.coverImageUrl ? (
                        <img
                            src={game.coverImageUrl}
                            alt={`Okładka: ${game.title}`}
                            className="h-16 w-12 object-cover"
                            loading="lazy"
                        />
                    ) : null}

                    <div className="flex-1">
                        <div className="font-semibold">{game.title}</div>
                        <div className="text-sm opacity-70">{game.releaseYear}</div>
                    </div>
                    <Button type="button" onClick={() => setIsEditing(true)}>
                        Edytuj
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            const shouldDelete = window.confirm('Usunąć tę grę?')
                            if (!shouldDelete) return
                            void removeGame({ gameId: game._id })
                        }}
                    >
                        Usuń
                    </Button>
                </div>
            )}
        </li>
    )
}
