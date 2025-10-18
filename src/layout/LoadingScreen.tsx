import { type MouseEvent, useCallback } from 'react'
import logo from '~/assets/logo.svg'

type LoadingScreenProps = {
    message?: string
}

export const LoadingScreen = ({ message = 'Ładowanie...' }: LoadingScreenProps) => {
    const handleLogoDoubleClick = useCallback((event: MouseEvent<HTMLImageElement>) => {
        const logoElement = event.currentTarget
        logoElement.classList.add('logo-spin-once')
        logoElement.addEventListener(
            'animationend',
            () => logoElement.classList.remove('logo-spin-once'),
            { once: true },
        )
    }, [])

    return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
            <img
                src={logo}
                className="logo-bounce"
                onDoubleClick={handleLogoDoubleClick}
                alt="Poo of Shame"
            />
            <p className="mt-4 text-white">{message}</p>
        </div>
    )
}
