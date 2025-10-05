import { Link } from "@tanstack/react-router"
import logo from "../assets/logo.svg"

export const Logo = () => (
    <Link to="/" preload="intent" className="flex items-center gap-3">
        <img
            src={logo}
            alt="Poo of Shame"
            className="h-12 w-12 drop-shadow-[var(--shadow-primary-strong)]"
        />
        <span className="font-['Baloo 2'] text-primary text-3xl font-bold drop-shadow-[var(--shadow-primary-strong)]">
            Poo of Shame
        </span>
    </Link>
)
