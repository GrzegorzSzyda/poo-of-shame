import { useCallback } from "react"
import logo from "~/assets/logo.svg"

type LoadingScreenProps = {
    message?: string
}

export const LoadingScreen = ({ message = "Ładowanie..." }: LoadingScreenProps) => {
    const handleLogoDoubleClick = useCallback(
        (event: React.MouseEvent<HTMLImageElement>) => {
            const logoElement = event.currentTarget
            logoElement.classList.add("logo-spin-once")
            logoElement.addEventListener(
                "animationend",
                () => logoElement.classList.remove("logo-spin-once"),
                { once: true },
            )
        },
        [],
    )

    return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
            <div className="relative flex items-center justify-center">
                <div className="logo-bounce-shadow bg-primary/20 absolute -bottom-1 h-2 w-16 rounded-full opacity-0 blur-lg" />
                <img
                    src={logo}
                    alt="Poo of Shame"
                    className="logo-bounce relative h-20 w-20"
                    onDoubleClick={handleLogoDoubleClick}
                />
            </div>
            <p className="text-primary font-['Baloo 2'] text-2xl font-bold drop-shadow-[var(--shadow-primary)]">
                {message}
            </p>
        </div>
    )
}
