import { AddGameForm } from '~/features/AddGameForm'
import { GamesList } from '~/features/GamesList'

export const HomePage = () => {
    return (
        <div>
            <AddGameForm />
            <GamesList />
        </div>
    )
}
