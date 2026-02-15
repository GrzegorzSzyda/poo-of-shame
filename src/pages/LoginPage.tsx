import { SignInButton } from '@clerk/clerk-react'
import { SignInIcon } from '@phosphor-icons/react'
import { Button } from '~/components/Button'
import { Logo } from '~/layout/Logo'

export const LoginPage = () => {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6">
            <Logo />
            <SignInButton mode="modal">
                <Button type="button" startIcon={SignInIcon}>
                    Zaloguj się, aby obejrzeć swoją kupkę
                </Button>
            </SignInButton>
        </div>
    )
}
