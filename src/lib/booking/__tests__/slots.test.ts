import { describe, expect, it } from 'vitest'
import { buildSlotsForDay, type BusyRange, type WeeklyHours } from '../slots'

const defaultHours: WeeklyHours = {
  mon: { open: '08:00', close: '17:00' },
  tue: { open: '08:00', close: '17:00' },
  wed: { open: '08:00', close: '17:00' },
  thu: { open: '08:00', close: '17:00' },
  fri: { open: '08:00', close: '17:00' },
  sat: null,
  sun: null,
}

describe('buildSlotsForDay', () => {
  it('returns nine 60-minute slots for Monday 08:00–17:00', () => {
    const slots = buildSlotsForDay('2026-06-08', defaultHours, 60, [])

    expect(slots).toHaveLength(9)
    expect(slots[0].start.toISOString()).toBe('2026-06-08T12:00:00.000Z')
    expect(slots[8].end.toISOString()).toBe('2026-06-08T21:00:00.000Z')
  })

  it('returns empty array for Sunday when weekly_hours.sun is null', () => {
    const slots = buildSlotsForDay('2026-06-07', defaultHours, 60, [])

    expect(slots).toHaveLength(0)
  })

  it('removes a slot that overlaps a busy range', () => {
    const busy: BusyRange[] = [
      {
        start: new Date('2026-06-08T13:00:00.000Z'),
        end: new Date('2026-06-08T14:00:00.000Z'),
      },
    ]

    const slots = buildSlotsForDay('2026-06-08', defaultHours, 60, busy)

    expect(slots).toHaveLength(8)
    expect(slots.some((slot) => slot.start.toISOString() === '2026-06-08T13:00:00.000Z')).toBe(
      false
    )
  })

  it('removes a slot fully inside a blockout range', () => {
    const busy: BusyRange[] = [
      {
        start: new Date('2026-06-08T11:00:00.000Z'),
        end: new Date('2026-06-08T22:00:00.000Z'),
      },
    ]

    const slots = buildSlotsForDay('2026-06-08', defaultHours, 60, busy)

    expect(slots).toHaveLength(0)
  })
})
