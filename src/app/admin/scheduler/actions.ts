'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
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
  await requireAdmin()

  const leadId = String(formData.get('lead_id') ?? '')
  const title = String(formData.get('title') ?? '').trim()
  const startTime = String(formData.get('start_time') ?? '')
  const endTime = String(formData.get('end_time') ?? '')

  if (!leadId || !title || !startTime || !endTime) {
    return { ok: false, error: 'Missing required fields' }
  }

  const supabase = await createClient()

  const { error: appointmentError } = await supabase.from('appointments').insert({
    lead_id: leadId,
    title,
    start_time: parseAdminDatetime(startTime),
    end_time: parseAdminDatetime(endTime),
    is_blockout: false,
    status: 'confirmed',
  })

  if (appointmentError) {
    return { ok: false, error: appointmentError.message }
  }

  const { error: leadError } = await supabase
    .from('leads')
    .update({ status: 'converted' })
    .eq('id', leadId)

  if (leadError) {
    return { ok: false, error: leadError.message }
  }

  revalidatePath('/admin/scheduler')
  revalidatePath('/admin/leads')
  revalidatePath(`/admin/leads/${leadId}`)
  revalidatePath('/admin')

  return { ok: true }
}

export async function cancelAppointment(appointmentId: string): Promise<SchedulerActionResult> {
  await requireAdmin()

  const supabase = await createClient()
  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled', deleted_at: new Date().toISOString() })
    .eq('id', appointmentId)

  if (error) {
    return { ok: false, error: error.message }
  }

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
