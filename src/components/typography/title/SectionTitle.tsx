import type { ReactNode } from "react"
import { cx } from "~/utils/cx"
import { TITLE_BASE_CLASSES } from "./titleBaseClasses"

type SectionTitleProps = {
    children: ReactNode
    className?: string
}

export const SectionTitle = ({ children, className = "" }: SectionTitleProps) => (
    <h2 className={cx(TITLE_BASE_CLASSES, "text-3xl sm:text-4xl", className)}>
        {children}
    </h2>
)
