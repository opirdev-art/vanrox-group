import { createClient } from '@/utils/supabase/server'
import { getAdminProfileForUser } from './get-admin-profile'

export async function requireAdminApi() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const profile = await getAdminProfileForUser(user.id)
  if (!profile) return null

  return { user, profile, supabase }
}
