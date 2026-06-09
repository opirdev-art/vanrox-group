'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import type { SettingsActionResult } from '@/lib/settings/action-result'
import { isBusinessSettingsTableUnavailable } from '@/lib/settings/errors'
import { parseBusinessSettingsForm } from '@/lib/settings/validation'
import { createClient } from '@/utils/supabase/server'

export async function saveBusinessSettings(formData: FormData): Promise<SettingsActionResult> {
  await requireAdmin()

  const parsed = parseBusinessSettingsForm(formData)
  if (parsed.ok === false) return { ok: false, error: parsed.error }

  const { businessName, phone, email, address } = parsed.data

  const supabase = await createClient()
  const { error } = await supabase.from('business_settings').upsert(
    {
      id: 1,
      phone: phone ?? null,
      email: email ?? null,
      address: address ?? null,
      metadata: businessName ? { business_name: businessName } : {},
    },
    { onConflict: 'id' }
  )

  if (error) {
    if (isBusinessSettingsTableUnavailable(error)) {
      return { ok: false, error: 'Please apply latest Supabase migrations before saving settings.' }
    }
    return { ok: false, error: error.message }
  }

  revalidatePath('/admin/settings/general')
  revalidatePath('/', 'layout')
  revalidatePath('/services')
  revalidatePath('/schedule')
  return { ok: true }
}
