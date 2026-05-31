import { cx } from 'cva'
import type { LabelHTMLAttributes, ReactNode } from 'react'

type FormLabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
    children: ReactNode
}

export const FormLabel = ({ children, className, ...props }: FormLabelProps) => (
    <label className={cx('text-text mb-1 block text-sm', className)} {...props}>
        {children}
    </label>
)
