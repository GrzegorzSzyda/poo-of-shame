import { type VariantProps, cva, cx } from 'cva'
import type { ButtonHTMLAttributes, ComponentType, ReactNode } from 'react'

const buttonStyles = cva({
    base: 'inline-flex cursor-pointer items-center justify-center gap-2 rounded-md text-base font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60',
    variants: {
        variant: {
            primary: '',
            secondary: 'border',
            ghost: 'bg-transparent',
        },
        tone: {
            brand: '',
            danger: '',
        },
        size: {
            sm: 'h-8 px-3 text-sm',
            md: 'h-10 px-4',
            lg: 'h-12 px-6 text-lg',
        },
    },
    compoundVariants: [
        {
            variant: 'primary',
            tone: 'brand',
            className:
                'bg-teal-400 text-teal-950 shadow-[0_0_16px_rgba(45,212,191,0.34)] hover:bg-teal-300 focus-visible:ring-teal-300 focus-visible:ring-offset-bg',
        },
        {
            variant: 'secondary',
            tone: 'brand',
            className:
                'border-teal-300/70 bg-teal-400/10 text-teal-200 hover:border-teal-200 hover:bg-teal-300/20 hover:text-teal-100 focus-visible:ring-teal-300/70 focus-visible:ring-offset-bg',
        },
        {
            variant: 'ghost',
            tone: 'brand',
            className:
                'text-teal-400 hover:bg-teal-300/15 hover:text-teal-300 focus-visible:ring-teal-300/60 focus-visible:ring-offset-bg',
        },
        {
            variant: 'primary',
            tone: 'danger',
            className:
                'bg-red-500/85 text-red-50 shadow-[0_0_16px_rgba(239,68,68,0.3)] hover:bg-red-500 focus-visible:ring-red-400/70 focus-visible:ring-offset-bg',
        },
        {
            variant: 'secondary',
            tone: 'danger',
            className:
                'border-red-300/45 bg-red-500/10 text-red-200 hover:border-red-200 hover:bg-red-500/20 hover:text-red-100 focus-visible:ring-red-400/60 focus-visible:ring-offset-bg',
        },
        {
            variant: 'ghost',
            tone: 'danger',
            className:
                'text-red-500 hover:bg-red-500/15 hover:text-red-400 focus-visible:ring-red-400/60 focus-visible:ring-offset-bg',
        },
    ],
    defaultVariants: {
        variant: 'primary',
        tone: 'brand',
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
    tone,
    size,
    startIcon: StartIcon,
    endIcon: EndIcon,
    children,
    className,
    ...props
}: ButtonProps) => (
    <button className={cx(buttonStyles({ variant, tone, size, className }))} {...props}>
        {StartIcon ? <StartIcon className="h-5 w-5" /> : null}
        {children}
        {EndIcon ? <EndIcon className="h-5 w-5" /> : null}
    </button>
)
