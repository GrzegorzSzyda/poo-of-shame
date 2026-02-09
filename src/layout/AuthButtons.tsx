import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'

export const AuthButtons = () => (
    <div>
        <SignedOut>
            <SignInButton mode="modal" />
        </SignedOut>

        <SignedIn>
            <UserButton />
        </SignedIn>
    </div>
)
