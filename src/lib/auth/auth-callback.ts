import 'server-only'
import type { EmailOtpType, User } from '@supabase/supabase-js'
import { notify } from '@/lib/notifications'
import { logNotifyFailure } from '@/lib/notifications/log-notify-failure'
import type { createClient } from '@/utils/supabase/server'

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

export type AuthCallbackCredentials =
  | { kind: 'code'; code: string }
  | { kind: 'token_hash'; tokenHash: string; type: EmailOtpType }

export type SessionEstablishmentResult = { ok: true } | { ok: false; reason: string }

export function isSessionEstablishmentFailure(
  result: SessionEstablishmentResult
): result is Extract<SessionEstablishmentResult, { ok: false }> {
  return result.ok === false
}

export async function establishSessionFromCredentials(
  supabase: SupabaseServerClient,
  credentials: AuthCallbackCredentials
): Promise<SessionEstablishmentResult> {
  if (credentials.kind === 'code') {
    const { error } = await supabase.auth.exchangeCodeForSession(credentials.code)
    if (error) {
      return { ok: false, reason: error.message }
    }
    return { ok: true }
  }

  const { error } = await supabase.auth.verifyOtp({
    token_hash: credentials.tokenHash,
    type: credentials.type,
  })

  if (error) {
    return { ok: false, reason: error.message }
  }

  return { ok: true }
}

export async function finalizeAuthenticatedCallback(
  supabase: SupabaseServerClient,
  user: User,
  options: { sessionKey: string }
): Promise<{ isNewProfile: boolean }> {
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  const role = typeof user.app_metadata?.role === 'string' ? user.app_metadata.role : 'staff'
  const fullName =
    (typeof user.app_metadata?.full_name === 'string' && user.app_metadata.full_name) ||
    (typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name) ||
    (typeof user.user_metadata?.name === 'string' && user.user_metadata.name) ||
    'Staff Member'

  await supabase.from('profiles').upsert(
    {
      id: user.id,
      full_name: fullName,
      role,
    },
    { onConflict: 'id' }
  )

  const isNewProfile = !existingProfile

  const callbackSucceeded = await notify({
    eventId: crypto.randomUUID(),
    eventType: 'auth.callback.succeeded',
    occurredAt: new Date().toISOString(),
    actorId: user.id,
    aggregateId: user.id,
    source: 'auth_callback',
    sourceEventKey: `callback:${options.sessionKey}`,
    payload: {
      userId: user.id,
    },
  })

  logNotifyFailure('auth.callback.succeeded trigger failed', callbackSucceeded, { userId: user.id })

  if (isNewProfile) {
    const inviteAccepted = await notify({
      eventId: crypto.randomUUID(),
      eventType: 'auth.staff.invite_accepted',
      occurredAt: new Date().toISOString(),
      actorId: user.id,
      aggregateId: user.id,
      source: 'auth_callback',
      sourceEventKey: `invite-accepted:${user.id}`,
      payload: {
        userId: user.id,
        fullName,
      },
    })

    logNotifyFailure('auth.staff.invite_accepted trigger failed', inviteAccepted, {
      userId: user.id,
    })
  }

  return { isNewProfile }
}
