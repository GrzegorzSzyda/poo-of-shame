import { SignedIn, UserButton } from '@clerk/clerk-react'

export const UserMenu = () => (
    <SignedIn>
        <UserButton />
    </SignedIn>
)
