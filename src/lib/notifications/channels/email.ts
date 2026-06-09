import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { buildDeliveryIdempotencyKey } from '../idempotency'
import type { ChannelDispatchInput, ChannelDispatchResult, NotificationChannelAdapter } from './types'

function resolveRecipientEmail(input: ChannelDispatchInput): string | null {
  if (input.recipient.email) return input.recipient.email
  return null
}

export class EmailNotificationChannel implements NotificationChannelAdapter {
  readonly channel = 'email' as const

  constructor(private readonly client: SupabaseClient) {}

  async dispatch(input: ChannelDispatchInput): Promise<ChannelDispatchResult> {
    const { event, recipient } = input
    const email = resolveRecipientEmail(input)

    if (!email) {
      return { ok: true, status: 'skipped' }
    }

    const recipientKey = recipient.profileId.includes(':') ? email : recipient.profileId
    const idempotencyKey = buildDeliveryIdempotencyKey(event.eventId, 'email', recipientKey)

    const { error } = await this.client.from('notification_deliveries').insert({
      event_id: event.eventId,
      channel: 'email',
      recipient_key: recipientKey,
      idempotency_key: idempotencyKey,
      status: 'queued',
      next_retry_at: new Date().toISOString(),
    })

    if (error) {
      if (error.code === '23505') {
        return { ok: true, status: 'skipped' }
      }
      return { ok: false, status: 'failed', error: error.message, retryable: true }
    }

    return { ok: true, status: 'queued' }
  }
}
