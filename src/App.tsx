import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import { Logo } from './layout/Logo'
import { HomePage } from './pages/HomePage'

const queryClient = new QueryClient()

export const App = () => (
    <QueryClientProvider client={queryClient}>
        <div className="flex min-h-screen">
            <aside className="min-h-screen shrink-0">
                <Logo />
            </aside>
            <main className="min-h-screen flex-1 p-8">
                <HomePage />
            </main>
        </div>
    </QueryClientProvider>
)
