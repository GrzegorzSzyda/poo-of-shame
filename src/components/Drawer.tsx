import { XIcon } from '@phosphor-icons/react'
import { type ComponentType, type ReactNode, useEffect, useRef } from 'react'
import { H1 } from './H1'

type IconComponent = ComponentType<{ className?: string }>

type DrawerProps = {
    isOpen: boolean
    title: string
    titleStartIcon?: IconComponent
    onClose: () => void
    children: ReactNode
}

export const Drawer = ({
    isOpen,
    title,
    titleStartIcon,
    onClose,
    children,
}: DrawerProps) => {
    const closeButtonRef = useRef<HTMLButtonElement | null>(null)

    useEffect(() => {
        if (!isOpen) return

        closeButtonRef.current?.focus()

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose()
            }
        }

        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        window.addEventListener('keydown', handleKeyDown)

        return () => {
            document.body.style.overflow = previousOverflow
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen, onClose])

    if (!isOpen) {
        return null
    }

    return (
        <div className="fixed inset-0 z-50">
            <button
                type="button"
                className="absolute inset-0 bg-black/70"
                onClick={onClose}
                aria-label="Zamknij panel"
            />

            <aside
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className="border-text/20 absolute top-0 right-0 h-full w-full max-w-2xl overflow-y-auto border-l bg-[linear-gradient(135deg,#1a1026_0%,#0f0619_100%)] p-6 shadow-[-24px_0_48px_rgba(0,0,0,0.4)]"
            >
                <div className="mb-6 flex items-center justify-between gap-4">
                    <H1 startIcon={titleStartIcon}>{title}</H1>
                    <button
                        ref={closeButtonRef}
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-teal-300 transition-colors hover:bg-teal-300/15 hover:text-teal-100"
                        aria-label="Zamknij panel"
                    >
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>

                {children}
            </aside>
        </div>
    )
}
