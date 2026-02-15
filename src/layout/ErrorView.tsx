import { WarningCircle } from '@phosphor-icons/react'
import { Logo } from './Logo'

type ErrorViewProps = {
    title: string
    message: string
}

export const ErrorView = ({ title, message }: ErrorViewProps) => {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
            <Logo />
            <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-teal-200">
                    <WarningCircle className="h-8 w-8" />
                    <p className="text-xl font-semibold text-white">{title}</p>
                </div>
                <p className="text-text/90 max-w-xl text-base">{message}</p>
            </div>
        </div>
    )
}
