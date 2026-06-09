import { isBusinessSettingsTableUnavailable } from '@/lib/settings/errors'
import { createClient } from '@/utils/supabase/server'

export type BusinessSettingsRecord = {
  businessName: string
  phone: string
  email: string
  address: string
}

const DEFAULT_BUSINESS_SETTINGS: BusinessSettingsRecord = {
  businessName: 'VANROX Group',
  phone: '2721240',
  email: 'info@vanrox-group.com',
  address: 'Scarborough, Tobago',
}

function readMetadataBusinessName(value: unknown): string | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const businessName = (value as { business_name?: unknown }).business_name
  if (typeof businessName !== 'string') return null
  const trimmed = businessName.trim()
  return trimmed || null
}

export async function getBusinessSettings(): Promise<BusinessSettingsRecord> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('business_settings')
    .select('phone, email, address, metadata')
    .eq('id', 1)
    .maybeSingle()

  if (error) {
    if (isBusinessSettingsTableUnavailable(error)) return DEFAULT_BUSINESS_SETTINGS
    throw new Error(error.message)
  }

  if (!data) return DEFAULT_BUSINESS_SETTINGS

  return {
    businessName: readMetadataBusinessName(data.metadata) ?? DEFAULT_BUSINESS_SETTINGS.businessName,
    phone: data.phone ?? '',
    email: data.email ?? '',
    address: data.address ?? '',
  }
}
