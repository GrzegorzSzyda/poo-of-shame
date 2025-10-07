import type { ComponentPropsWithoutRef } from 'react'
import { cx } from '~/utils/cx'

const LABEL_BASE_CLASSES = 'block text-primary-light text-sm font-medium'

type LabelProps = ComponentPropsWithoutRef<'label'>

export const Label = ({ className, ...props }: LabelProps) => (
    <label className={cx(LABEL_BASE_CLASSES, className)} {...props} />
)
