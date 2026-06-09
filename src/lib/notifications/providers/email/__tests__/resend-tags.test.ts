import { describe, expect, it } from 'vitest'
import { sanitizeResendTags, sanitizeResendTagValue } from '../resend-tags'

describe('resend tag sanitization', () => {
  it('replaces dots in event types', () => {
    expect(sanitizeResendTagValue('auth.staff.invited')).toBe('auth_staff_invited')
  })

  it('preserves letters numbers underscores and dashes', () => {
    expect(sanitizeResendTagValue('event_type')).toBe('event_type')
    expect(sanitizeResendTagValue('bed71a00-612f-4392-a271-1a869568ec10')).toBe(
      'bed71a00-612f-4392-a271-1a869568ec10'
    )
  })

  it('sanitizes tag name and value pairs', () => {
    expect(
      sanitizeResendTags([{ name: 'event_type', value: 'auth.staff.invited' }])
    ).toEqual([{ name: 'event_type', value: 'auth_staff_invited' }])
  })
})
