import { useMemo, useState } from 'react'
import type { IgdbGame } from '~/api/IgdbGame'
import { useApiFetchIgdb } from '~/api/store/useApiFetchIgdb'
import { Waiter } from '~/components/Waiter'

type Props = {
    onPick: (game: IgdbGame) => void
}

const buildIgdbSearchQuery = (searchText: string) => {
    const sanitized = searchText.replaceAll('"', '').trim()
    return [
        `search "${sanitized}";`,
        'fields id,name,first_release_date,cover.image_id;',
        'limit 10;',
    ].join(' ')
}

const IgdbResults = ({
    searchText,
    onPick,
}: {
    searchText: string
    onPick: (game: IgdbGame) => void
}) => {
    const apicalypse = useMemo(() => buildIgdbSearchQuery(searchText), [searchText])

    const results = useApiFetchIgdb<IgdbGame[]>('games', apicalypse)

    if (results.length === 0) return null

    return (
        <ul className="mt-2">
            {results.map((game) => (
                <li key={game.id}>
                    <button type="button" onClick={() => onPick(game)}>
                        {game.name}
                    </button>
                </li>
            ))}
        </ul>
    )
}

export const IgdbGamePicker = ({ onPick }: Props) => {
    const [searchText, setSearchText] = useState('')

    const shouldFetch = searchText.trim().length >= 2

    return (
        <div className="mb-4">
            <input
                placeholder="Szukaj w IGDB (min 2 znaki)"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
            />

            {shouldFetch && (
                <Waiter>
                    <IgdbResults searchText={searchText} onPick={onPick} />
                </Waiter>
            )}
        </div>
    )
}
