'use server'

import { revalidatePath } from 'next/cache'
import { isValidLeadStatus } from '@/lib/leads/status'
import { requireAdmin } from '@/lib/auth/require-admin'
import { notify } from '@/lib/notifications'
import { logNotifyFailure } from '@/lib/notifications/log-notify-failure'
import { createClient } from '@/utils/supabase/server'

export type LeadActionResult = { ok: true } | { ok: false; error: string }

export async function updateLeadStatus(
  leadId: string,
  status: string
): Promise<LeadActionResult> {
  const { user } = await requireAdmin()

  if (!isValidLeadStatus(status)) {
    return { ok: false, error: 'Invalid status' }
  }

  const supabase = await createClient()

  const { data: existingLead, error: fetchError } = await supabase
    .from('leads')
    .select('status')
    .eq('id', leadId)
    .maybeSingle()

  if (fetchError || !existingLead) {
    return { ok: false, error: 'Lead not found' }
  }

  if (existingLead.status === status) {
    return { ok: true }
  }

  const { error } = await supabase.from('leads').update({ status }).eq('id', leadId)

  if (error) {
    return { ok: false, error: error.message }
  }

  const notifyResult = await notify({
    eventId: crypto.randomUUID(),
    eventType: 'business.lead.status_changed',
    occurredAt: new Date().toISOString(),
    actorId: user.id,
    aggregateId: leadId,
    source: 'server_action',
    sourceEventKey: `lead-status:${leadId}:${status}`,
    payload: {
      leadId,
      previousStatus: existingLead.status,
      newStatus: status,
    },
  })

  logNotifyFailure('lead status trigger failed', notifyResult, { leadId })

  revalidatePath('/admin/leads')
  revalidatePath(`/admin/leads/${leadId}`)
  revalidatePath('/admin')

  return { ok: true }
}

export async function updateLeadInquiryDetails(
  leadId: string,
  inquiryDetails: string
): Promise<LeadActionResult> {
  await requireAdmin()

  const supabase = await createClient()
  const { error } = await supabase
    .from('leads')
    .update({ inquiry_details: inquiryDetails.trim() || null })
    .eq('id', leadId)

  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath(`/admin/leads/${leadId}`)

  return { ok: true }
}
