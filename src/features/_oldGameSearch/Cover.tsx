import type { IgdbGame } from '~/api/IgdbGame'

type CoverProps = {
    game: IgdbGame
}

export const Cover = ({ game }: CoverProps) => {
    if (!game.cover?.image_id) {
        return (
            <div className="bg-text/10 text-text/70 flex h-30 w-24 shrink-0 items-center rounded p-1.5 text-center text-xs uppercase">
                Brak okładki gry: {game.name}
            </div>
        )
    }

    return (
        <img
            src={`https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`}
            alt={`Okładka gry ${game.name}`}
            className="h-30 w-24 shrink-0 rounded object-cover"
        />
    )
}
