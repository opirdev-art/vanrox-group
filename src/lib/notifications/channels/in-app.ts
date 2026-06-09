import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { buildDeliveryIdempotencyKey } from '../idempotency'
import type { ChannelDispatchInput, ChannelDispatchResult, NotificationChannelAdapter } from './types'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isRealProfileId(profileId: string): boolean {
  return UUID_RE.test(profileId)
}

export class InAppNotificationChannel implements NotificationChannelAdapter {
  readonly channel = 'in_app' as const

  constructor(private readonly client: SupabaseClient) {}

  async dispatch(input: ChannelDispatchInput): Promise<ChannelDispatchResult> {
    const { event, recipient, inApp } = input

    if (!inApp) {
      return { ok: false, status: 'failed', error: 'Missing in-app template payload' }
    }

    if (!isRealProfileId(recipient.profileId)) {
      return { ok: true, status: 'skipped' }
    }

    const idempotencyKey = buildDeliveryIdempotencyKey(event.eventId, 'in_app', recipient.profileId)

    const { error: deliveryError } = await this.client.from('notification_deliveries').insert({
      event_id: event.eventId,
      channel: 'in_app',
      recipient_key: recipient.profileId,
      idempotency_key: idempotencyKey,
      status: 'sent',
      sent_at: new Date().toISOString(),
    })

    if (deliveryError) {
      if (deliveryError.code === '23505') {
        return { ok: true, status: 'skipped' }
      }
      return { ok: false, status: 'failed', error: deliveryError.message, retryable: true }
    }

    const { error: notificationError } = await this.client.from('admin_notifications').insert({
      event_id: event.eventId,
      recipient_profile_id: recipient.profileId,
      type: inApp.type,
      title: inApp.title,
      body: inApp.body,
      href: inApp.href,
      metadata: inApp.metadata,
    })

    if (notificationError) {
      if (notificationError.code === '23505') {
        return { ok: true, status: 'skipped' }
      }
      return { ok: false, status: 'failed', error: notificationError.message, retryable: true }
    }

    return { ok: true, status: 'sent' }
  }
}
