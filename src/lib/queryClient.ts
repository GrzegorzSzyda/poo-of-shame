import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        const status = (error as any)?.status ?? (error as any)?.response?.status
        if (status && status < 500) return false
        return failureCount < 2
      },
      refetchOnWindowFocus: false,
      staleTime: 30_000
    }
  }
})