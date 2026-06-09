import { createClient } from '@/utils/supabase/server'

export type AuditLogRow = {
  id: number
  action: string
  table_name: string
  record_id: string | null
  created_at: string
  user_name: string | null
}

export async function getAuditLogs(
  page: number,
  limit: number
): Promise<{ rows: AuditLogRow[]; total: number }> {
  const supabase = await createClient()
  const safePage = Math.max(1, page)
  const safeLimit = Math.min(Math.max(1, limit), 50)
  const from = (safePage - 1) * safeLimit
  const to = from + safeLimit - 1

  const { data, error, count } = await supabase
    .from('audit_logs')
    .select('id, action, table_name, record_id, created_at, user_id, profiles ( full_name )', {
      count: 'exact',
    })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    throw new Error(error.message)
  }

  const rows: AuditLogRow[] = (data ?? []).map((row) => {
    const profile = row.profiles as { full_name: string } | { full_name: string }[] | null
    const userName = Array.isArray(profile) ? profile[0]?.full_name : profile?.full_name

    return {
      id: row.id,
      action: row.action,
      table_name: row.table_name,
      record_id: row.record_id,
      created_at: row.created_at,
      user_name: userName ?? null,
    }
  })

  return { rows, total: count ?? 0 }
}
