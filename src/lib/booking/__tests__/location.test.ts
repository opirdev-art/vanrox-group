import { describe, expect, it } from 'vitest'
import {
  formatSiteCoordinates,
  isValidSiteCoordinates,
  SCARBOROUGH_CENTER,
} from '../location'

describe('isValidSiteCoordinates', () => {
  it('accepts coordinates in Tobago', () => {
    expect(isValidSiteCoordinates(SCARBOROUGH_CENTER.lat, SCARBOROUGH_CENTER.lng)).toBe(true)
  })

  it('rejects coordinates outside Trinidad & Tobago', () => {
    expect(isValidSiteCoordinates(40.7128, -74.006)).toBe(false)
  })

  it('rejects invalid numbers', () => {
    expect(isValidSiteCoordinates(Number.NaN, -60.7)).toBe(false)
  })
})

describe('formatSiteCoordinates', () => {
  it('formats lat/lng to six decimal places', () => {
    expect(formatSiteCoordinates(11.183333, -60.735333)).toBe('11.183333, -60.735333')
  })
})
