import { createClient } from '@/utils/supabase/server'

export type ServiceRecord = {
  id: number
  name: string
  slug: string
  description: string | null
  sort_order: number | null
  is_active: boolean | null
  metadata: { icon?: string } | null
}

function parseServiceIcon(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== 'object') return null
  const icon = (metadata as { icon?: unknown }).icon
  return typeof icon === 'string' ? icon : null
}

function mapService(row: {
  id: number
  name: string
  slug: string
  description: string | null
  sort_order: number | null
  is_active: boolean | null
  metadata: unknown
}): ServiceRecord {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    sort_order: row.sort_order,
    is_active: row.is_active,
    metadata: { icon: parseServiceIcon(row.metadata) ?? undefined },
  }
}

export async function getActiveServices(): Promise<ServiceRecord[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('services')
    .select('id, name, slug, description, sort_order, is_active, metadata')
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map(mapService)
}

export async function getAllServicesForAdmin(): Promise<ServiceRecord[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('services')
    .select('id, name, slug, description, sort_order, is_active, metadata')
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map(mapService)
}

export async function getServiceById(id: number): Promise<ServiceRecord | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('services')
    .select('id, name, slug, description, sort_order, is_active, metadata')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error) return null
  return mapService(data)
}
