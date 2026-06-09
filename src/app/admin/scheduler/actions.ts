'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import { formatPreferredSlot } from '@/lib/leads/format'
import { notify } from '@/lib/notifications'
import { logNotifyFailure } from '@/lib/notifications/log-notify-failure'
import { createClient } from '@/utils/supabase/server'

export type SchedulerActionResult = { ok: true } | { ok: false; error: string }

export async function createBlockout(formData: FormData): Promise<SchedulerActionResult> {
  await requireAdmin()

  const title = String(formData.get('title') ?? 'Blocked').trim() || 'Blocked'
  const date = String(formData.get('date') ?? '')
  const startTime = String(formData.get('start_time') ?? '08:00')
  const endTime = String(formData.get('end_time') ?? '17:00')

  if (!date) {
    return { ok: false, error: 'Date is required' }
  }

  const startIso = tobagoLocalIso(date, startTime)
  const endIso = tobagoLocalIso(date, endTime)

  if (new Date(startIso) >= new Date(endIso)) {
    return { ok: false, error: 'End time must be after start time' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('appointments').insert({
    title,
    start_time: startIso,
    end_time: endIso,
    is_blockout: true,
    status: 'scheduled',
  })

  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath('/admin/scheduler')
  revalidatePath('/admin')

  return { ok: true }
}

export async function confirmAppointmentFromLead(formData: FormData): Promise<SchedulerActionResult> {
  const { user } = await requireAdmin()

  const leadId = String(formData.get('lead_id') ?? '')
  const title = String(formData.get('title') ?? '').trim()
  const startTime = String(formData.get('start_time') ?? '')
  const endTime = String(formData.get('end_time') ?? '')

  if (!leadId || !title || !startTime || !endTime) {
    return { ok: false, error: 'Missing required fields' }
  }

  const supabase = await createClient()
  const startIso = parseAdminDatetime(startTime)
  const endIso = parseAdminDatetime(endTime)

  const { data: lead, error: leadFetchError } = await supabase
    .from('leads')
    .select('full_name, status')
    .eq('id', leadId)
    .maybeSingle()

  if (leadFetchError || !lead) {
    return { ok: false, error: 'Lead not found' }
  }

  const { data: appointment, error: appointmentError } = await supabase
    .from('appointments')
    .insert({
      lead_id: leadId,
      title,
      start_time: startIso,
      end_time: endIso,
      is_blockout: false,
      status: 'confirmed',
    })
    .select('id')
    .single()

  if (appointmentError || !appointment) {
    return { ok: false, error: appointmentError?.message ?? 'Appointment could not be created' }
  }

  const { error: leadError } = await supabase
    .from('leads')
    .update({ status: 'converted' })
    .eq('id', leadId)

  if (leadError) {
    return { ok: false, error: leadError.message }
  }

  const scheduledAt = formatPreferredSlot(startIso, endIso)
  const notifyResult = await notify({
    eventId: crypto.randomUUID(),
    eventType: 'business.appointment.confirmed',
    occurredAt: new Date().toISOString(),
    actorId: user.id,
    aggregateId: appointment.id,
    source: 'server_action',
    sourceEventKey: `appointment-confirmed:${appointment.id}`,
    payload: {
      appointmentId: appointment.id,
      leadId,
      scheduledAt,
      title,
      customerName: lead.full_name,
    },
  })

  logNotifyFailure('appointment confirmed trigger failed', notifyResult, {
    appointmentId: appointment.id,
  })

  if (lead.status !== 'converted') {
    const statusNotifyResult = await notify({
      eventId: crypto.randomUUID(),
      eventType: 'business.lead.status_changed',
      occurredAt: new Date().toISOString(),
      actorId: user.id,
      aggregateId: leadId,
      source: 'server_action',
      sourceEventKey: `lead-status:${leadId}:converted`,
      payload: {
        leadId,
        previousStatus: lead.status,
        newStatus: 'converted',
      },
    })

    logNotifyFailure('lead converted trigger failed', statusNotifyResult, { leadId })
  }

  revalidatePath('/admin/scheduler')
  revalidatePath('/admin/leads')
  revalidatePath(`/admin/leads/${leadId}`)
  revalidatePath('/admin')

  return { ok: true }
}

export async function cancelAppointment(appointmentId: string): Promise<SchedulerActionResult> {
  const { user } = await requireAdmin()

  const supabase = await createClient()

  const { data: appointment, error: fetchError } = await supabase
    .from('appointments')
    .select('id, lead_id, title, start_time, end_time, status')
    .eq('id', appointmentId)
    .maybeSingle()

  if (fetchError || !appointment) {
    return { ok: false, error: 'Appointment not found' }
  }

  if (appointment.status === 'cancelled') {
    return { ok: true }
  }

  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled', deleted_at: new Date().toISOString() })
    .eq('id', appointmentId)

  if (error) {
    return { ok: false, error: error.message }
  }

  const notifyResult = await notify({
    eventId: crypto.randomUUID(),
    eventType: 'business.appointment.cancelled',
    occurredAt: new Date().toISOString(),
    actorId: user.id,
    aggregateId: appointmentId,
    source: 'server_action',
    sourceEventKey: `appointment-cancelled:${appointmentId}`,
    payload: {
      appointmentId,
      leadId: appointment.lead_id ?? undefined,
      title: appointment.title,
      scheduledAt: formatPreferredSlot(appointment.start_time, appointment.end_time),
    },
  })

  logNotifyFailure('appointment cancelled trigger failed', notifyResult, { appointmentId })

  revalidatePath('/admin/scheduler')
  revalidatePath('/admin')

  return { ok: true }
}

/** AST (UTC-4): local wall time → ISO UTC */
function tobagoLocalIso(date: string, time: string): string {
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  return new Date(Date.UTC(year, month - 1, day, hour + 4, minute)).toISOString()
}

function parseAdminDatetime(value: string): string {
  if (!value) return value
  if (value.endsWith('Z') || value.includes('+')) {
    return new Date(value).toISOString()
  }
  const [date, time] = value.split('T')
  return tobagoLocalIso(date, time ?? '00:00')
}
