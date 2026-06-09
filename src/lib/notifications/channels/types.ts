import type { DomainEvent } from '../events'
import type { ResolvedRecipient } from '../recipient-resolver'
import type { InAppTemplatePayload } from '../templates/render'
import type { EmailMessage } from '../providers/email/types'

export const NOTIFICATION_CHANNELS = ['in_app', 'email'] as const

export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number]

export type ChannelDispatchInput = {
  event: DomainEvent
  recipient: ResolvedRecipient
  inApp?: InAppTemplatePayload
  email?: EmailMessage
}

export type ChannelDispatchResult =
  | { ok: true; status: 'sent' | 'queued' | 'skipped'; provider?: string; providerMessageId?: string }
  | { ok: false; status: 'failed'; error: string; retryable?: boolean }

export interface NotificationChannelAdapter {
  readonly channel: NotificationChannel
  dispatch(input: ChannelDispatchInput): Promise<ChannelDispatchResult>
}
