import { CaretDownIcon } from '@phosphor-icons/react'
import { cx } from 'cva'
import type { SelectHTMLAttributes } from 'react'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
    invalid?: boolean
}

export const Select = ({ className, invalid = false, ...props }: SelectProps) => (
    <div className="relative">
        <select
            className={cx(
                'h-11 w-full cursor-pointer appearance-none rounded-md border bg-black/20 px-3 pr-10 text-base text-teal-100 transition-colors outline-none',
                invalid
                    ? 'border-red-500/70 focus:border-red-400'
                    : 'border-teal-300/40 hover:border-teal-300/70 focus:border-teal-400',
                className,
            )}
            {...props}
        />
        <CaretDownIcon className="text-text/70 pointer-events-none absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2" />
    </div>
)
