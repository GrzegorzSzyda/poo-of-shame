import type { ReactNode } from 'react'
import { cx } from '~/utils/cx'

type ParagraphProps = {
    children: ReactNode
    className?: string
}

export const Paragraph = ({ children, className = '' }: ParagraphProps) => (
    <p className={cx('text-primary-light/80 leading-relaxed', className)}>{children}</p>
)
