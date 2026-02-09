export const fetchJson = async <T>(
    url: string,
    init?: RequestInit,
): Promise<T> => {
    const response = await fetch(url, init)
    if (response.ok && response.status < 400) {
        return response.json() as Promise<T>
    }
    throw new Error(`Unable to send a request (${url})`)
}
