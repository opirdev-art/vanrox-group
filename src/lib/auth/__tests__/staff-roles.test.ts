import { describe, expect, it } from 'vitest'
import { formatStaffRoleLabel, isStaffRole, STAFF_ROLES } from '../staff-roles'

describe('staff roles', () => {
  it('includes super_admin in available roles', () => {
    expect(STAFF_ROLES).toContain('super_admin')
  })

  it('validates staff roles', () => {
    expect(isStaffRole('super_admin')).toBe(true)
    expect(isStaffRole('admin')).toBe(true)
    expect(isStaffRole('staff')).toBe(true)
    expect(isStaffRole('owner')).toBe(false)
  })

  it('formats role labels', () => {
    expect(formatStaffRoleLabel('super_admin')).toBe('Super Admin')
  })
})
