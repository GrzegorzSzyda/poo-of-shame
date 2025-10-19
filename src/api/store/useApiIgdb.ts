import { useSuspenseQuery } from '@tanstack/react-query'
import { api } from '../api'

export const useApiIgdb = <TData = unknown>(resource: string, apicalypse: string) => {
    const { data } = useSuspenseQuery<TData>({
        queryKey: ['igdb', resource, apicalypse],
        queryFn: () => api.fetchIgdb<TData>(resource, apicalypse),
    })
    return data
}
