export type Libraries = Library[]

export type Library = {
    id: string
    name: string
    platform: 'pc' | 'ps' | 'xbox' | 'nintendo' | 'other'
}
