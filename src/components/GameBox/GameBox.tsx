import type { Game } from '~/types/Game'
import type { UserGame } from '~/types/UserGame'
import { getGameTitle } from '~/utils/getGameTitle'
import { Cover } from './Cover'
import { LibrariesList } from './LibrariesList'
import { Status } from './Status'
import { Title } from './Title'

type GameBoxProps = {
    game: Game
    userGame: UserGame | null
}

export const GameBox = ({ game, userGame }: GameBoxProps) => {
    const title = getGameTitle(game)

    return (
        <div className="flex rounded-xl border-t border-[#491D78] bg-[radial-gradient(150%_95%_at_0%_0%,rgba(88,32,143,0.65)_0%,rgba(29,8,54,0.8)_40%,rgba(20,6,40,0.9)_70%,rgba(35,12,60,0.85)_88%,#140523_100%)]">
            <Cover coverUrl={game.coverUrl} title={title} />
            <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
                <Title title={title} releaseDate={game.releaseDate} />
                <Status userGame={userGame} />
                <LibrariesList userGame={userGame} />
            </div>
        </div>
    )
}
