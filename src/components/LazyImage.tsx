import { type ImgHTMLAttributes, useEffect, useRef, useState } from 'react'

type Props = ImgHTMLAttributes<HTMLImageElement> & {
    rootMargin?: string
}

export const LazyImage = ({
    src,
    rootMargin = '200px 0px',
    loading = 'lazy',
    decoding = 'async',
    ...props
}: Props) => {
    const imageRef = useRef<HTMLImageElement | null>(null)
    const [shouldLoad, setShouldLoad] = useState(false)

    useEffect(() => {
        setShouldLoad(false)
    }, [src])

    useEffect(() => {
        if (!src || shouldLoad) return

        if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
            setShouldLoad(true)
            return
        }

        const element = imageRef.current
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
    }, [rootMargin, shouldLoad, src])

    return (
        <img
            ref={imageRef}
            {...props}
            src={shouldLoad ? src : undefined}
            data-src={src}
            loading={loading}
            decoding={decoding}
        />
    )
}
