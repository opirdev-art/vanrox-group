import type { DomainEventSource } from './events/envelope'
import type { NotificationChannel } from './channels/types'

export function buildDeliveryIdempotencyKey(
  eventId: string,
  channel: NotificationChannel,
  recipientKey: string
): string {
  return `${eventId}:${channel}:${recipientKey}`
}

export function buildSourceDedupeKey(source: DomainEventSource, sourceEventKey: string): string {
  return `${source}:${sourceEventKey}`
}
