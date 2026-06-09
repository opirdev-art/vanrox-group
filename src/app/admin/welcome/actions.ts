'use server'

import { redirect } from 'next/navigation'
import { parseSetInvitePasswordForm } from '@/lib/auth/invite-validation'
import { requireAdmin } from '@/lib/auth/require-admin'
import type { SettingsActionResult } from '@/lib/settings/action-result'
import { createAdminClient } from '@/utils/supabase/admin-client'
import { createClient } from '@/utils/supabase/server'

export async function completeInviteSetup(formData: FormData): Promise<SettingsActionResult> {
  const { user } = await requireAdmin()
  const parsed = parseSetInvitePasswordForm(formData)

  if (parsed.ok === false) {
    return { ok: false, error: parsed.error }
  }

  const supabase = await createClient()
  const { error: passwordError } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
  })

  if (passwordError) {
    return { ok: false, error: passwordError.message }
  }

  const adminClient = createAdminClient()
  const role =
    typeof user.app_metadata?.role === 'string' ? user.app_metadata.role : 'staff'
  const fullName =
    (typeof user.app_metadata?.full_name === 'string' && user.app_metadata.full_name) ||
    (typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name) ||
    'Staff Member'

  const { error: metadataError } = await adminClient.auth.admin.updateUserById(user.id, {
    app_metadata: {
      role,
      full_name: fullName,
      invite_pending: false,
    },
  })

  if (metadataError) {
    return { ok: false, error: metadataError.message }
  }

  redirect('/admin')
}
