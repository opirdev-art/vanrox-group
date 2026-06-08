import { describe, expect, it } from 'vitest'
import { parseBookingRequest } from '../validation'

describe('parseBookingRequest', () => {
  const base = {
    serviceId: 1,
    fullName: 'Jane Doe',
    phone: '2721240',
    siteLocation: 'Milford Road, Scarborough, Tobago',
    siteLat: 11.1833,
    siteLng: -60.7353,
    preferredStart: '2026-06-08T12:00:00.000Z',
    preferredEnd: '2026-06-08T13:00:00.000Z',
  }

  it('rejects missing site location text', () => {
    const result = parseBookingRequest({ ...base, siteLocation: '' })
    expect(result.ok).toBe(false)
  })

  it('rejects coordinates outside Trinidad & Tobago', () => {
    const result = parseBookingRequest({
      ...base,
      siteLat: 40.7128,
      siteLng: -74.006,
    })
    expect(result.ok).toBe(false)
  })

  it('accepts a valid booking payload with map pin', () => {
    const result = parseBookingRequest({
      ...base,
      email: 'jane@example.com',
      inquiryDetails: 'Boundary survey for lot 12',
    })
    expect(result.ok).toBe(true)
  })

  it('accepts Postgres-style slot timestamps from Supabase', () => {
    const result = parseBookingRequest({
      ...base,
      preferredStart: '2026-06-08 12:00:00+00',
      preferredEnd: '2026-06-08 13:00:00+00',
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.preferredStart).toBe('2026-06-08T12:00:00.000Z')
    }
  })
})
