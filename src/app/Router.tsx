import {
    RouterProvider,
    createRootRoute,
    createRoute,
    createRouter,
} from '@tanstack/react-router'
import { Suspense, lazy } from 'react'
import { LoadingScreen } from '~/components/LoadingScreen'

const RootComponent = lazy(() =>
    import('./App').then((module) => ({ default: module.App })),
)
const DashboardPage = lazy(() =>
    import('../pages/DashboardPage').then((module) => ({
        default: module.DashboardPage,
    })),
)
const BacklogPage = lazy(() =>
    import('../pages/BacklogPage').then((module) => ({ default: module.BacklogPage })),
)
const AddGamePage = lazy(() =>
    import('../pages/AddGamePage').then((module) => ({ default: module.AddGamePage })),
)

const rootRoute = createRootRoute({
    component: () => (
        <Suspense fallback={<LoadingScreen message="Przed nami kupa zabawy" />}>
            <RootComponent />
        </Suspense>
    ),
})

const dashboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => (
        <Suspense
            fallback={<LoadingScreen message="Módl się, aby nie wyskoczył bluescreen" />}
        >
            <DashboardPage />
        </Suspense>
    ),
})

const backlogRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/backlog',
    component: () => (
        <Suspense fallback={<LoadingScreen message="Ładuję Twoją kupkę" />}>
            <BacklogPage />
        </Suspense>
    ),
})

const addGameRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/add',
    component: () => (
        <Suspense
            fallback={<LoadingScreen message="Szukam wolnego slota na kupce wstydu" />}
        >
            <AddGamePage />
        </Suspense>
    ),
})

const routeTree = rootRoute.addChildren([dashboardRoute, backlogRoute, addGameRoute])

const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
})

const Router = () => <RouterProvider router={router} />

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

export { Router, router }
