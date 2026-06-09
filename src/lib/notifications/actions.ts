'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import { createClient } from '@/utils/supabase/server'

export type NotificationActionResult = { ok: true } | { ok: false; error: string }

export async function markNotificationRead(notificationId: number): Promise<NotificationActionResult> {
  const { user } = await requireAdmin()
  const supabase = await createClient()
  const now = new Date().toISOString()

  const { error } = await supabase
    .from('admin_notifications')
    .update({ is_read: true, read_at: now })
    .eq('id', notificationId)
    .eq('recipient_profile_id', user.id)

  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/notifications')
  return { ok: true }
}

export async function markAllNotificationsRead(): Promise<NotificationActionResult> {
  const { user } = await requireAdmin()
  const supabase = await createClient()
  const now = new Date().toISOString()

  const { error } = await supabase
    .from('admin_notifications')
    .update({ is_read: true, read_at: now })
    .eq('recipient_profile_id', user.id)
    .eq('is_read', false)

  if (error) {
    return { ok: false, error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/notifications')
  return { ok: true }
}
