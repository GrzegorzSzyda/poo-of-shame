import { useMemo, useState } from 'react'
import type { IgdbGame } from '~/api/IgdbGame'
import { useApiFetchIgdb } from '~/api/store/useApiFetchIgdb'
import { Box } from '~/components/Box'
import { FormLabel } from '~/components/FormLabel'
import { Input } from '~/components/Input'
import { Waiter } from '~/components/Waiter'
import { formatIsoDatePl } from '~/utils/date'

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

const toReleaseDate = (firstReleaseDate?: number) => {
    if (!firstReleaseDate) return 'brak daty'
    const date = new Date(firstReleaseDate * 1000)
    if (Number.isNaN(date.getTime())) return 'brak daty'
    return formatIsoDatePl(date.toISOString().slice(0, 10))
}

const toCoverUrl = (imageId?: string) => {
    if (!imageId) return null
    return `https://images.igdb.com/igdb/image/upload/t_cover_big/${imageId}.jpg`
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

    if (results.length === 0) {
        return (
            <div className="text-text/75 mt-2 text-sm">
                Brak wyników :( dla: <span className="text-text">{searchText}</span>
            </div>
        )
    }

    return (
        <ul className="mt-2 max-h-72 space-y-2 overflow-auto rounded-md">
            {results.map((game) => (
                <li key={game.id}>
                    <button
                        type="button"
                        onClick={() => onPick(game)}
                        className="flex w-full cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-teal-300/15"
                    >
                        <div className="bg-bg text-text/60 flex h-12 w-9 shrink-0 items-center justify-center overflow-hidden rounded border border-teal-300/20 text-xs">
                            {game.cover?.image_id ? (
                                <img
                                    src={toCoverUrl(game.cover.image_id) ?? ''}
                                    alt={`Okładka: ${game.name}`}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                />
                            ) : (
                                'brak'
                            )}
                        </div>
                        <div>
                            <div className="text-text font-medium">{game.name}</div>
                            <div className="text-text/70 text-sm">
                                {toReleaseDate(game.first_release_date)}
                            </div>
                        </div>
                        <span className="text-text/55 ml-auto text-xs">
                            kliknij, by uzupełnić
                        </span>
                    </button>
                </li>
            ))}
        </ul>
    )
}

export const IgdbGamePicker = ({ onPick }: Props) => {
    const [searchText, setSearchText] = useState('')

    const shouldFetch = searchText.trim().length >= 2
    const handlePick = (game: IgdbGame) => {
        onPick(game)
        setSearchText('')
    }

    return (
        <Box className="mb-4">
            <FormLabel htmlFor="igdb-search">
                Szukaj w IGDB
                <span className="text-text/65 ml-2 text-xs">
                    (uzupełnia tytuł, datę premiery i okładkę)
                </span>
            </FormLabel>
            <Input
                id="igdb-search"
                placeholder="Szukaj w IGDB (min 2 znaki)"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
            />

            {shouldFetch && (
                <Waiter>
                    <IgdbResults searchText={searchText} onPick={handlePick} />
                </Waiter>
            )}
        </Box>
    )
}
