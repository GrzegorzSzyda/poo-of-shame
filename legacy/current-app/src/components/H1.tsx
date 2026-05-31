import { cx } from 'cva'
import type { ComponentType, ReactNode } from 'react'

type IconWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'
type IconComponent = ComponentType<{ className?: string; weight?: IconWeight }>

type H1Props = {
    children: ReactNode
    startIcon?: IconComponent
    startIconWeight?: IconWeight
    className?: string
    iconClassName?: string
}

export const H1 = ({
    children,
    startIcon: StartIcon,
    startIconWeight,
    className,
    iconClassName,
}: H1Props) => (
    <h1
        className={cx(
            'inline-flex min-h-10 items-center gap-4 text-3xl leading-none font-semibold text-white uppercase',
            className,
        )}
    >
        {StartIcon ? (
            <StartIcon
                className={cx('h-7 w-7', iconClassName)}
                weight={startIconWeight}
            />
        ) : null}
        {children}
    </h1>
)
