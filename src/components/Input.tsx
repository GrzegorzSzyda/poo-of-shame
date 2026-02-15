import { cx } from 'cva'
import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    invalid?: boolean
}

export const Input = ({ className, invalid = false, ...props }: InputProps) => (
    <input
        className={cx(
            'placeholder:text-text/45 h-11 w-full rounded-md border bg-black/20 px-3 text-base text-teal-100 transition-colors outline-none',
            invalid
                ? 'border-red-500/70 focus:border-red-400'
                : 'border-teal-300/40 focus:border-teal-200',
            className,
        )}
        {...props}
    />
)
