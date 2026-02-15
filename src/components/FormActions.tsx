import { cx } from 'cva'
import type { HTMLAttributes, ReactNode } from 'react'

type Align = 'start' | 'center' | 'end' | 'between'

type FormActionsProps = HTMLAttributes<HTMLDivElement> & {
    children: ReactNode
    align?: Align
}

const alignClassByValue: Record<Align, string> = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
}

export const FormActions = ({
    children,
    align = 'end',
    className,
    ...props
}: FormActionsProps) => (
    <div
        className={cx(
            'mt-4 flex flex-wrap items-center gap-2',
            alignClassByValue[align],
            className,
        )}
        {...props}
    >
        {children}
    </div>
)
