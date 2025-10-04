import logo from './assets/logo.svg'
import './index.css'

export const App = () => (
    <main className='mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-8 p-8 text-center'>
        <div className='flex flex-col items-center gap-6'>
            <img
                src={logo}
                alt='Poo of Shame logo'
                className='h-28 w-28 drop-shadow-[0_12px_30px_rgba(146,79,247,0.35)]'
            />
            <h1 className="text-primary font-[\'Baloo 2\'] text-5xl font-black tracking-tight drop-shadow-[0_12px_30px_rgba(146,79,247,0.35)]">
                Poo of shame
            </h1>
            <p className='text-primary-light/80 max-w-xl text-lg text-balance'>
                Posprzątaj swoją kupkę wstydu!
            </p>
        </div>
    </main>
)
