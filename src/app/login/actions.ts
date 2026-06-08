'use server'

import { redirect } from 'next/navigation'
import { getAdminProfileForUser } from '@/lib/auth/get-admin-profile'
import { createClient } from '@/utils/supabase/server'

export type LoginActionResult =
  | { ok: true; redirectTo: string }
  | { ok: false; error: 'unauthorized' | 'invalid_credentials' | 'unknown'; message: string }

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
    await supabase.auth.signOut()
    return {
      ok: false,
      error: 'unauthorized',
      message:
        'This account does not have admin access. Use an authorized staff account or contact your administrator.',
    }
  }

  const redirectTo = nextPath?.startsWith('/admin') ? nextPath : '/admin'
  return { ok: true, redirectTo }
}

export async function signOutFromLogin() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login?signed_out=1')
}
