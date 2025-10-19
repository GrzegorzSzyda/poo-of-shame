import type { PropsWithChildren } from 'react'

export const Sidebar = ({ children }: PropsWithChildren) => (
    <aside className="sidebar-sheen w-[240px] border border-[#1c0439]">{children}</aside>
)
