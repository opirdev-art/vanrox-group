/** PostgREST / Supabase errors when the table is missing or not yet in the schema cache. */
export function isBusinessSettingsTableUnavailable(error: {
  code?: string | null
  message?: string | null
}): boolean {
  const code = error.code ?? ''
  if (code === '42P01' || code === 'PGRST205' || code === 'PGRST204') {
    return true
  }

  const message = (error.message ?? '').toLowerCase()
  if (!message.includes('business_settings')) return false

  return (
    message.includes('schema cache') ||
    message.includes('does not exist') ||
    message.includes('could not find the table') ||
    message.includes('relation') && message.includes('does not exist')
  )
}
