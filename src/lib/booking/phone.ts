const TOBAGO_COUNTRY_CODE = '+1868'

export function normalizePhone(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  const digits = trimmed.replace(/\D/g, '')

  if (digits.length === 7) {
    return `${TOBAGO_COUNTRY_CODE}${digits}`
  }

  if (digits.length === 11 && digits.startsWith('1868')) {
    return `+${digits}`
  }

  if (digits.length === 10 && digits.startsWith('868')) {
    return `+1${digits}`
  }

  if (trimmed.startsWith('+') && digits.length >= 10) {
    return `+${digits}`
  }

  return null
}
