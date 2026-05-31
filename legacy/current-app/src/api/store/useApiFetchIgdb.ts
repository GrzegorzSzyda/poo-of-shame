import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from '../api'

export const useApiFetchIgdb = <T>(resource: string, apicalypse: string) => {
    const { data } = useSuspenseQuery<T>({
        queryKey: ['igdb', resource, apicalypse],
        queryFn: () => api.fetchIgdb<T>(resource, apicalypse),
    })
    return data
}
