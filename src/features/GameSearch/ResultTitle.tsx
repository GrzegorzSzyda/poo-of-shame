import type { IgdbGame } from '~/api/IgdbGame'

type ResultTitleProps = {
    game: IgdbGame
}

export const ResultTitle = ({ game }: ResultTitleProps) => (
    <div className="flex items-center gap-1">
        <div>{game.name}</div>
        {game.first_release_date && (
            <div className="text-text/70 ml-3 text-sm">
                ({new Date(game.first_release_date * 1000).toLocaleDateString('pl-PL')})
            </div>
        )}
    </div>
)
