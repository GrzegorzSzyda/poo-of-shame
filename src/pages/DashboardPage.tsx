import { Suspense } from 'react'
import { Search } from '~/features/Search/Search'

export const DashboardPage = () => (
    <Suspense>
        <Search />
    </Suspense>
)
