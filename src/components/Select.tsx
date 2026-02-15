import { cx } from 'cva'
import type { SelectHTMLAttributes } from 'react'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
    invalid?: boolean
}

export const Select = ({ className, invalid = false, ...props }: SelectProps) => (
    <select
        className={cx(
            'h-11 w-full rounded-md border bg-black/20 px-3 text-base text-teal-100 transition-colors outline-none',
            invalid
                ? 'border-red-500/70 focus:border-red-400'
                : 'border-teal-300/40 focus:border-teal-200',
            className,
        )}
        {...props}
    />
)
