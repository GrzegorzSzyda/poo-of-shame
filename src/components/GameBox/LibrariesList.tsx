import type { UserGame } from '~/types/UserGame'

type LibrariesProps = {
    userGame: UserGame | null
}

export const LibrariesList = ({ userGame }: LibrariesProps) => {
    if (!userGame) return null
    return <div>Bibloteki</div>
}
