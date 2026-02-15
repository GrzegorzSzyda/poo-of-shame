import { IconContext } from '@phosphor-icons/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { ConvexProviderFromConfig } from './ConvexProviderFromConfig'
import './index.css'
import { router } from './router'

const queryClient = new QueryClient()

export const App = () => {
    return (
        <ConvexProviderFromConfig>
            <QueryClientProvider client={queryClient}>
                <IconContext.Provider value={{ weight: 'duotone' }}>
                    <RouterProvider router={router} />
                </IconContext.Provider>
            </QueryClientProvider>
        </ConvexProviderFromConfig>
    )
}
