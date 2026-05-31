import { CircleNotchIcon } from '@phosphor-icons/react'
import { Logo } from './Logo'

type LoadingViewProps = {
    title: string
    message: string
}

export const LoadingView = ({ title, message }: LoadingViewProps) => {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
            <div className="motion-safe:animate-bounce">
                <Logo />
            </div>
            <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-teal-200">
                    <CircleNotchIcon className="h-8 w-8 animate-spin" />
                    <p className="text-text text-xl font-semibold">{title}</p>
                </div>
                <p className="text-text/90 max-w-xl text-base">{message}</p>
            </div>
        </div>
    )
}
