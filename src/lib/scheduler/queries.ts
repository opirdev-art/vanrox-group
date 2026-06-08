import { createClient } from '@/utils/supabase/server'

export type AppointmentRow = {
  id: string
  title: string
  description: string | null
  start_time: string
  end_time: string
  status: string | null
  is_blockout: boolean | null
  lead_id: string | null
  lead: {
    id: string
    site_location: string | null
    customers: { full_name: string } | null
    services: { name: string } | null
  } | null
}

export async function getUpcomingAppointments(limit = 10): Promise<AppointmentRow[]> {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('appointments')
    .select(
      `
      id,
      title,
      description,
      start_time,
      end_time,
      status,
      is_blockout,
      lead_id,
      leads (
        id,
        site_location,
        customers ( full_name ),
        services ( name )
      )
    `
    )
    .is('deleted_at', null)
    .gte('start_time', now)
    .order('start_time', { ascending: true })
    .limit(limit)

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) => mapAppointmentRow(row))
}

export async function getAppointmentsForMonth(year: number, month: number): Promise<AppointmentRow[]> {
  const supabase = await createClient()

  const start = new Date(Date.UTC(year, month - 1, 1)).toISOString()
  const end = new Date(Date.UTC(year, month, 1)).toISOString()

  const { data, error } = await supabase
    .from('appointments')
    .select(
      `
      id,
      title,
      description,
      start_time,
      end_time,
      status,
      is_blockout,
      lead_id,
      leads (
        id,
        site_location,
        customers ( full_name ),
        services ( name )
      )
    `
    )
    .is('deleted_at', null)
    .gte('start_time', start)
    .lt('start_time', end)
    .order('start_time', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) => mapAppointmentRow(row))
}

export async function getUpcomingAppointmentsCount(): Promise<number> {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const { count, error } = await supabase
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .is('deleted_at', null)
    .eq('is_blockout', false)
    .gte('start_time', now)
    .not('status', 'eq', 'cancelled')

  if (error) return 0
  return count ?? 0
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapAppointmentRow(row: any): AppointmentRow {
  const leadRaw = Array.isArray(row.leads) ? row.leads[0] : row.leads
  const customerRaw = leadRaw?.customers
  const serviceRaw = leadRaw?.services

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    start_time: row.start_time,
    end_time: row.end_time,
    status: row.status,
    is_blockout: row.is_blockout,
    lead_id: row.lead_id,
    lead: leadRaw
      ? {
          id: leadRaw.id,
          site_location: leadRaw.site_location,
          customers: Array.isArray(customerRaw) ? customerRaw[0] ?? null : customerRaw ?? null,
          services: Array.isArray(serviceRaw) ? serviceRaw[0] ?? null : serviceRaw ?? null,
        }
      : null,
  }
}
