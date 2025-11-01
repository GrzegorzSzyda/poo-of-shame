import logo from '../assets/logo.svg'

export const Logo = () => (
    <header>
        <a
            href="/"
            aria-label="Poo of Shame – przejdź na stronę główną"
            className="flex flex-col items-center p-4"
        >
            <img src={logo} alt="Poo of Shame" />
            <h1 className="pt-2 text-center text-3xl leading-5 font-bold text-white uppercase">
                <div>Poo of</div>
                <div>Shame</div>
            </h1>
        </a>
    </header>
)
