import { describe, expect, it } from 'vitest'
import { formatLeadDate, formatPreferredSlot } from '../format'

describe('formatLeadDate', () => {
  it('formats ISO timestamp for Tobago display', () => {
    const formatted = formatLeadDate('2026-06-08T16:30:00.000Z')
    expect(formatted).toMatch(/Jun/i)
    expect(formatted).toMatch(/2026/)
  })
})

describe('formatPreferredSlot', () => {
  it('returns em dash when preferred time is missing', () => {
    expect(formatPreferredSlot(null, null)).toBe('—')
  })

  it('formats start and end on the same line', () => {
    const result = formatPreferredSlot(
      '2026-06-08T12:00:00.000Z',
      '2026-06-08T13:00:00.000Z'
    )
    expect(result).toContain('–')
  })
})
