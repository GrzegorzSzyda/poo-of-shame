import { cx } from 'cva'
import { useEffect, useRef, useState } from 'react'

type CoverImageProps = {
    src?: string
    title: string
    className?: string
    rootMargin?: string
}

export const CoverImage = ({
    src,
    title,
    className,
    rootMargin = '200px 0px',
}: CoverImageProps) => {
    const trimmedSrc = src?.trim() ?? ''
    const containerRef = useRef<HTMLDivElement | null>(null)
    const [hasLoadError, setHasLoadError] = useState(false)
    const [shouldLoad, setShouldLoad] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        setHasLoadError(false)
        setShouldLoad(false)
        setIsLoaded(false)
    }, [trimmedSrc])

    useEffect(() => {
        if (trimmedSrc.length === 0 || shouldLoad) return

        if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
            setShouldLoad(true)
            return
        }

        const element = containerRef.current
        if (!element) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry?.isIntersecting) return
                setShouldLoad(true)
                observer.disconnect()
            },
            { rootMargin },
        )

        observer.observe(element)

        return () => observer.disconnect()
    }, [rootMargin, shouldLoad, trimmedSrc])

    if (trimmedSrc.length === 0 || hasLoadError) {
        return (
            <div
                ref={containerRef}
                className={cx(
                    'bg-bg text-text/60 border-text/20 flex items-center justify-center overflow-hidden border text-[11px]',
                    className,
                )}
            >
                <span className="text-center leading-4">
                    brak
                    <br />
                    covera
                </span>
            </div>
        )
    }

    return (
        <div
            ref={containerRef}
            className={cx(
                'bg-bg border-text/20 relative overflow-hidden border',
                className,
            )}
        >
            {!isLoaded ? (
                <div className="text-text/55 absolute inset-0 flex items-center justify-center">
                    <span
                        aria-hidden="true"
                        className="border-text/20 border-t-text/70 h-5 w-5 animate-spin rounded-full border-2"
                    />
                    <span className="sr-only">Ładowanie okładki</span>
                </div>
            ) : null}
            {shouldLoad ? (
                <img
                    src={trimmedSrc}
                    alt={`Okładka: ${title.length > 0 ? title : 'gra'}`}
                    className={cx(
                        'h-full w-full object-cover transition-opacity duration-200',
                        isLoaded ? 'opacity-100' : 'opacity-0',
                    )}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setIsLoaded(true)}
                    onError={() => setHasLoadError(true)}
                />
            ) : null}
        </div>
    )
}
