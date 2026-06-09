import { createClient } from '@/utils/supabase/server'

export type StaffMember = {
  id: string
  full_name: string
  role: string
  created_at: string
}

export async function getAllStaffProfiles(excludeUserId?: string): Promise<StaffMember[]> {
  const supabase = await createClient()

  let query = supabase
    .from('profiles')
    .select('id, full_name, role, created_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (excludeUserId) {
    query = query.neq('id', excludeUserId)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}
