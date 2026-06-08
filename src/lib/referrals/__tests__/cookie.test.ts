import { describe, expect, it } from 'vitest'
import { REFERRAL_COOKIE_NAME, sanitizeReferralCode } from '../cookie'

describe('sanitizeReferralCode', () => {
  it('trims and returns code', () => {
    expect(sanitizeReferralCode('  PARTNER1  ')).toBe('PARTNER1')
  })

  it('returns null for empty values', () => {
    expect(sanitizeReferralCode('')).toBeNull()
    expect(sanitizeReferralCode('   ')).toBeNull()
    expect(sanitizeReferralCode(null)).toBeNull()
  })
})

describe('REFERRAL_COOKIE_NAME', () => {
  it('is a stable cookie key', () => {
    expect(REFERRAL_COOKIE_NAME).toBe('vanrox_ref')
  })
})
