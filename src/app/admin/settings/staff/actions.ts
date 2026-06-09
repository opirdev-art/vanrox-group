'use server'

import { revalidatePath } from 'next/cache'
import { requireSuperAdmin } from '@/lib/auth/require-super-admin'
import type { SettingsActionResult } from '@/lib/settings/action-result'
import { isStaffRole } from '@/lib/auth/staff-roles'
import { sendStaffInviteEmail } from '@/lib/auth/staff-invite-email'
import {
  isStaffInviteRollbackFailure,
  rollbackPendingStaffInvite,
} from '@/lib/auth/staff-invite-rollback'
import { buildStaffInviteAcceptUrl, isNewlyCreatedAuthUser } from '@/lib/auth/staff-invite-utils'
import { notify } from '@/lib/notifications'
import { logNotifyFailure } from '@/lib/notifications/log-notify-failure'
import { isProviderSendFailure } from '@/lib/notifications/provider-send-result'
import { getAppOrigin } from '@/lib/settings/app-url'
import { createAdminClient } from '@/utils/supabase/admin-client'
import { createClient } from '@/utils/supabase/server'

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function inviteStaffMember(formData: FormData): Promise<SettingsActionResult> {
  const { user: actor } = await requireSuperAdmin()

  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const fullName = String(formData.get('full_name') ?? '').trim()
  const role = String(formData.get('role') ?? '')

  if (!email || !fullName) {
    return { ok: false, error: 'Name and email are required' }
  }

  if (!isValidEmail(email)) {
    return { ok: false, error: 'Please enter a valid email address' }
  }

  if (!isStaffRole(role)) {
    return { ok: false, error: 'Invalid role selected' }
  }

  const adminClient = createAdminClient()
  const inviteStartedAt = Date.now()
  const redirectTo = `${getAppOrigin()}/auth/callback?next=/admin/welcome`

  const { data, error } = await adminClient.auth.admin.generateLink({
    type: 'invite',
    email,
    options: {
      data: { full_name: fullName },
      redirectTo,
    },
  })

  if (error) {
    return { ok: false, error: error.message }
  }

  const invitedUser = data.user
  const hashedToken = data.properties?.hashed_token

  if (!invitedUser || !hashedToken) {
    return { ok: false, error: 'Invite link could not be generated' }
  }

  const isNewUser = isNewlyCreatedAuthUser(invitedUser, inviteStartedAt)
  const acceptUrl = buildStaffInviteAcceptUrl(hashedToken)

  const { error: metadataError } = await adminClient.auth.admin.updateUserById(invitedUser.id, {
    app_metadata: { role, full_name: fullName, invite_pending: true },
  })

  if (metadataError) {
    if (isNewUser) {
      await rollbackPendingStaffInvite(invitedUser.id)
    }
    return { ok: false, error: metadataError.message }
  }

  const inviteEmailResult = await sendStaffInviteEmail({
    to: email,
    inviteeName: fullName,
    acceptUrl,
  })

  if (isProviderSendFailure(inviteEmailResult)) {
    const emailError = inviteEmailResult.errorMessage

    if (isNewUser) {
      const rollback = await rollbackPendingStaffInvite(invitedUser.id)
      if (isStaffInviteRollbackFailure(rollback)) {
        console.error('[staff-invite] rollback failed after email error', {
          userId: invitedUser.id,
          emailError,
          rollbackError: rollback.error,
        })
        return {
          ok: false,
          error: `Invite email failed and cleanup could not complete. Contact support. (${emailError})`,
        }
      }
    }

    return {
      ok: false,
      error: isNewUser
        ? `Invite email could not be sent. No account was created — please try again. (${emailError})`
        : `Invite email could not be sent. The pending invite was kept — use Resend invite to try again. (${emailError})`,
    }
  }

  const notifyResult = await notify({
    eventId: crypto.randomUUID(),
    eventType: 'auth.staff.invited',
    occurredAt: new Date().toISOString(),
    actorId: actor.id,
    aggregateId: invitedUser.id,
    source: 'server_action',
    sourceEventKey: `staff-invite:${invitedUser.id}`,
    payload: {
      invitedUserId: invitedUser.id,
      inviteeEmail: email,
      inviteeName: fullName,
      role,
    },
  })

  logNotifyFailure('auth.staff.invited trigger failed', notifyResult, {
    invitedUserId: invitedUser.id,
  })

  revalidatePath('/admin/settings/staff')
  return { ok: true }
}

