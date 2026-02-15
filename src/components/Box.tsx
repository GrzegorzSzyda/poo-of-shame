import { cx } from 'cva'
import type { HTMLAttributes, ReactNode } from 'react'

type BoxProps = HTMLAttributes<HTMLDivElement> & {
    children: ReactNode
}

export const Box = ({ children, className, ...props }: BoxProps) => (
    <div
        className={cx(
            'border-text/20 bg-bg/50 rounded-lg border p-4 shadow-[0_8px_24px_rgba(0,0,0,0.22)]',
            className,
        )}
        {...props}
    >
        {children}
    </div>
)
