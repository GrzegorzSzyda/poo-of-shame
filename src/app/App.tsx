import { Outlet } from '@tanstack/react-router'
import { Logo } from '~/layout/Logo'
import { Sidebar } from '~/layout/Sidebar'
import './index.css'

export const App = () => (
    <div className="flex min-h-screen items-stretch">
        <Sidebar>
            <Logo />
        </Sidebar>
        <main className="flex-1">
            <div className="mx-auto w-full max-w-[1600px] px-6">
                <Outlet />
            </div>
        </main>
    </div>
)
