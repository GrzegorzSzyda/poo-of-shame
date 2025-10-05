import type { ReactNode } from "react"
import { cx } from "~/utils/cx"
import { TITLE_BASE_CLASSES } from "./titleBaseClasses"

type PageTitleProps = {
    children: ReactNode
    className?: string
}

export const PageTitle = ({ children, className = "" }: PageTitleProps) => (
    <h1 className={cx(TITLE_BASE_CLASSES, "text-4xl sm:text-5xl", className)}>
        {children}
    </h1>
)
