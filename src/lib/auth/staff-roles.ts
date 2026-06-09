export const STAFF_ROLES = ['super_admin', 'admin', 'staff'] as const

export type StaffRole = (typeof STAFF_ROLES)[number]

export const STAFF_ROLE_OPTIONS: { value: StaffRole; label: string }[] = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'staff', label: 'Staff' },
]

export function isStaffRole(value: string): value is StaffRole {
  return (STAFF_ROLES as readonly string[]).includes(value)
}

export function formatStaffRoleLabel(role: string): string {
  const match = STAFF_ROLE_OPTIONS.find((option) => option.value === role)
  if (match) return match.label
  return role.replace(/_/g, ' ')
}
