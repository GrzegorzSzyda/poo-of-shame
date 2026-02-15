import { cx } from 'cva'
import { useEffect, useState } from 'react'

type CoverPreviewProps = {
    url: string
    title: string
    className?: string
}

export const CoverPreview = ({ url, title, className }: CoverPreviewProps) => {
    const trimmedUrl = url.trim()
    const [hasLoadError, setHasLoadError] = useState(false)

    useEffect(() => {
        setHasLoadError(false)
    }, [trimmedUrl])

    const shouldShowImage = trimmedUrl.length > 0 && !hasLoadError

    return (
        <div
            className={cx(
                'bg-bg text-text/60 border-text/20 flex h-24 w-16 shrink-0 items-center justify-center overflow-hidden rounded border text-[11px]',
                className,
            )}
        >
            {shouldShowImage ? (
                <img
                    src={trimmedUrl}
                    alt={`Okładka: ${title.length > 0 ? title : 'gra'}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={() => setHasLoadError(true)}
                />
            ) : (
                <span className="text-center leading-4">
                    brak
                    <br />
                    covera
                </span>
            )}
        </div>
    )
}
