import { type VariantProps, cva, cx } from 'cva'
import type { ButtonHTMLAttributes, ComponentType, ReactNode } from 'react'

const buttonStyles = cva({
    base: 'inline-flex items-center justify-center gap-2 rounded-md text-base font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 cursor-pointer',
    variants: {
        variant: {
            primary:
                'bg-text text-bg hover:bg-text/90 focus-visible:ring-text/70 focus-visible:ring-offset-bg',
            secondary:
                'border border-text/30 bg-transparent text-text hover:border-text/60 hover:bg-text/10 focus-visible:ring-text/50 focus-visible:ring-offset-bg',
            ghost: 'bg-transparent text-text hover:bg-text/10 focus-visible:ring-text/40 focus-visible:ring-offset-bg',
        },
        size: {
            sm: 'h-8 px-3 text-sm',
            md: 'h-10 px-4',
            lg: 'h-12 px-6 text-lg',
        },
    },
    defaultVariants: {
        variant: 'primary',
        size: 'md',
    },
})

type ButtonVariants = VariantProps<typeof buttonStyles>
type IconComponent = ComponentType<{ className?: string }>

type ButtonProps = ButtonVariants &
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
        startIcon?: IconComponent
        endIcon?: IconComponent
        children: ReactNode
    }

export const Button = ({
    variant,
    size,
    startIcon: StartIcon,
    endIcon: EndIcon,
    children,
    className,
    ...props
}: ButtonProps) => (
    <button className={cx(buttonStyles({ variant, size, className }))} {...props}>
        {StartIcon ? <StartIcon className="h-5 w-5" /> : null}
        {children}
        {EndIcon ? <EndIcon className="h-5 w-5" /> : null}
    </button>
)
