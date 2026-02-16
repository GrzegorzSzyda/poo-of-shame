import { XIcon } from '@phosphor-icons/react'
import { type ComponentType, type ReactNode, useEffect, useRef, useState } from 'react'
import { H2 } from './H2'

type IconWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'
type IconComponent = ComponentType<{ className?: string; weight?: IconWeight }>

type DrawerProps = {
    isOpen: boolean
    title: string
    titleStartIcon?: IconComponent
    titleStartIconWeight?: IconWeight
    onClose: () => void
    children: ReactNode
}

export const Drawer = ({
    isOpen,
    title,
    titleStartIcon,
    titleStartIconWeight,
    onClose,
    children,
}: DrawerProps) => {
    const DRAWER_ANIMATION_MS = 520
    const closeButtonRef = useRef<HTMLButtonElement | null>(null)
    const [isRendered, setIsRendered] = useState(isOpen)
    const [isVisible, setIsVisible] = useState(false)

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

    useEffect(() => {
        if (isOpen) {
            setIsRendered(true)
            const timer = window.setTimeout(() => setIsVisible(true), 20)
            return () => window.clearTimeout(timer)
        }

        setIsVisible(false)
    }, [isOpen])

    useEffect(() => {
        if (isOpen || !isRendered) return
        const timer = window.setTimeout(() => setIsRendered(false), DRAWER_ANIMATION_MS)
        return () => window.clearTimeout(timer)
    }, [isOpen, isRendered])

    if (!isRendered) {
        return null
    }

    return (
        <div className={`fixed inset-0 z-50 ${isVisible ? '' : 'pointer-events-none'}`}>
            <button
                type="button"
                className={`overlay-fade absolute inset-0 bg-black/70 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
                aria-label="Zamknij panel"
            />

            <aside
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className={`border-text/20 absolute top-0 right-0 flex h-full w-full max-w-2xl flex-col overflow-hidden border-l bg-[linear-gradient(135deg,#1a1026_0%,#0f0619_100%)] p-6 shadow-[-24px_0_48px_rgba(0,0,0,0.4)] transition-transform duration-[520ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${isVisible ? 'translate-x-0' : 'translate-x-[105%]'}`}
            >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_2%_6%,rgba(94,234,212,0.08)_0%,rgba(94,234,212,0.03)_24%,rgba(12,2,23,0)_52%)]" />

                <div className="relative z-10 mb-6 flex items-center justify-between gap-4">
                    <H2 startIcon={titleStartIcon} startIconWeight={titleStartIconWeight}>
                        {title}
                    </H2>
                    <button
                        ref={closeButtonRef}
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-teal-300 transition-colors hover:bg-teal-300/15 hover:text-teal-100"
                        aria-label="Zamknij panel"
                    >
                        <XIcon className="h-6 w-6" weight="bold" />
                    </button>
                </div>

                <div className="relative z-10 min-h-0 flex-1 overflow-y-auto">
                    {children}
                </div>
            </aside>
        </div>
    )
}
