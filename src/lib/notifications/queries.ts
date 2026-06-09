import { createClient } from '@/utils/supabase/server'

export type AdminNotificationRow = {
  id: number
  event_id: string
  type: string
  title: string
  body: string | null
  href: string | null
  metadata: Record<string, unknown>
  is_read: boolean
  read_at: string | null
  created_at: string
}

let warnedMissingSchema = false

function asMetadata(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

function isMissingNotificationsTable(error: { message?: string; code?: string }): boolean {
  const message = error.message ?? ''
  return (
    error.code === 'PGRST205' ||
    message.includes('admin_notifications') ||
    message.includes('schema cache')
  )
}

function warnMissingSchemaOnce() {
  if (warnedMissingSchema) return
  warnedMissingSchema = true
  console.warn(
    '[notifications] Database tables are missing. Apply migration supabase/migrations/20260608230000_notification_system.sql in the Supabase SQL Editor, or run: SUPABASE_DB_PASSWORD=<password> npx supabase db push'
  )
}

function handleQueryError(error: { message?: string; code?: string }, context: string): boolean {
  if (isMissingNotificationsTable(error)) {
    warnMissingSchemaOnce()
    return true
  }

  console.error(`[notifications] ${context} failed`, error.message)
  return false
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('admin_notifications')
    .select('id', { count: 'exact', head: true })
    .eq('recipient_profile_id', userId)
    .eq('is_read', false)

  if (error) {
    handleQueryError(error, 'unread count')
    return 0
  }

  return count ?? 0
}

export async function getRecentNotifications(
  userId: string,
  limit = 20
): Promise<AdminNotificationRow[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('admin_notifications')
    .select('id, event_id, type, title, body, href, metadata, is_read, read_at, created_at')
    .eq('recipient_profile_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    handleQueryError(error, 'fetch recent')
    return []
  }

  return (data ?? []).map((row) => ({
    ...row,
    metadata: asMetadata(row.metadata),
  }))
}

export async function getNotificationHistory(
  userId: string,
  options?: { limit?: number; offset?: number; unreadOnly?: boolean }
): Promise<AdminNotificationRow[]> {
  const supabase = await createClient()
  const limit = options?.limit ?? 50
  const offset = options?.offset ?? 0

  let query = supabase
    .from('admin_notifications')
    .select('id, event_id, type, title, body, href, metadata, is_read, read_at, created_at')
    .eq('recipient_profile_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (options?.unreadOnly) {
    query = query.eq('is_read', false)
  }

  const { data, error } = await query

  if (error) {
    if (handleQueryError(error, 'fetch history')) {
      return []
    }
    throw new Error(error.message)
  }

  return (data ?? []).map((row) => ({
    ...row,
    metadata: asMetadata(row.metadata),
  }))
}
