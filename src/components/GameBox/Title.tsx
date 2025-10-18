type TitleProps = {
    title: string | null
    releaseDate: string | null
}

export const Title = ({ title, releaseDate }: TitleProps) => (
    <h2
        className="w-full truncate text-lg"
        title={`${title}${releaseDate && ` (${releaseDate})`}`}
    >
        {title}
    </h2>
)
