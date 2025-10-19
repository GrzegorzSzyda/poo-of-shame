import { useState } from 'react'
import { GameBox } from '~/components/GameBox/GameBox'
import { useFindGame } from '~/features/Search/useFindGame'

export const Search = () => {
    const [searchText, setSearchText] = useState('Witcher')
    const games = useFindGame(searchText.trim())

    return (
        <div className="my-8 flex flex-col gap-6">
            <form className="w-full" onSubmit={(event) => event.preventDefault()}>
                <input
                    className="mt-1 w-full text-white placeholder:text-[#6f4f9b] focus:outline-none"
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    autoComplete="off"
                />
            </form>
            {games.map((game) => (
                <GameBox key={game.id} game={game} />
            ))}
        </div>
    )
}
