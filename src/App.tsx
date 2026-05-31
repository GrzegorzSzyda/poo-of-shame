import { SignedIn, SignedOut } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import { SignedOutView } from './auth/SignedOutView'
import { useSyncCurrentUser } from './auth/useSyncCurrentUser'
import { AppShell, getInitialRoute } from './layout/AppShell'
import { AdminPage } from './pages/AdminPage'
import { HomePage } from './pages/HomePage'

const SignedInApp = () => {
    const [route, setRoute] = useState(getInitialRoute)
    useSyncCurrentUser()

    useEffect(() => {
        const handlePopState = () => setRoute(getInitialRoute())
        window.addEventListener('popstate', handlePopState)
        return () => window.removeEventListener('popstate', handlePopState)
    }, [])

    return (
        <AppShell route={route}>
            {route === 'admin' ? <AdminPage /> : <HomePage />}
        </AppShell>
    )
}

export const App = () => {
    return (
        <>
            <SignedOut>
                <SignedOutView />
            </SignedOut>
            <SignedIn>
                <SignedInApp />
            </SignedIn>
        </>
    )
}
