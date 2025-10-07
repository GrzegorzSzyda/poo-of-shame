import { forwardRef } from 'react'
import type { ComponentPropsWithoutRef } from 'react'
import { cx } from '~/utils/cx'
import { FORM_CONTROL_BASE_CLASSES } from './inputClasses'

type SelectProps = ComponentPropsWithoutRef<'select'>

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, children, ...props }, ref) => (
        <select ref={ref} className={cx(FORM_CONTROL_BASE_CLASSES, className)} {...props}>
            {children}
        </select>
    ),
)

Select.displayName = 'Select'
