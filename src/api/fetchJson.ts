export const fetchJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
    const request = await fetch(url, init)
    if (request.ok && request.status < 400) return request.json() as Promise<T>
    throw new Error(`Unable to send a request (${url})`)
}
