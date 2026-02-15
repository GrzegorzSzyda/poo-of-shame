import { type VariantProps, cva, cx } from 'cva'
import type { ButtonHTMLAttributes, ComponentType, ReactNode } from 'react'

const buttonStyles = cva({
    base: 'inline-flex cursor-pointer items-center justify-center gap-2 rounded-md text-base font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60',
    variants: {
        variant: {
            primary:
                'bg-teal-400 text-teal-950 shadow-[0_0_16px_rgba(45,212,191,0.34)] hover:bg-teal-300 focus-visible:ring-teal-300 focus-visible:ring-offset-bg',
            secondary:
                'border border-teal-300/70 bg-teal-400/10 text-teal-200 hover:border-teal-200 hover:bg-teal-300/20 hover:text-teal-100 focus-visible:ring-teal-300/70 focus-visible:ring-offset-bg',
            ghost: 'bg-transparent text-teal-400 hover:bg-teal-300/15 hover:text-teal-300 focus-visible:ring-teal-300/60 focus-visible:ring-offset-bg',
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
