import {
  NOTIFICATION_PREFERENCE_ROWS,
  resolveNotificationPreferences,
  type NotificationChannelPrefs,
} from '@/lib/settings/notification-preferences'
import type { DomainEventType } from './events'
import type { NotificationChannel } from './channels/types'
import type { EventRouting } from './routing'

export type RecipientPreferenceContext = {
  profileId: string
  role: string
  metadata: Record<string, unknown> | null
}

function readStoredPreferences(
  metadata: Record<string, unknown> | null
): Record<string, NotificationChannelPrefs> | null {
  const prefs = metadata?.notification_preferences
  if (!prefs || typeof prefs !== 'object' || Array.isArray(prefs)) return null
  return prefs as Record<string, NotificationChannelPrefs>
}

export function isChannelEnabledForRecipient(
  eventType: DomainEventType,
  channel: NotificationChannel,
  recipient: RecipientPreferenceContext,
  routing: EventRouting
): boolean {
  if (routing.auditOnly) return false

  if (channel === 'email' && routing.emailRequired) {
    return true
  }

  const isSuperAdmin = recipient.role === 'super_admin'
  const resolved = resolveNotificationPreferences(readStoredPreferences(recipient.metadata), isSuperAdmin)
  const prefs = resolved[eventType]

  if (!prefs) {
    const row = NOTIFICATION_PREFERENCE_ROWS.find((entry) => entry.eventType === eventType)
    if (!row) return channel === 'in_app'
    return row.defaults[channel]
  }

  return prefs[channel]
}
