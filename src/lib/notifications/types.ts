import type { NotificationChannel } from './channels/types'

export type DeliveryStatus = 'queued' | 'processing' | 'sent' | 'failed' | 'skipped'

export type DeliverySummary = {
  channel: NotificationChannel
  recipientKey: string
  status: DeliveryStatus
}

export type NotifyResult =
  | {
      ok: true
      eventId: string
      deduplicated: boolean
      deliveries: DeliverySummary[]
    }
  | {
      ok: false
      eventId?: string
      error: string
    }
