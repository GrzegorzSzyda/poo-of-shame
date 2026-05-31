import { SignedIn, SignedOut } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import { SignedOutView } from './auth/SignedOutView'
import { useSyncCurrentUser } from './auth/useSyncCurrentUser'
import { AppShell } from './layout/AppShell'
import { AdminPage } from './pages/AdminPage'
import { HomePage } from './pages/HomePage'
import { LibraryPage } from './pages/LibraryPage'
import { getRoute } from './routing'

const SignedInApp = () => {
    const [route, setRoute] = useState(getRoute)
    useSyncCurrentUser()

    useEffect(() => {
        const handlePopState = () => setRoute(getRoute())
        window.addEventListener('popstate', handlePopState)
        return () => window.removeEventListener('popstate', handlePopState)
    }, [])

    return (
        <AppShell route={route}>
            {route.section === 'admin' ? (
                <AdminPage route={route.adminRoute} />
            ) : route.section === 'library' ? (
                <LibraryPage />
            ) : (
                <HomePage />
            )}
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
