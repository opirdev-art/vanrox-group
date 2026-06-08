import { describe, expect, it } from 'vitest'
import { normalizeBookingDatetime } from '../datetime'

describe('normalizeBookingDatetime', () => {
  it('normalizes ISO strings with Z suffix', () => {
    expect(normalizeBookingDatetime('2026-06-08T12:00:00.000Z')).toBe('2026-06-08T12:00:00.000Z')
  })

  it('normalizes Postgres-style space-separated timestamps', () => {
    const result = normalizeBookingDatetime('2026-06-08 12:00:00+00')
    expect(result).toBe('2026-06-08T12:00:00.000Z')
  })

  it('normalizes offset timestamps from Supabase', () => {
    const result = normalizeBookingDatetime('2026-06-08T12:00:00+00:00')
    expect(result).toBe('2026-06-08T12:00:00.000Z')
  })

  it('returns null for unparseable values', () => {
    expect(normalizeBookingDatetime('not-a-date')).toBeNull()
  })
})
