import { describe, expect, it } from 'vitest'
import { normalizePhone } from '../phone'

describe('normalizePhone', () => {
  it('normalizes local Tobago number 2721240 to E.164', () => {
    expect(normalizePhone('2721240')).toBe('+18682721240')
  })

  it('returns null for empty phone', () => {
    expect(normalizePhone('')).toBeNull()
    expect(normalizePhone('   ')).toBeNull()
  })
})
