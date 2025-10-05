const { keys, values, assign, fromEntries } = Object

const entries = <Key extends PropertyKey, Value>(object: Record<Key, Value>) =>
    Object.entries(object) as [Key, Value][]

export { keys, values, assign, fromEntries, entries }
