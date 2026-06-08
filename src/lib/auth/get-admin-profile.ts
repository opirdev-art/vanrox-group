import { createClient } from '@/utils/supabase/server'
import { isAdminRole } from './messages'

export type AdminProfile = {
  id: string
  full_name: string
  role: string
}

export async function getAdminProfileForUser(userId: string): Promise<AdminProfile | null> {
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', userId)
    .is('deleted_at', null)
    .single()

  if (error || !profile || !isAdminRole(profile.role)) {
    return null
  }

  return profile
}
