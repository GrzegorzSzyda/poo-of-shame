import type { ButtonHTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { cx } from '~/utils/cx'

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant
}

const BUTTON_BASE_CLASSES =
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60'

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
    primary:
        'bg-primary text-primary-light shadow hover:bg-primary-alt focus-visible:outline-primary disabled:hover:bg-primary',
    secondary:
        'bg-primary-dark/25 text-primary-light shadow-inner hover:bg-primary-dark/35 focus-visible:outline-primary disabled:hover:bg-primary-dark/25',
    success:
        'bg-[color:var(--color-success)] text-white shadow hover:bg-[color:var(--color-success-alt)] focus-visible:outline-[color:var(--color-success)] disabled:hover:bg-[color:var(--color-success)]',
    warning:
        'bg-[color:var(--color-warning)] text-black shadow hover:bg-[color:var(--color-warning-alt)] focus-visible:outline-[color:var(--color-warning)] disabled:hover:bg-[color:var(--color-warning)]',
    danger: 'bg-[color:var(--color-danger)] text-white shadow hover:bg-[color:var(--color-danger-alt)] focus-visible:outline-[color:var(--color-danger)] disabled:hover:bg-[color:var(--color-danger)]',
    ghost: 'bg-transparent text-primary hover:bg-primary/10 focus-visible:outline-primary disabled:hover:bg-transparent',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', type = 'button', ...props }, ref) => (
        <button
            ref={ref}
            type={type}
            className={cx(BUTTON_BASE_CLASSES, VARIANT_CLASSES[variant], className)}
            {...props}
        />
    ),
)

Button.displayName = 'Button'
