import { SignedIn, SignedOut } from '@clerk/clerk-react'
import { AddGameForm } from '~/features/AddGameForm'
import { GamesList } from '~/features/GamesList'
import { LibraryPanel } from '~/features/LibraryPanel'

export const HomePage = () => {
    return (
        <div>
            <AddGameForm />
            <GamesList />
            <SignedIn>
                <LibraryPanel />
            </SignedIn>
            <SignedOut>
                <div className="mt-8 border-2 p-4">
                    Zaloguj się, aby zarządzać biblioteką.
                </div>
            </SignedOut>
        </div>
    )
}
