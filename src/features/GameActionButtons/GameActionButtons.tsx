import type { MouseEvent } from 'react'
import { useApiUserGames } from '~/api/store/useApiUserGames'
import type { Game } from '~/types/Game'
import { UserGameStatus } from '~/types/UserGameStatus'

type GameActionButtonsProps = {
    game: Game
}

export const GameActionButtons = ({ game }: GameActionButtonsProps) => {
    const userGames = useApiUserGames()
    const userGame = userGames.find((userGame) => userGame.gameId === game.id)

    // const mutation = useMutation({
    //     mutationFn: postTodo,
    //     onSuccess: () => {
    //         // Invalidate and refetch
    //         queryClient.invalidateQueries({ queryKey: ['userGames'] })
    //         queryClient.invalidateQueries({ queryKey: ['games'] })
    //     },
    // })

    // const handleWasPlayed = (event: MouseEvent<HTMLButtonElement>) => {
    //     event.preventDefault()
    // }
    // const handleWantToPlay = (event: MouseEvent<HTMLButtonElement>) => {
    //     event.preventDefault()
    // }

    if (!userGame) {
        return null
        // return (
        //     <div className="flex gap-5">
        //         <button type="button" onClick={handleWasPlayed}>
        //             Grałem
        //         </button>
        //         <button type="button" onClick={handleWantToPlay}>
        //             Chcę zagrać
        //         </button>
        //     </div>
        // )
    }
    switch (userGame.status) {
        case UserGameStatus.NotInterested:
            return null
        case UserGameStatus.WantToPlay:
            return null
        case UserGameStatus.Playing:
            return null
        case UserGameStatus.Done:
            return null
        case UserGameStatus.Completed:
            return null
        case UserGameStatus.OnHold:
            return null
        case UserGameStatus.Dropped:
            return null
        default:
            return null
    }
}
