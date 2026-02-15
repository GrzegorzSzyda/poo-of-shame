import {
    CheckCircleIcon,
    InfoIcon,
    WarningCircleIcon,
    XIcon,
} from '@phosphor-icons/react'
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react'
import type { ReactNode } from 'react'
import { Button } from './Button'

type ToastTone = 'success' | 'error' | 'info'

type ToastInput = {
    title: string
    description?: string
    tone?: ToastTone
    durationMs?: number
}

type ToastItem = {
    id: string
    title: string
    description?: string
    tone: ToastTone
    durationMs: number
}

type ToastContextValue = {
    showToast: (input: ToastInput) => void
    success: (title: string, description?: string) => void
    error: (title: string, description?: string) => void
    info: (title: string, description?: string) => void
}

const DEFAULT_DURATION_MS = 4200

const ToastContext = createContext<ToastContextValue | null>(null)

const toneStyles: Record<ToastTone, string> = {
    success: 'bg-emerald-500/48 text-emerald-100',
    error: 'bg-red-500/48 text-red-100',
    info: 'bg-sky-500/48 text-sky-100',
}

const toneIcon = (tone: ToastTone) => {
    switch (tone) {
        case 'success':
            return CheckCircleIcon
        case 'error':
            return WarningCircleIcon
        case 'info':
            return InfoIcon
    }
}

type ToastProviderProps = {
    children: ReactNode
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
    const [toasts, setToasts] = useState<ToastItem[]>([])

    const removeToast = useCallback((id: string) => {
        setToasts((current) => current.filter((toast) => toast.id !== id))
    }, [])

    const showToast = useCallback((input: ToastInput) => {
        const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
        setToasts((current) => [
            ...current,
            {
                id,
                title: input.title,
                description: input.description,
                tone: input.tone ?? 'info',
                durationMs: input.durationMs ?? DEFAULT_DURATION_MS,
            },
        ])
    }, [])

    const contextValue = useMemo<ToastContextValue>(
        () => ({
            showToast,
            success: (title, description) =>
                showToast({ title, description, tone: 'success' }),
            error: (title, description) =>
                showToast({ title, description, tone: 'error' }),
            info: (title, description) => showToast({ title, description, tone: 'info' }),
        }),
        [showToast],
    )

    useEffect(() => {
        if (toasts.length === 0) return

        const timers = toasts.map((toast) =>
            window.setTimeout(() => removeToast(toast.id), toast.durationMs),
        )

        return () => {
            timers.forEach((timer) => window.clearTimeout(timer))
        }
    }, [toasts, removeToast])

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            <div className="pointer-events-none fixed top-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 p-2">
                {toasts.map((toast) => {
                    const Icon = toneIcon(toast.tone)
                    return (
                        <div
                            key={toast.id}
                            className={`pointer-events-auto rounded-lg px-3 py-2 shadow-[0_12px_28px_rgba(0,0,0,0.35)] backdrop-blur-sm ${toneStyles[toast.tone]}`}
                        >
                            <div className="flex items-start gap-2">
                                <Icon className="mt-0.5 h-4.5 w-4.5 shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium">{toast.title}</p>
                                    {toast.description ? (
                                        <p className="mt-0.5 text-xs opacity-90">
                                            {toast.description}
                                        </p>
                                    ) : null}
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-current hover:bg-white/10"
                                    title="Zamknij komunikat"
                                    onClick={() => removeToast(toast.id)}
                                >
                                    <XIcon className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </ToastContext.Provider>
    )
}

export const useToast = () => {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within ToastProvider')
    }
    return context
}
