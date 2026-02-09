import { fetchJson } from './fetchJson'

export const api = {
    fetchIgdb: <T>(resource: string, apicalypse: string): Promise<T> =>
        fetchJson<T>(`/api/igdb/${resource}`, {
            method: 'POST',
            body: JSON.stringify({ query: apicalypse }),
        }),
}
