import { GameBox } from '~/components/GameBox/GameBox'
import type { Game } from '~/types/Game'
import { Libraries } from '~/types/Libraries'
import type { UserGame } from '~/types/UserGame'
import { UserGameStatus } from '~/types/UserGameStatus'
import { getUserGamesByGameId } from '~/utils/getUserGamesByGameId'

const games: Game[] = [
    {
        id: '0',
        title: 'The Forest',
        titleEnglish: 'The Forest',
        titlePolish: null,
        releaseDate: '2018.04.30',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co20x5.webp',
    },
    {
        id: '1',
        title: 'Lies of P',
        titleEnglish: 'Lies of P',
        titlePolish: 'Lies of P',
        releaseDate: '18.08.2023',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6lxr.webp',
    },
    {
        id: '2',
        title: 'Banishers: Ghosts of New Eden',
        titleEnglish: 'Banishers: Ghosts of New Eden',
        titlePolish: null,
        releaseDate: '13.02.2024',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co6lmo.webp',
    },
    {
        id: '3',
        title: 'Clair Obscur Expedition 33',
        titleEnglish: null,
        titlePolish: null,
        releaseDate: '24.04.2025',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co9gam.webp',
    },
    {
        id: '4',
        title: 'Black Myth: Wukong',
        titleEnglish: null,
        titlePolish: null,
        releaseDate: '20.08.2024',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co8h3y.webp',
    },
    {
        id: '5',
        title: 'Witcher 3: Wild Hunt',
        titleEnglish: 'Witcher 3: Wild Hunt',
        titlePolish: 'Wiedźmin 3: Dziki Gon',
        releaseDate: '19.05.2015',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/coaarl.webp',
    },
    {
        id: '6',
        title: 'Need for Speed: Hot Pursuit - Remastered',
        titleEnglish: null,
        titlePolish: null,
        releaseDate: '06.11.2020',
        coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/co2nhk.webp',
    },
]

const userGames: UserGame[] = [
    {
        gameId: '0',
        status: UserGameStatus.NotInterested,
        libraries: [],
        rate: null,
        interest: null,
    },
    {
        gameId: '1',
        status: UserGameStatus.WantToPlay,
        libraries: [],
        rate: null,
        interest: 90,
    },
    {
        gameId: '2',
        status: UserGameStatus.Playing,
        libraries: [Libraries.PcSteam],
        rate: null,
        interest: null,
    },
    {
        gameId: '3',
        status: UserGameStatus.Done,
        libraries: [Libraries.PcSteam],
        rate: 100,
        interest: null,
    },
    {
        gameId: '4',
        status: UserGameStatus.Completed,
        libraries: [Libraries.Ps5Disc],
        rate: 95,
        interest: null,
    },
    {
        gameId: '5',
        status: UserGameStatus.OnHold,
        libraries: [
            Libraries.PcGog,
            Libraries.XboxOneStore,
            Libraries.Switch2Cartridge,
            Libraries.Ps5Disc,
        ],
        rate: null,
        interest: 55,
    },
    {
        gameId: '6',
        status: UserGameStatus.Dropped,
        libraries: [
            Libraries.PcGog,
            Libraries.XboxOneStore,
            Libraries.Switch2Cartridge,
            Libraries.Ps5Disc,
        ],
        rate: null,
        interest: null,
    },
]

export const DashboardPage = () => (
    <div className="my-8 grid w-full grid-cols-[repeat(auto-fill,minmax(450px,1fr))] gap-6">
        {games.map((game) => (
            <GameBox
                key={game.id}
                game={game}
                userGame={getUserGamesByGameId(userGames, game.id)}
            />
        ))}
    </div>
)
