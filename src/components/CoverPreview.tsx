import { cx } from 'cva'
import { CoverImage } from './CoverImage'

type CoverPreviewProps = {
    url: string
    title: string
    className?: string
}

export const CoverPreview = ({ url, title, className }: CoverPreviewProps) => {
    return (
        <CoverImage
            src={url}
            title={title}
            className={cx('h-24 w-16 shrink-0 rounded', className)}
        />
    )
}
