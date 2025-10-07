import type { ComponentPropsWithoutRef } from 'react'
import { forwardRef } from 'react'
import { cx } from '~/utils/cx'

const CHECKBOX_BASE_CLASSES =
    'h-4 w-4 cursor-pointer rounded border border-primary-dark/60 bg-primary-dark/20 text-primary shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary checked:border-primary checked:bg-primary checked:text-primary-light'

export type CheckboxProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'>

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, ...props }, ref) => (
        <input
            ref={ref}
            type="checkbox"
            className={cx(CHECKBOX_BASE_CLASSES, className)}
            {...props}
        />
    ),
)

Checkbox.displayName = 'Checkbox'
