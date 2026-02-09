import { Suspense, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Results } from './Results'

export const GameSearch = () => {
    const [searchText, setSearchText] = useState('')
    const trimmedSearchText = searchText.trim()
    const canSearch = trimmedSearchText.length >= 2

    return (
        <div className="flex flex-col">
            <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Wpisz nazwę gry"
                className="border-text/50 placeholder:text-text/50 focus:border-text rounded border px-4 py-1 focus:outline-none"
            />
            {canSearch && (
                <ErrorBoundary fallback={<p>Coś poszło nie tak.</p>}>
                    <Suspense fallback={<p>Szukam...</p>}>
                        <Results searchText={trimmedSearchText} />
                    </Suspense>
                </ErrorBoundary>
            )}
        </div>
    )
}
