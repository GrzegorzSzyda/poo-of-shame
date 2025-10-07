import { Logo } from './Logo'
import { Navigation } from './Navigation'

export const Header = () => (
    <header className="border-primary-dark bg-bg/90 sticky top-0 z-50 border-b backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-8 py-4">
            <Logo />
            <Navigation />
        </div>
    </header>
)
