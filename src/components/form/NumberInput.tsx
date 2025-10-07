import { forwardRef } from 'react'
import type { ComponentPropsWithoutRef } from 'react'
import { cx } from '~/utils/cx'
import { FORM_CONTROL_BASE_CLASSES } from './inputClasses'

type NumberInputProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'>

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
    ({ className, ...props }, ref) => (
        <input
            ref={ref}
            type="number"
            className={cx(FORM_CONTROL_BASE_CLASSES, className)}
            {...props}
        />
    ),
)

NumberInput.displayName = 'NumberInput'
