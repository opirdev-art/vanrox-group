import { getActiveServices } from '@/lib/services/queries'
import { createClient } from '@/utils/supabase/server'

export type ServiceOption = {
  id: number
  name: string
  slug: string
  description: string | null
}

export type AvailableSlot = {
  slot_start: string
  slot_end: string
}

export async function fetchActiveServicesForBooking(): Promise<ServiceOption[]> {
  const services = await getActiveServices()
  return services.map(({ id, name, slug, description }) => ({ id, name, slug, description }))
}

export { getActiveServices }

export async function fetchAvailableSlotsForDate(date: string): Promise<AvailableSlot[]> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_available_slots', { p_date: date })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}
