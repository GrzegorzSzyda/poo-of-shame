import { SignInButton } from '@clerk/clerk-react'

export const SignedOutView = () => (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-zinc-100">
        <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl flex-col justify-center">
            <p className="mb-3 text-sm font-medium tracking-[0.18em] text-teal-300 uppercase">
                Poo of Shame
            </p>
            <h1 className="text-4xl font-semibold tracking-normal text-white sm:text-5xl">
                Biblioteka wraca od fundamentów.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-zinc-300">
                Na razie dostęp jest za logowaniem, bo pierwszy krok rewrite'u sprawdza
                połączenie Clerka z istniejącą bazą Convexa.
            </p>
            <div className="mt-8">
                <SignInButton mode="modal">
                    <button className="inline-flex h-11 items-center justify-center rounded-md bg-teal-300 px-5 text-sm font-semibold text-zinc-950 transition hover:bg-teal-200">
                        Zaloguj się
                    </button>
                </SignInButton>
            </div>
        </section>
    </main>
)
