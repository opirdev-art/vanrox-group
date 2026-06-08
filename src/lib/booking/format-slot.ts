const TOBAGO_TZ = 'America/Port_of_Spain'

const timeFormatter = new Intl.DateTimeFormat('en-TT', {
  timeZone: TOBAGO_TZ,
  hour: 'numeric',
  minute: '2-digit',
})

export function formatSlotTime(iso: string): string {
  return timeFormatter.format(new Date(iso))
}
