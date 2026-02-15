import { cx } from 'cva'
import type { FormHTMLAttributes, ReactNode } from 'react'

type FormProps = FormHTMLAttributes<HTMLFormElement> & {
    children: ReactNode
}

export const Form = ({
    children,
    className,
    autoComplete = 'off',
    ...props
}: FormProps) => (
    <form className={cx('space-y-6', className)} autoComplete={autoComplete} {...props}>
        {children}
    </form>
)
