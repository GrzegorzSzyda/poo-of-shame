import {
    RouterProvider,
    createRootRoute,
    createRoute,
    createRouter,
} from '@tanstack/react-router'
import { Suspense, lazy } from 'react'
import { LoadingScreen } from '~/layout/LoadingScreen'

const RootComponent = lazy(() =>
    import('./App').then((module) => ({ default: module.App })),
)
const DashboardPage = lazy(() =>
    import('../pages/DashboardPage').then((module) => ({
        default: module.DashboardPage,
    })),
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

const routeTree = rootRoute.addChildren([dashboardRoute])

const router = createRouter({ routeTree, defaultPreload: 'intent' })

export const Router = () => <RouterProvider router={router} />

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}
