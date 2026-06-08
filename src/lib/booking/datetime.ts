function toIsoLikeDatetime(value: string): string {
  let candidate = value.trim()
  if (candidate.includes(' ') && !candidate.includes('T')) {
    candidate = candidate.replace(' ', 'T')
  }

  // Postgres often emits short offsets (+00, -05) that Date.parse rejects.
  candidate = candidate.replace(
    /([+-]\d{2})(?::(\d{2}))?$/,
    (_, hours: string, minutes?: string) => `${hours}:${minutes ?? '00'}`,
  )

  return candidate
}

/** Normalize Postgres / Supabase timestamptz strings to ISO UTC for RPC calls. */
export function normalizeBookingDatetime(value: string): string | null {
  const candidate = toIsoLikeDatetime(value)
  const ms = Date.parse(candidate)
  if (Number.isNaN(ms)) return null

  return new Date(ms).toISOString()
}