export async function resendStaffInvite(formData: FormData): Promise<SettingsActionResult> {
  await requireSuperAdmin()

  const userId = String(formData.get('user_id') ?? '')
  if (!userId) {
    return { ok: false, error: 'User is required' }
  }

  const adminClient = createAdminClient()
  const { data: authUser, error: fetchError } = await adminClient.auth.admin.getUserById(userId)

  if (fetchError || !authUser.user?.email) {
    return { ok: false, error: 'Invited user not found' }
  }

  if (authUser.user.last_sign_in_at) {
    return { ok: false, error: 'This user has already accepted their invite' }
  }

  const email = authUser.user.email
  const fullName =
    (typeof authUser.user.app_metadata?.full_name === 'string' && authUser.user.app_metadata.full_name) ||
    email
  const redirectTo = `${getAppOrigin()}/auth/callback?next=/admin/welcome`

  const { data, error } = await adminClient.auth.admin.generateLink({
    type: 'invite',
    email,
    options: {
      redirectTo,
    },
  })

  if (error) {
    return { ok: false, error: error.message }
  }

  const hashedToken = data.properties?.hashed_token
  if (!hashedToken) {
    return { ok: false, error: 'Invite link could not be generated' }
  }

  const acceptUrl = buildStaffInviteAcceptUrl(hashedToken)

  const inviteEmailResult = await sendStaffInviteEmail({
    to: email,
    inviteeName: fullName,
    acceptUrl,
  })

  if (isProviderSendFailure(inviteEmailResult)) {
    return {
      ok: false,
      error: `Resend failed: ${inviteEmailResult.errorMessage}`,
    }
  }

  revalidatePath('/admin/settings/staff')
  return { ok: true }
}

export async function changeStaffRole(formData: FormData): Promise<SettingsActionResult> {
  const { user } = await requireSuperAdmin()

  const targetUserId = String(formData.get('user_id') ?? '')
  const newRole = String(formData.get('role') ?? '')

  if (!targetUserId) {
    return { ok: false, error: 'User is required' }
  }

  if (targetUserId === user.id) {
    return { ok: false, error: 'You cannot change your own role' }
  }

  if (!isStaffRole(newRole)) {
    return { ok: false, error: 'Invalid role selected' }
  }

  const supabase = await createClient()

  const { data: existingProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', targetUserId)
    .single()

  if (fetchError || !existingProfile) {
    return { ok: false, error: 'Staff member not found' }
  }

  if (existingProfile.role === 'super_admin' && newRole !== 'super_admin') {
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'super_admin')
      .is('deleted_at', null)

    if (countError) {
      return { ok: false, error: countError.message }
    }

    if ((count ?? 0) <= 1) {
      return { ok: false, error: 'Cannot demote the last super admin' }
    }
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', targetUserId)

  if (profileError) {
    return { ok: false, error: profileError.message }
  }

  const adminClient = createAdminClient()
  const { error: metadataError } = await adminClient.auth.admin.updateUserById(targetUserId, {
    app_metadata: { role: newRole },
  })

  if (metadataError) {
    return { ok: false, error: metadataError.message }
  }

  const notifyResult = await notify({
    eventId: crypto.randomUUID(),
    eventType: 'auth.staff.role_changed',
    occurredAt: new Date().toISOString(),
    actorId: user.id,
    aggregateId: targetUserId,
    source: 'server_action',
    sourceEventKey: `staff-role:${targetUserId}:${newRole}`,
    payload: {
      userId: targetUserId,
      previousRole: existingProfile.role,
      newRole,
    },
  })

  logNotifyFailure('auth.staff.role_changed trigger failed', notifyResult, { targetUserId })

  revalidatePath('/admin/settings/staff')
  return { ok: true }
}

export async function deactivateStaffMember(formData: FormData): Promise<SettingsActionResult> {
  const { user } = await requireSuperAdmin()

  const targetUserId = String(formData.get('user_id') ?? '')

  if (!targetUserId) {
    return { ok: false, error: 'User is required' }
  }

  if (targetUserId === user.id) {
    return { ok: false, error: 'You cannot deactivate your own account' }
  }

  const supabase = await createClient()

  const { data: targetProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', targetUserId)
    .single()

  if (fetchError || !targetProfile) {
    return { ok: false, error: 'Staff member not found' }
  }

  if (targetProfile.role === 'super_admin') {
    return { ok: false, error: 'Super admin accounts cannot be deactivated here' }
  }

  const adminClient = createAdminClient()
  const { error: signOutError } = await adminClient.auth.admin.signOut(targetUserId, 'global')

  if (signOutError) {
    return { ok: false, error: signOutError.message }
  }

  const { error: deactivateError } = await supabase
    .from('profiles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', targetUserId)

  if (deactivateError) {
    return { ok: false, error: deactivateError.message }
  }

  const notifyResult = await notify({
    eventId: crypto.randomUUID(),
    eventType: 'auth.staff.deactivated',
    occurredAt: new Date().toISOString(),
    actorId: user.id,
    aggregateId: targetUserId,
    source: 'server_action',
    sourceEventKey: `staff-deactivate:${targetUserId}`,
    payload: {
      userId: targetUserId,
      fullName: targetProfile.full_name,
    },
  })

  logNotifyFailure('auth.staff.deactivated trigger failed', notifyResult, { targetUserId })

  revalidatePath('/admin/settings/staff')
  return { ok: true }
}
