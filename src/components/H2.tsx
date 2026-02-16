import type { ComponentType, ReactNode } from 'react'

type IconWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'
type IconComponent = ComponentType<{ className?: string; weight?: IconWeight }>

type H2Props = {
    children: ReactNode
    startIcon?: IconComponent
    startIconWeight?: IconWeight
}

export const H2 = ({ children, startIcon: StartIcon, startIconWeight }: H2Props) => (
    <h2 className="inline-flex items-center gap-3 text-2xl text-white">
        {StartIcon ? <StartIcon className="h-6 w-6" weight={startIconWeight} /> : null}
        {children}
    </h2>
)
