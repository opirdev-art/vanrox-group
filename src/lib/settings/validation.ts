import type { ParseResult } from '@/lib/parse-result'

export type BusinessSettingsInput = {
  businessName?: string
  phone?: string
  email?: string
  address?: string
}

function normalizeText(formData: FormData, key: string, maxLength: number): string | undefined {
  const value = String(formData.get(key) ?? '').trim()
  if (!value) return undefined
  return value.slice(0, maxLength)
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function parseBusinessSettingsForm(formData: FormData): ParseResult<BusinessSettingsInput> {
  const businessName = normalizeText(formData, 'business_name', 120)
  const phone = normalizeText(formData, 'phone', 60)
  const email = normalizeText(formData, 'email', 120)
  const address = normalizeText(formData, 'address', 300)

  if (email && !isValidEmail(email)) {
    return { ok: false, error: 'Please enter a valid business email address' }
  }

  return {
    ok: true,
    data: {
      businessName,
      phone,
      email,
      address,
    },
  }
}
