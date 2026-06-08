import { describe, expect, it } from 'vitest'
import { getStatusBadgeClass, isValidLeadStatus, LEAD_STATUSES } from '../status'

describe('isValidLeadStatus', () => {
  it('accepts all defined lead statuses', () => {
    for (const status of LEAD_STATUSES) {
      expect(isValidLeadStatus(status)).toBe(true)
    }
  })

  it('rejects unknown status', () => {
    expect(isValidLeadStatus('confirmed')).toBe(false)
    expect(isValidLeadStatus('')).toBe(false)
  })
})

describe('getStatusBadgeClass', () => {
  it('returns blue styling for new leads', () => {
    expect(getStatusBadgeClass('new')).toContain('blue')
  })

  it('returns green styling for converted leads', () => {
    expect(getStatusBadgeClass('converted')).toContain('green')
  })
})
