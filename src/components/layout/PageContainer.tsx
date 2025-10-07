import type { ReactNode } from 'react'
import { cx } from '~/utils/cx'

type PageContainerProps = {
    children: ReactNode
    className?: string
}

export const PageContainer = ({ children, className = '' }: PageContainerProps) => (
    <section className={cx('mx-auto w-full max-w-6xl px-8 py-12', className)}>
        {children}
    </section>
)
