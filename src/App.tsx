import { IconContext } from '@phosphor-icons/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { ConvexProviderFromConfig } from './ConvexProviderFromConfig'
import { ToastProvider } from './components/Toast'
import './index.css'
import { router } from './router'

const queryClient = new QueryClient()

export const App = () => {
    return (
        <ConvexProviderFromConfig>
            <QueryClientProvider client={queryClient}>
                <IconContext.Provider value={{ weight: 'duotone' }}>
                    <ToastProvider>
                        <RouterProvider router={router} />
                    </ToastProvider>
                </IconContext.Provider>
            </QueryClientProvider>
        </ConvexProviderFromConfig>
    )
}
