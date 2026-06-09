'use server'

import { createHash } from 'crypto'
import { redirect } from 'next/navigation'
import { getAdminProfileForUser } from '@/lib/auth/get-admin-profile'
import { notify } from '@/lib/notifications'
import { logNotifyFailure } from '@/lib/notifications/log-notify-failure'
import { createClient } from '@/utils/supabase/server'

export type LoginActionResult =
  | { ok: true; redirectTo: string }
  | { ok: false; error: 'unauthorized' | 'invalid_credentials' | 'unknown'; message: string }

function hashEmail(email: string): string {
  return createHash('sha256').update(email.trim().toLowerCase()).digest('hex')
}

function maskEmail(email: string): string {
  const [local = '', domain = ''] = email.trim().toLowerCase().split('@')
  if (!local || !domain) return 'redacted'
  const localMasked = local.length <= 1 ? '*' : `${local[0]}***`
  return `${localMasked}@${domain}`
}

export async function signInAndVerifyAdmin(
  email: string,
  password: string,
  nextPath?: string
): Promise<LoginActionResult> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  })

  if (error) {
    const aggregateId = hashEmail(email)
    const notifyResult = await notify({
      eventId: crypto.randomUUID(),
      eventType: 'auth.login.failed',
      occurredAt: new Date().toISOString(),
      actorId: null,
      aggregateId,
      source: 'server_action',
      payload: {
        emailHash: aggregateId,
        reason: error.message,
      },
    })

    logNotifyFailure('auth.login.failed trigger failed', notifyResult, { aggregateId })

    return {
      ok: false,
      error: 'invalid_credentials',
      message: error.message,
    }
  }

  if (!data.user) {
    return {
      ok: false,
      error: 'unknown',
      message: 'Sign in failed. Please try again.',
    }
  }

  const profile = await getAdminProfileForUser(data.user.id)

  if (!profile) {
    const notifyResult = await notify({
      eventId: crypto.randomUUID(),
      eventType: 'auth.login.unauthorized',
      occurredAt: new Date().toISOString(),
      actorId: data.user.id,
      aggregateId: data.user.id,
      source: 'server_action',
      payload: {
        userId: data.user.id,
        emailMasked: data.user.email ? maskEmail(data.user.email) : undefined,
      },
    })

    logNotifyFailure('auth.login.unauthorized trigger failed', notifyResult, {
      userId: data.user.id,
    })

    await supabase.auth.signOut()
    return {
      ok: false,
      error: 'unauthorized',
      message:
        'This account does not have admin access. Use an authorized staff account or contact your administrator.',
    }
  }

  const redirectTo = nextPath?.startsWith('/admin') ? nextPath : '/admin'

  const notifyResult = await notify({
    eventId: crypto.randomUUID(),
    eventType: 'auth.login.succeeded',
    occurredAt: new Date().toISOString(),
    actorId: data.user.id,
    aggregateId: data.user.id,
    source: 'server_action',
    payload: {
      userId: data.user.id,
      emailMasked: data.user.email ? maskEmail(data.user.email) : undefined,
    },
  })

  logNotifyFailure('auth.login.succeeded trigger failed', notifyResult, { userId: data.user.id })

  return { ok: true, redirectTo }
}

export async function signOutFromLogin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  await supabase.auth.signOut()

  if (user) {
    const notifyResult = await notify({
      eventId: crypto.randomUUID(),
      eventType: 'auth.logout',
      occurredAt: new Date().toISOString(),
      actorId: user.id,
      aggregateId: user.id,
      source: 'server_action',
      payload: {
        userId: user.id,
      },
    })

    logNotifyFailure('auth.logout trigger failed', notifyResult, { userId: user.id })
  }

  redirect('/login?signed_out=1')
}
