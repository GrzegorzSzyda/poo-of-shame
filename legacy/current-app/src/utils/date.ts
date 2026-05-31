const ISO_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/

export const formatIsoDatePl = (value: string, fallback = 'brak daty') => {
    const trimmed = value.trim()
    if (trimmed.length === 0) return fallback

    const match = ISO_DATE_REGEX.exec(trimmed)
    if (!match) return trimmed

    const [, year, month, day] = match
    return `${day}.${month}.${year}`
}
