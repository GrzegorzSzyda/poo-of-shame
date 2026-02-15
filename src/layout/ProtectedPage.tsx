import { useConvexAuth } from 'convex/react'
import type { ReactNode } from 'react'
import { LoginPage } from '~/pages/LoginPage'
import { AppLayout } from './AppLayout'
import { LoadingView } from './LoadingView'

type ProtectedPageProps = {
    children: ReactNode
}

export const ProtectedPage = ({ children }: ProtectedPageProps) => {
    const { isAuthenticated, isLoading } = useConvexAuth()

    if (isLoading) {
        return (
            <LoadingView
                title="Ladowanie kupki"
                message="Szykuje Twoja kupke wstydu. To potrwa tylko chwile."
            />
        )
    }

    if (!isAuthenticated) {
        return <LoginPage />
    }

    return <AppLayout>{children}</AppLayout>
}
