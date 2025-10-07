import { forwardRef } from 'react'
import type { ComponentPropsWithoutRef } from 'react'
import { cx } from '~/utils/cx'
import { FORM_CONTROL_BASE_CLASSES } from './inputClasses'

type DateInputProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'>

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
    ({ className, ...props }, ref) => (
        <input
            ref={ref}
            type="date"
            className={cx(FORM_CONTROL_BASE_CLASSES, className)}
            {...props}
        />
    ),
)

DateInput.displayName = 'DateInput'
