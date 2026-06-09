'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import type { SettingsActionResult } from '@/lib/settings/action-result'
import { notify } from '@/lib/notifications'
import { logNotifyFailure } from '@/lib/notifications/log-notify-failure'
import { parseChangePasswordForm } from '@/lib/settings/security-validation'
import { createAdminClient } from '@/utils/supabase/admin-client'
import { createClient } from '@/utils/supabase/server'

export async function changePassword(formData: FormData): Promise<SettingsActionResult> {
  const { user } = await requireAdmin()

  const parsed = parseChangePasswordForm(formData)
  if (parsed.ok === false) return { ok: false, error: parsed.error }

  const email = user.email
  if (!email) {
    return { ok: false, error: 'Your account does not have an email address' }
  }

  const supabase = await createClient()

  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.currentPassword,
  })

  if (reauthError) {
    return { ok: false, error: 'Current password is incorrect' }
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
  })

  if (updateError) {
    return { ok: false, error: updateError.message }
  }

  const notifyResult = await notify({
    eventId: crypto.randomUUID(),
    eventType: 'auth.password.changed',
    occurredAt: new Date().toISOString(),
    actorId: user.id,
    aggregateId: user.id,
    source: 'server_action',
    sourceEventKey: `password-changed:${user.id}:${Date.now()}`,
    payload: {
      userId: user.id,
    },
  })

  logNotifyFailure('auth.password.changed trigger failed', notifyResult, { userId: user.id })

  revalidatePath('/admin/settings/security')
  return { ok: true }
}

export async function revokeOtherSessions(): Promise<SettingsActionResult> {
  const { user } = await requireAdmin()

  const adminClient = createAdminClient()
  const { error } = await adminClient.auth.admin.signOut(user.id, 'others')

  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath('/admin/settings/security')
  return { ok: true }
}
