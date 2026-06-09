import { redirect } from 'next/navigation'
import { requireAdmin } from './require-admin'

export async function requireSuperAdmin() {
  const { user, profile } = await requireAdmin()

  if (profile.role !== 'super_admin') {
    redirect('/admin/settings/general?error=super_admin_required')
  }

  return { user, profile }
}
