import { useSuspenseQuery } from '@tanstack/react-query'
import type { UserGame } from '~/types/UserGame'
import { api } from '../api'

export const useApiUserGames = () => {
    const { data } = useSuspenseQuery<UserGame[]>({
        queryKey: ['userGames'],
        queryFn: () => api.fetchUserGames(),
    })
    return data
}
