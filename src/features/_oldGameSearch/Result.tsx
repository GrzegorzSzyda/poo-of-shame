import type { IgdbGame } from '~/api/IgdbGame'
import { Cover } from './Cover'
import { ResultActions } from './ResultActions'
import { ResultTitle } from './ResultTitle'

type ResultProps = {
    game: IgdbGame
}

export const Result = ({ game }: ResultProps) => (
    <li key={game.id} className="flex gap-4 rounded">
        <Cover game={game} />
        <div>
            <ResultTitle game={game} />
            <ResultActions game={game} />
        </div>
    </li>
)
