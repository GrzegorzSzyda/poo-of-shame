import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConvexProviderFromConfig } from './ConvexProviderFromConfig'
import './index.css'
import { AuthButtons } from './layout/AuthButtons'
import { Logo } from './layout/Logo'
import { HomePage } from './pages/HomePage'

const queryClient = new QueryClient()

export const App = () => (
    <ConvexProviderFromConfig>
        <QueryClientProvider client={queryClient}>
            <div className="flex min-h-screen">
                <aside className="min-h-screen shrink-0">
                    <Logo />
                    <AuthButtons />
                </aside>
                <main className="min-h-screen flex-1 p-8">
                    <HomePage />
                </main>
            </div>
        </QueryClientProvider>
    </ConvexProviderFromConfig>
)
