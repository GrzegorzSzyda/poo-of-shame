import type { IgdbGame } from '~/api/IgdbGame'
import { useApiFetchIgdb } from '~/api/store/useApiFetchIgdb'
import { Result } from './Result'

type ResultsProps = {
    searchText: string
}

export const Results = ({ searchText }: ResultsProps) => {
    const safeTerm = searchText.trim().replace(/"/g, '')
    const query = `search "${safeTerm}"; fields id,name,first_release_date,cover.image_id; limit 10;`
    const games = useApiFetchIgdb<IgdbGame[]>('games', query)

    if (!games.length) return <p>Brak wyników.</p>

    return (
        <ul className="space-y-4 py-4">
            {games.map((game) => (
                <Result key={game.id} game={game} />
            ))}
        </ul>
    )
}
