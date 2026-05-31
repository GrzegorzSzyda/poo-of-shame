import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'

type AdminUser = {
    _id: Id<'appUsers'>
    subject: string
    email?: string
    name?: string
    role: 'user' | 'admin'
}

export const UserRolesPanel = ({ users }: { users?: AdminUser[] }) => {
    const setUserRole = useMutation(api.admin.setUserRole)

    return (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/70">
            <div className="border-b border-zinc-800 px-4 py-3">
                <h3 className="font-medium text-white">Użytkownicy</h3>
            </div>
            {users ? (
                <ul className="divide-y divide-zinc-800">
                    {users.map((appUser) => (
                        <li
                            key={appUser._id}
                            className="grid gap-3 px-4 py-3 md:grid-cols-[minmax(0,1fr)_9rem]"
                        >
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-zinc-100">
                                    {appUser.email ?? appUser.name ?? appUser.subject}
                                </p>
                                <p className="mt-1 truncate text-xs text-zinc-500">
                                    {appUser.subject}
                                </p>
                            </div>
                            <select
                                value={appUser.role}
                                onChange={(event) =>
                                    void setUserRole({
                                        appUserId: appUser._id,
                                        role: event.target.value as 'user' | 'admin',
                                    })
                                }
                                className="h-10 rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100"
                            >
                                <option value="user">user</option>
                                <option value="admin">admin</option>
                            </select>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="px-4 py-5 text-sm text-zinc-400">
                    Ładowanie użytkowników...
                </div>
            )}
        </div>
    )
}
