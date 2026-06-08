export const REFERRAL_COOKIE_NAME = 'vanrox_ref'

export const REFERRAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export function sanitizeReferralCode(value: string | null | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}
