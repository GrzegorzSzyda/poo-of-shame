import { describe, expect, it } from 'vitest'
import { capitalize } from '~/utils/strings'

describe('capitalize', () => {
  it('capitalizes first letter', () => {
    expect(capitalize('hello')).toBe('Hello')
  })
})