import { Link } from '@tanstack/react-router'

const linkBase =
    'transition-colors duration-200 text-primary-light/80 hover:text-primary-light'

export const Navigation = () => (
    <nav aria-label="Główna nawigacja">
        <ul className="flex items-center gap-6 text-lg font-medium">
            <li>
                <Link
                    to="/"
                    preload="intent"
                    className={linkBase}
                    activeProps={{ className: 'text-primary' }}
                >
                    Pulpit
                </Link>
            </li>
            <li>
                <Link
                    to="/backlog"
                    preload="intent"
                    className={linkBase}
                    activeProps={{ className: 'text-primary' }}
                >
                    Twoja kupka
                </Link>
            </li>
            <li>
                <Link
                    to="/add"
                    preload="intent"
                    className="bg-primary text-bg hover:bg-primary-alt inline-flex items-center gap-2 rounded-full px-5 py-2 text-base font-semibold shadow-[var(--shadow-soft)] transition-colors duration-200"
                >
                    Wrzuć na kupkę
                </Link>
            </li>
        </ul>
    </nav>
)
