import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getAdminProfileForUser } from './get-admin-profile'

export async function requireAdmin() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?error=session_required&next=/admin')
  }

  const profile = await getAdminProfileForUser(user.id)

  if (!profile) {
    await supabase.auth.signOut()
    redirect('/login?error=unauthorized')
  }

  return { user, profile }
}
