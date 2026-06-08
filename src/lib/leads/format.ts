const TOBAGO_TZ = 'America/Port_of_Spain'

const dateFormatter = new Intl.DateTimeFormat('en-TT', {
  timeZone: TOBAGO_TZ,
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const timeFormatter = new Intl.DateTimeFormat('en-TT', {
  timeZone: TOBAGO_TZ,
  hour: 'numeric',
  minute: '2-digit',
})

export function formatLeadDate(iso: string): string {
  return dateFormatter.format(new Date(iso))
}

export function formatPreferredSlot(
  start: string | null | undefined,
  end: string | null | undefined
): string {
  if (!start || !end) return '—'

  const startDate = new Date(start)
  const endDate = new Date(end)

  return `${dateFormatter.format(startDate)} · ${timeFormatter.format(startDate)} – ${timeFormatter.format(endDate)}`
}
