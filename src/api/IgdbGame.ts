export type IgdbGame = {
    id: number
    name: string
    first_release_date?: number
    cover?: IgdbGameCover
}

type IgdbGameCover = {
    id: number
    image_id: string
}
