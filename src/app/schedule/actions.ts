'use server'

import { cookies } from 'next/headers'
import { parseBookingRequest } from '@/lib/booking/validation'
import { normalizePhone } from '@/lib/booking/phone'
import { fetchAvailableSlotsForDate } from '@/lib/booking/queries'
import { REFERRAL_COOKIE_NAME, sanitizeReferralCode } from '@/lib/referrals/cookie'
import { displayPhone } from '@/lib/settings/contact'
import { getBusinessSettings } from '@/lib/settings/queries'
import { formatPreferredSlot } from '@/lib/leads/format'
import { notify } from '@/lib/notifications'
import { logNotifyFailure } from '@/lib/notifications/log-notify-failure'
import { createClient } from '@/utils/supabase/server'

export type BookingResult =
  | { ok: true; leadId: string }
  | { ok: false; error: string }

export async function getAvailableSlots(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { ok: false as const, error: 'Invalid date', slots: [] }
  }

  try {
    const slots = await fetchAvailableSlotsForDate(date)
    return { ok: true as const, slots }
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : 'Failed to load slots',
      slots: [],
    }
  }
}

export async function submitBookingRequest(input: unknown): Promise<BookingResult> {
  const parsed = parseBookingRequest(input)
  if (parsed.ok === false) return { ok: false, error: parsed.error }

  const data = parsed.data
  const normalizedPhone = normalizePhone(data.phone)

  if (!normalizedPhone) {
    return { ok: false, error: 'Please enter a valid phone number' }
  }

  const cookieStore = await cookies()
  const referralCode =
    sanitizeReferralCode(data.referralCode) ??
    sanitizeReferralCode(cookieStore.get(REFERRAL_COOKIE_NAME)?.value)

  const supabase = await createClient()

  const { data: leadId, error } = await supabase.rpc('create_booking_request', {
    p_full_name: data.fullName,
    p_phone: normalizedPhone,
    p_email: data.email?.trim() || '',
    p_service_id: data.serviceId,
    p_site_location: data.siteLocation,
    p_site_lat: data.siteLat,
    p_site_lng: data.siteLng,
    p_preferred_start: data.preferredStart,
    p_preferred_end: data.preferredEnd,
    p_referral_code: referralCode ?? undefined,
    p_inquiry_details: data.inquiryDetails?.trim() || undefined,
  })

  if (error) {
    if (error.message.includes('no longer available')) {
      return { ok: false, error: 'That time was just booked. Please choose another.' }
    }
    return { ok: false, error: error.message }
  }

  if (!leadId) {
    const business = await getBusinessSettings()
    const phone = displayPhone(business.phone)
    return { ok: false, error: `Booking failed. Please try again or call ${phone}.` }
  }

  const { data: service } = await supabase
    .from('services')
    .select('name')
    .eq('id', data.serviceId)
    .maybeSingle()

  const customerEmail = data.email?.trim()
  const occurredAt = new Date().toISOString()
  const notifyResult = await notify({
    eventId: crypto.randomUUID(),
    eventType: 'business.booking.created',
    occurredAt,
    actorId: null,
    aggregateId: leadId,
    source: 'server_action',
    sourceEventKey: `booking:${leadId}`,
    payload: {
      leadId,
      customerName: data.fullName,
      serviceName: service?.name,
      preferredWindow: formatPreferredSlot(data.preferredStart, data.preferredEnd),
      siteLocation: data.siteLocation,
      customerEmail: customerEmail || undefined,
    },
  })

  logNotifyFailure('booking trigger failed', notifyResult, { leadId })

  return { ok: true, leadId }
}
