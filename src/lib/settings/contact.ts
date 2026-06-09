import { normalizePhone } from '@/lib/booking/phone'

export function phoneTelHref(phone: string): string {
  const normalized = normalizePhone(phone)
  if (normalized) return `tel:${normalized}`
  const digits = phone.replace(/\D/g, '')
  return digits ? `tel:+${digits}` : 'tel:'
}

export function displayPhone(phone: string): string {
  return phone.trim()
}

export function mailtoHref(email: string): string | null {
  const trimmed = email.trim()
  return trimmed ? `mailto:${trimmed}` : null
}
