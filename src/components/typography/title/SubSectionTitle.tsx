import type { ReactNode } from 'react'
import { cx } from '~/utils/cx'
import { TITLE_BASE_CLASSES } from './titleBaseClasses'

type SubSectionTitleProps = {
    children: ReactNode
    className?: string
}

export const SubSectionTitle = ({ children, className = '' }: SubSectionTitleProps) => (
    <h3 className={cx(TITLE_BASE_CLASSES, 'text-2xl sm:text-3xl', className)}>
        {children}
    </h3>
)
