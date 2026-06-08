export type DayHours = { open: string; close: string } | null

export type WeeklyHours = {
  mon: DayHours
  tue: DayHours
  wed: DayHours
  thu: DayHours
  fri: DayHours
  sat: DayHours
  sun: DayHours
}

export type BusyRange = { start: Date; end: Date }

export type Slot = { start: Date; end: Date }

const DAY_KEYS: (keyof WeeklyHours)[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

/** Tobago (AST) is UTC-4 year-round — no DST. */
function localTimeToUtc(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  const [hour, minute] = timeStr.split(':').map(Number)
  return new Date(Date.UTC(year, month - 1, day, hour + 4, minute))
}

function getWeekdayKey(dateStr: string): keyof WeeklyHours {
  const [year, month, day] = dateStr.split('-').map(Number)
  const weekday = new Date(Date.UTC(year, month - 1, day, 12, 0)).getUTCDay()
  return DAY_KEYS[weekday]
}

function parseMinutes(timeStr: string): number {
  const [hour, minute] = timeStr.split(':').map(Number)
  return hour * 60 + minute
}

function rangesOverlap(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
  return startA < endB && endA > startB
}

export function buildSlotsForDay(
  dateStr: string,
  weeklyHours: WeeklyHours,
  slotDurationMinutes: number,
  busyRanges: BusyRange[]
): Slot[] {
  const dayHours = weeklyHours[getWeekdayKey(dateStr)]
  if (!dayHours) return []

  const openMinutes = parseMinutes(dayHours.open)
  const closeMinutes = parseMinutes(dayHours.close)
  const slots: Slot[] = []

  for (let minute = openMinutes; minute + slotDurationMinutes <= closeMinutes; minute += slotDurationMinutes) {
    const startHour = Math.floor(minute / 60)
    const startMinute = minute % 60
    const endMinuteTotal = minute + slotDurationMinutes
    const endHour = Math.floor(endMinuteTotal / 60)
    const endMinute = endMinuteTotal % 60

    const start = localTimeToUtc(
      dateStr,
      `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`
    )
    const end = localTimeToUtc(
      dateStr,
      `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`
    )

    const isBusy = busyRanges.some((range) => rangesOverlap(start, end, range.start, range.end))
    if (!isBusy) {
      slots.push({ start, end })
    }
  }

  return slots
}
