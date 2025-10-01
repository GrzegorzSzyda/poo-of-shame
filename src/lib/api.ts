export type ApiError = { status: number; message: string; details?: unknown }

const BASE_URL = (import.meta.env.VITE_API_URL as string) ?? ''
const DEFAULT_TIMEOUT = 10_000

async function request<T>(path: string, init?: RequestInit & { timeout?: number; parseJson?: boolean }) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), init?.timeout ?? DEFAULT_TIMEOUT)

  const res = await fetch(BASE_URL + path, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    signal: controller.signal,
    ...init
  }).catch((e) => {
    if (e?.name === 'AbortError') throw <ApiError>{ status: 0, message: 'Timeout' }
    throw <ApiError>{ status: 0, message: e?.message ?? 'Network error' }
  })

  clearTimeout(id)

  const parse = init?.parseJson ?? true
  const body = parse ? await res.json().catch(() => null) : await res.text()

  if (!res.ok) {
    const err: ApiError = {
      status: res.status,
      message: (body as any)?.message ?? res.statusText,
      details: body
    }
    throw err
  }
  return body as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(data) }),
  put:  <T>(path: string, data?: unknown) => request<T>(path, { method: 'PUT',  body: JSON.stringify(data) }),
  del:  <T>(path: string) => request<T>(path, { method: 'DELETE' })
}