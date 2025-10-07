import { forwardRef } from 'react'
import type { ComponentPropsWithoutRef } from 'react'
import { cx } from '~/utils/cx'
import { FORM_CONTROL_BASE_CLASSES } from './inputClasses'

type TextInputProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'>

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
    ({ className, ...props }, ref) => (
        <input
            ref={ref}
            type="text"
            className={cx(FORM_CONTROL_BASE_CLASSES, className)}
            {...props}
        />
    ),
)

TextInput.displayName = 'TextInput'
