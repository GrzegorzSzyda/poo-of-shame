export const { keys, values, assign, fromEntries } = Object
export const entries = <K extends PropertyKey, V>(obj: Record<K, V>) =>
    Object.entries(obj) as [K, V][]
