import 'server-only'
import { createAdminClient } from '@/utils/supabase/admin-client'

export type StaffInviteRollbackResult =
  | { ok: true; rolledBack: boolean }
  | { ok: false; error: string }

export function isStaffInviteRollbackFailure(
  result: StaffInviteRollbackResult
): result is Extract<StaffInviteRollbackResult, { ok: false }> {
  return result.ok === false
}

export async function rollbackPendingStaffInvite(userId: string): Promise<StaffInviteRollbackResult> {
  const adminClient = createAdminClient()
  const { data, error: fetchError } = await adminClient.auth.admin.getUserById(userId)

  if (fetchError || !data.user) {
    return { ok: true, rolledBack: false }
  }

  if (data.user.last_sign_in_at) {
    return {
      ok: false,
      error: 'Invite email failed, but this user has already signed in and was not removed.',
    }
  }

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)
  if (deleteError) {
    return { ok: false, error: deleteError.message }
  }

  return { ok: true, rolledBack: true }
}
