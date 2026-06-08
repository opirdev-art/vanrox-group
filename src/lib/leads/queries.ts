import { createClient } from '@/utils/supabase/server'
import { parseSiteLocationGeo, type SiteCoordinates } from '@/lib/booking/location'

export type LeadListItem = {
  id: string
  status: string | null
  source: string | null
  site_location: string | null
  site_coordinates: SiteCoordinates | null
  inquiry_details: string | null
  preferred_start_time: string | null
  preferred_end_time: string | null
  created_at: string
  customer: {
    full_name: string
    email: string | null
    phone: string | null
  } | null
  service: {
    name: string
  } | null
  referral_partner: {
    name: string
    referral_code: string
  } | null
}

const LEAD_SELECT = `
  id,
  status,
  source,
  site_location,
  site_location_geo,
  inquiry_details,
  preferred_start_time,
  preferred_end_time,
  created_at,
  customers ( full_name, email, phone ),
  services ( name ),
  referral_partners ( name, referral_code )
`

export async function getLeadsList(statusFilter?: string): Promise<LeadListItem[]> {
  const supabase = await createClient()

  let query = supabase
    .from('leads')
    .select(LEAD_SELECT)
    .order('created_at', { ascending: false })

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }

  const { data, error } = await query

  if (error) {
    if (error.message.includes('preferred_start_time')) {
      return getLeadsListFallback(statusFilter)
    }
    throw new Error(error.message)
  }

  return normalizeLeadRows(data ?? [])
}

async function getLeadsListFallback(statusFilter?: string): Promise<LeadListItem[]> {
  const supabase = await createClient()

  const fallbackSelect = `
    id,
    status,
    source,
    site_location,
    inquiry_details,
    created_at,
    customers ( full_name, email, phone ),
    services ( name ),
    referral_partners ( name, referral_code )
  `

  let query = supabase
    .from('leads')
    .select(fallbackSelect)
    .order('created_at', { ascending: false })

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return normalizeLeadRows(data ?? []).map((lead) => ({
    ...lead,
    preferred_start_time: null,
    preferred_end_time: null,
  }))
}

export async function getLeadById(id: string): Promise<LeadListItem | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('leads')
    .select(LEAD_SELECT)
    .eq('id', id)
    .single()

  if (error) {
    if (error.message.includes('preferred_start_time')) {
      const leads = await getLeadsListFallback()
      return leads.find((lead) => lead.id === id) ?? null
    }
    return null
  }

  const [lead] = normalizeLeadRows([data])
  return lead ?? null
}

export async function getNewLeadsCount(days = 7): Promise<number> {
  const supabase = await createClient()
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { count, error } = await supabase
    .from('leads')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'new')
    .gte('created_at', since.toISOString())

  if (error) return 0
  return count ?? 0
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeLeadRows(rows: any[]): LeadListItem[] {
  return rows.map((row) => ({
    id: row.id,
    status: row.status,
    source: row.source,
    site_location: row.site_location,
    site_coordinates: parseSiteLocationGeo(row.site_location_geo),
    inquiry_details: row.inquiry_details,
    preferred_start_time: row.preferred_start_time ?? null,
    preferred_end_time: row.preferred_end_time ?? null,
    created_at: row.created_at,
    customer: row.customers ?? null,
    service: row.services ?? null,
    referral_partner: row.referral_partners ?? null,
  }))
}
