import { normalizeBookingDatetime } from './datetime'
import { isValidSiteCoordinates } from './location'

import type { ParseResult } from '@/lib/parse-result'

export type BookingRequestInput = {
  serviceId: number
  fullName: string
  phone: string
  email?: string
  siteLocation: string
  siteLat: number
  siteLng: number
  preferredStart: string
  preferredEnd: string
  inquiryDetails?: string
  referralCode?: string
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' ? value.trim() : undefined
}

function readPositiveInt(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : null
}

function readNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function parsePreferredTime(value: unknown, label: string): ParseResult<string> {
  const raw = readString(value)
  if (!raw) return { ok: false, error: `${label} is required` }

  const normalized = normalizeBookingDatetime(raw)
  if (!normalized) return { ok: false, error: 'Invalid preferred time' }

  return { ok: true, data: normalized }
}

export function parseBookingRequest(input: unknown): ParseResult<BookingRequestInput> {
  const row = asRecord(input)
  if (!row) return { ok: false, error: 'Invalid booking request' }

  const serviceId = readPositiveInt(row.serviceId)
  if (!serviceId) return { ok: false, error: 'Service is required' }

  const fullName = readString(row.fullName) ?? ''
  if (fullName.length < 2) return { ok: false, error: 'Full name is required' }

  const phone = readString(row.phone) ?? ''
  if (phone.length < 7) return { ok: false, error: 'Phone number is required' }

  const email = readString(row.email)
  if (email && !isValidEmail(email)) {
    return { ok: false, error: 'Please enter a valid email address' }
  }

  const siteLocation = readString(row.siteLocation) ?? ''
  if (siteLocation.length < 5) return { ok: false, error: 'Site address or landmark is required' }

  const siteLat = readNumber(row.siteLat)
  const siteLng = readNumber(row.siteLng)
  if (siteLat === null || siteLng === null) {
    return { ok: false, error: 'Drop a pin on the map for your site location' }
  }

  if (!isValidSiteCoordinates(siteLat, siteLng)) {
    return { ok: false, error: 'Drop a pin on the map within Trinidad & Tobago' }
  }

  const preferredStart = parsePreferredTime(row.preferredStart, 'Preferred start time')
  if (preferredStart.ok === false) return { ok: false, error: preferredStart.error }

  const preferredEnd = parsePreferredTime(row.preferredEnd, 'Preferred end time')
  if (preferredEnd.ok === false) return { ok: false, error: preferredEnd.error }

  return {
    ok: true,
    data: {
      serviceId,
      fullName,
      phone,
      email: email || undefined,
      siteLocation,
      siteLat,
      siteLng,
      preferredStart: preferredStart.data,
      preferredEnd: preferredEnd.data,
      inquiryDetails: readString(row.inquiryDetails),
      referralCode: readString(row.referralCode),
    },
  }
}
