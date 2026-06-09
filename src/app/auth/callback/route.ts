import { type EmailOtpType } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import {
  establishSessionFromCredentials,
  finalizeAuthenticatedCallback,
  isSessionEstablishmentFailure,
  type AuthCallbackCredentials,
} from '@/lib/auth/auth-callback'
import { notify } from '@/lib/notifications'
import { logNotifyFailure } from '@/lib/notifications/log-notify-failure'
import { createClient } from '@/utils/supabase/server'

function parseCredentials(searchParams: URLSearchParams): AuthCallbackCredentials | null {
  const code = searchParams.get('code')
  if (code) {
    return { kind: 'code', code }
  }

  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  if (tokenHash && type) {
    return { kind: 'token_hash', tokenHash, type: type as EmailOtpType }
  }

  return null
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const next = searchParams.get('next') ?? '/admin'
  const credentials = parseCredentials(searchParams)

  if (!credentials) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
  }

  const supabase = await createClient()
  const sessionResult = await establishSessionFromCredentials(supabase, credentials)

  if (isSessionEstablishmentFailure(sessionResult)) {
    const sessionKey =
      credentials.kind === 'code' ? credentials.code : `${credentials.type}:${credentials.tokenHash}`

    const callbackFailed = await notify({
      eventId: crypto.randomUUID(),
      eventType: 'auth.callback.failed',
      occurredAt: new Date().toISOString(),
      actorId: null,
      aggregateId: sessionKey,
      source: 'auth_callback',
      sourceEventKey: `callback-failed:${sessionKey}`,
      payload: {
        sessionKey,
        reason: sessionResult.reason,
      },
    })

    logNotifyFailure('auth.callback.failed trigger failed', callbackFailed)

    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
  }

  const sessionKey =
    credentials.kind === 'code' ? credentials.code : `${credentials.type}:${credentials.tokenHash}`

  const { isNewProfile } = await finalizeAuthenticatedCallback(supabase, user, { sessionKey })

  const invitePending = user.app_metadata?.invite_pending === true
  const destination =
    isNewProfile || invitePending ? `${origin}/admin/welcome` : `${origin}${next}`

  return NextResponse.redirect(destination)
}
