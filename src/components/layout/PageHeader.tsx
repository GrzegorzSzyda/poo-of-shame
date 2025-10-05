import type { ReactNode } from "react"
import { cx } from "~/utils/cx"

type PageHeaderProps = {
    children: ReactNode
    className?: string
}

export const PageHeader = ({ children, className = "" }: PageHeaderProps) => (
    <header
        className={cx(
            "border-primary-dark bg-primary-dark/20 space-y-3 rounded-2xl border p-8",
            className,
        )}
    >
        {children}
    </header>
)
