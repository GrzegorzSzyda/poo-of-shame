const { keys, values, assign, fromEntries } = Object

const entries = <Value>(object: Record<string, Value>) =>
    Object.entries(object) as [string, Value][]

export { keys, values, assign, fromEntries, entries }
