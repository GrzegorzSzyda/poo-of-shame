import type { ComponentType, ReactNode } from 'react'

type IconWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'
type IconComponent = ComponentType<{ className?: string; weight?: IconWeight }>

type H1Props = {
    children: ReactNode
    startIcon?: IconComponent
    startIconWeight?: IconWeight
}

export const H1 = ({ children, startIcon: StartIcon, startIconWeight }: H1Props) => (
    <h1 className="inline-flex items-center gap-4 text-3xl text-white">
        {StartIcon ? <StartIcon className="h-7 w-7" weight={startIconWeight} /> : null}
        {children}
    </h1>
)
