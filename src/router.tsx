import {
    Outlet,
    createRootRoute,
    createRoute,
    createRouter,
} from '@tanstack/react-router'
import { ErrorView } from './layout/ErrorView'
import { ProtectedPage } from './layout/ProtectedPage'
import { GamesPage } from './pages/GamesPage'
import { HomePage } from './pages/HomePage'
import { LibraryPage } from './pages/LibraryPage'

const rootRoute = createRootRoute({
    component: Outlet,
    notFoundComponent: () => (
        <ErrorView title="404" message="Sprawdź adres URL albo wroć na stronę główną." />
    ),
})

const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => (
        <ProtectedPage>
            <HomePage />
        </ProtectedPage>
    ),
})

const gamesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/games',
    component: () => (
        <ProtectedPage>
            <GamesPage />
        </ProtectedPage>
    ),
})

const libraryRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/library',
    component: () => (
        <ProtectedPage>
            <LibraryPage />
        </ProtectedPage>
    ),
})

const routeTree = rootRoute.addChildren([homeRoute, gamesRoute, libraryRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}
