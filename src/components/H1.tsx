import type { ComponentType, ReactNode } from 'react'

type IconComponent = ComponentType<{ className?: string }>

type H1Props = {
    children: ReactNode
    startIcon?: IconComponent
}

export const H1 = ({ children, startIcon: StartIcon }: H1Props) => (
    <h1 className="inline-flex items-center gap-4 text-3xl text-white">
        {StartIcon ? <StartIcon className="h-7 w-7" /> : null}
        {children}
    </h1>
)
