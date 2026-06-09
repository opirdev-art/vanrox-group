'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import type { SettingsActionResult } from '@/lib/settings/action-result'
import { parseNotificationPreferencesForm } from '@/lib/settings/notification-preferences'
import { createClient } from '@/utils/supabase/server'

function asMetadataRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

export async function saveNotificationPreferences(formData: FormData): Promise<SettingsActionResult> {
  const { user, profile } = await requireAdmin()
  const isSuperAdmin = profile.role === 'super_admin'

  const preferences = parseNotificationPreferencesForm(formData, isSuperAdmin)

  const supabase = await createClient()
  const { data: existing, error: fetchError } = await supabase
    .from('profiles')
    .select('metadata')
    .eq('id', user.id)
    .single()

  if (fetchError) {
    return { ok: false, error: fetchError.message }
  }

  const metadata = asMetadataRecord(existing?.metadata)
  const { error } = await supabase
    .from('profiles')
    .update({
      metadata: {
        ...metadata,
        notification_preferences: preferences,
      },
    })
    .eq('id', user.id)

  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath('/admin/settings/notifications')
  return { ok: true }
}
