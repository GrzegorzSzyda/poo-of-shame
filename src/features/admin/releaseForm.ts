import type { Doc } from '../../../convex/_generated/dataModel'

export type ReleasePrecision = 'exact' | 'year' | 'quarter' | 'month' | 'text' | 'unknown'

export type GameFormValues = {
    title: string
    releasePrecision: ReleasePrecision
    releaseDate: string
    releaseYear: string
    releaseQuarter: string
    releaseMonth: string
    releaseText: string
    coverUrl: string
}

export const releasePrecisionOptions: Array<{
    value: ReleasePrecision
    label: string
}> = [
    { value: 'exact', label: 'Dokładna data' },
    { value: 'year', label: 'Rok' },
    { value: 'quarter', label: 'Kwartał' },
    { value: 'month', label: 'Miesiąc' },
    { value: 'text', label: 'Opis tekstowy' },
    { value: 'unknown', label: 'Nieznana' },
]

export const createEmptyGameFormValues = (): GameFormValues => ({
    title: '',
    releasePrecision: 'exact',
    releaseDate: '',
    releaseYear: '',
    releaseQuarter: '1',
    releaseMonth: '1',
    releaseText: '',
    coverUrl: '',
})

export const toGameFormValues = (game: Doc<'games'>): GameFormValues => ({
    title: game.title,
    releasePrecision: (game.releasePrecision ?? 'unknown') as ReleasePrecision,
    releaseDate: game.releaseDate ?? '',
    releaseYear: game.releaseYear !== undefined ? String(game.releaseYear) : '',
    releaseQuarter: game.releaseQuarter !== undefined ? String(game.releaseQuarter) : '1',
    releaseMonth: game.releaseMonth !== undefined ? String(game.releaseMonth) : '1',
    releaseText: game.releaseText ?? '',
    coverUrl: game.coverImageUrl ?? '',
})

export const toGameMutationArgs = (values: GameFormValues) => ({
    title: values.title,
    releasePrecision: values.releasePrecision,
    releaseDate: values.releaseDate || undefined,
    releaseYear: values.releaseYear ? Number(values.releaseYear) : undefined,
    releaseQuarter: values.releaseQuarter ? Number(values.releaseQuarter) : undefined,
    releaseMonth: values.releaseMonth ? Number(values.releaseMonth) : undefined,
    releaseText: values.releaseText || undefined,
    coverImageUrl: values.coverUrl.trim().length > 0 ? values.coverUrl.trim() : undefined,
})

export const formatGameRelease = (game: Doc<'games'>) => {
    if (game.releaseDate) return game.releaseDate
    if (game.releaseYearMonth) return game.releaseYearMonth
    if (game.releaseYear !== undefined && game.releaseQuarter !== undefined) {
        return `${game.releaseYear} Q${game.releaseQuarter}`
    }
    if (game.releaseYear !== undefined) return String(game.releaseYear)
    if (game.releaseText) return game.releaseText
    return 'brak daty'
}
