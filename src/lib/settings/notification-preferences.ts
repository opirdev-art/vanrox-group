export type NotificationChannelPrefs = {
  in_app: boolean
  email: boolean
}

export type NotificationPreferenceRow = {
  eventType: string
  label: string
  group: 'business' | 'content' | 'security'
  defaults: NotificationChannelPrefs
  locked?: boolean
  superAdminOnly?: boolean
}

export const NOTIFICATION_PREFERENCE_ROWS: NotificationPreferenceRow[] = [
  {
    eventType: 'business.booking.created',
    label: 'New Booking',
    group: 'business',
    defaults: { in_app: true, email: true },
  },
  {
    eventType: 'business.lead.status_changed',
    label: 'Lead Status Changed',
    group: 'business',
    defaults: { in_app: true, email: false },
  },
  {
    eventType: 'business.appointment.confirmed',
    label: 'Appointment Confirmed',
    group: 'business',
    defaults: { in_app: true, email: true },
  },
  {
    eventType: 'business.appointment.cancelled',
    label: 'Appointment Cancelled',
    group: 'business',
    defaults: { in_app: true, email: true },
  },
  {
    eventType: 'content.blog_post.published',
    label: 'Blog Post Published',
    group: 'content',
    defaults: { in_app: true, email: false },
  },
  {
    eventType: 'content.case_study.published',
    label: 'Case Study Published',
    group: 'content',
    defaults: { in_app: true, email: false },
  },
  {
    eventType: 'auth.login.unauthorized',
    label: 'Unauthorized Login Attempt',
    group: 'security',
    defaults: { in_app: true, email: true },
    superAdminOnly: true,
  },
  {
    eventType: 'auth.staff.invited',
    label: 'Staff Invited',
    group: 'security',
    defaults: { in_app: true, email: true },
    locked: true,
  },
  {
    eventType: 'auth.password.changed',
    label: 'Password Changed',
    group: 'security',
    defaults: { in_app: true, email: true },
    locked: true,
  },
]

const ALLOWED_EVENT_TYPES = new Set(
  NOTIFICATION_PREFERENCE_ROWS.filter((row) => !row.locked).map((row) => row.eventType)
)

export function isAllowedNotificationEventType(eventType: string): boolean {
  return ALLOWED_EVENT_TYPES.has(eventType)
}

export function resolveNotificationPreferences(
  stored: Record<string, NotificationChannelPrefs> | null | undefined,
  isSuperAdmin: boolean
): Record<string, NotificationChannelPrefs> {
  const resolved: Record<string, NotificationChannelPrefs> = {}

  for (const row of NOTIFICATION_PREFERENCE_ROWS) {
    if (row.superAdminOnly && !isSuperAdmin) continue
    resolved[row.eventType] = stored?.[row.eventType] ?? row.defaults
  }

  return resolved
}

export function parseNotificationPreferencesForm(
  formData: FormData,
  isSuperAdmin: boolean
): Record<string, NotificationChannelPrefs> {
  const preferences: Record<string, NotificationChannelPrefs> = {}

  for (const row of NOTIFICATION_PREFERENCE_ROWS) {
    if (row.locked) continue
    if (row.superAdminOnly && !isSuperAdmin) continue
    if (!isAllowedNotificationEventType(row.eventType)) continue

    preferences[row.eventType] = {
      in_app: formData.get(`${row.eventType}:in_app`) === 'on',
      email: formData.get(`${row.eventType}:email`) === 'on',
    }
  }

  return preferences
}
