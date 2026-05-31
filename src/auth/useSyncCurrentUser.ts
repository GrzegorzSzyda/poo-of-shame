import { useConvexAuth, useMutation } from 'convex/react'
import { useEffect } from 'react'
import { api } from '../../convex/_generated/api'

export const useSyncCurrentUser = () => {
    const { isAuthenticated } = useConvexAuth()
    const syncCurrentUser = useMutation(api.admin.syncCurrentUser)

    useEffect(() => {
        if (!isAuthenticated) return
        void syncCurrentUser()
    }, [isAuthenticated, syncCurrentUser])
}
