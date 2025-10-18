import { Link } from '@tanstack/react-router'
import logo from '../assets/logo.svg'

export const Logo = () => (
    <header className="flex flex-col items-center p-4">
        <Link to="/" aria-label="Poo of Shame – przejdź na stronę główną">
            <img src={logo} alt="Poo of Shame" />
            <h1 className="pt-2 text-center text-3xl leading-5 font-bold text-white uppercase">
                <div>Poo of</div>
                <div>Shame</div>
            </h1>
        </Link>
    </header>
)
