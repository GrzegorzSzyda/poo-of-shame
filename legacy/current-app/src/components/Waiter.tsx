import { QueryErrorResetBoundary } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

export const Waiter = ({ children }: PropsWithChildren) => (
    <Suspense fallback="Ładuje...">
        <QueryErrorResetBoundary>
            {({ reset }) => (
                <ErrorBoundary
                    onReset={reset}
                    fallbackRender={({ resetErrorBoundary }) => (
                        <div>
                            There was an error!
                            <button onClick={resetErrorBoundary}>Try again</button>
                        </div>
                    )}
                >
                    {children}
                </ErrorBoundary>
            )}
        </QueryErrorResetBoundary>
    </Suspense>
)
