import { cx } from 'cva'
import type { FormHTMLAttributes, ReactNode } from 'react'

type FormProps = FormHTMLAttributes<HTMLFormElement> & {
    children: ReactNode
}

export const Form = ({ children, className, ...props }: FormProps) => (
    <form className={cx('space-y-5', className)} {...props}>
        {children}
    </form>
)
