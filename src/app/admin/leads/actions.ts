'use server'

import { revalidatePath } from 'next/cache'
import { isValidLeadStatus } from '@/lib/leads/status'
import { requireAdmin } from '@/lib/auth/require-admin'
import { createClient } from '@/utils/supabase/server'

export type LeadActionResult = { ok: true } | { ok: false; error: string }

export async function updateLeadStatus(
  leadId: string,
  status: string
): Promise<LeadActionResult> {
  await requireAdmin()

  if (!isValidLeadStatus(status)) {
    return { ok: false, error: 'Invalid status' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('leads').update({ status }).eq('id', leadId)

  if (error) {
    return { ok: false, error: error.message }
  }

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
