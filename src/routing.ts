export type AdminRoute = 'games' | 'users' | 'integrations' | 'migration'

export type AppRoute =
    | { section: 'home' }
    | { section: 'library' }
    | { section: 'admin'; adminRoute: AdminRoute }

export const getRoute = (): AppRoute => {
    const path = window.location.pathname

    if (path === '/admin/users') {
        return { section: 'admin', adminRoute: 'users' }
    }

    if (path === '/admin/integrations') {
        return { section: 'admin', adminRoute: 'integrations' }
    }

    if (path === '/admin/migration') {
        return { section: 'admin', adminRoute: 'migration' }
    }

    if (path === '/admin' || path === '/admin/games') {
        return { section: 'admin', adminRoute: 'games' }
    }

    if (path === '/library') {
        return { section: 'library' }
    }

    return { section: 'home' }
}

export const navigate = (href: string) => {
    window.history.pushState({}, '', href)
    window.dispatchEvent(new PopStateEvent('popstate'))
}
