import { useConvexAuth } from 'convex/react'
import { LibraryPanel } from '~/features/LibraryPanel'

export const LibraryPage = () => {
    const { isAuthenticated } = useConvexAuth()

    return <LibraryPanel authReady={isAuthenticated} />
}
