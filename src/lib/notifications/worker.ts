import 'server-only'
import { createAdminClient } from '@/utils/supabase/admin-client'
import { createEmailProvider } from './providers/email/factory'
import { isProviderSendFailure } from './provider-send-result'
import type { EmailMessage } from './providers/email/types'
import { renderEmailTemplate } from './templates/render'
import { validateDomainEvent, type DomainEvent } from './events'

const WORKER_BATCH_SIZE = 25
const BACKOFF_SECONDS = [30, 120, 600, 1800, 3600]

type QueuedDeliveryRow = {
  id: number
  event_id: string
  recipient_key: string
  attempt_count: number
  max_attempts: number
}

function nextRetryAt(attemptCount: number): string | null {
  const delay = BACKOFF_SECONDS[Math.min(attemptCount, BACKOFF_SECONDS.length - 1)]
  return new Date(Date.now() + delay * 1000).toISOString()
}

function resolveBatchSize(limit?: number): number {
  if (typeof limit === 'number' && Number.isFinite(limit) && limit > 0) {
    return Math.min(Math.floor(limit), 200)
  }

  const configured = Number(process.env.NOTIFICATION_WORKER_BATCH_SIZE ?? WORKER_BATCH_SIZE)
  if (!Number.isFinite(configured) || configured <= 0) {
    return WORKER_BATCH_SIZE
  }

  return Math.min(Math.floor(configured), 200)
}

async function loadEvent(client: ReturnType<typeof createAdminClient>, eventId: string): Promise<DomainEvent | null> {
  const { data, error } = await client
    .from('notification_events')
    .select('event_id, event_type, aggregate_id, actor_id, source, source_event_key, payload, occurred_at')
    .eq('event_id', eventId)
    .maybeSingle()

  if (error || !data) return null

  const candidate = {
    eventId: data.event_id,
    eventType: data.event_type,
    aggregateId: data.aggregate_id,
    actorId: data.actor_id,
    source: data.source,
    sourceEventKey: data.source_event_key,
    payload: data.payload,
    occurredAt: data.occurred_at,
  }

  const validated = validateDomainEvent(candidate)
  return validated.ok ? validated.data : null
}

export async function processQueuedEmailDeliveries(limit?: number): Promise<number> {
  const client = createAdminClient()
  const provider = createEmailProvider()
  const batchSize = resolveBatchSize(limit)
  const now = new Date().toISOString()

  const { data: queued, error } = await client
    .from('notification_deliveries')
    .select('id, event_id, recipient_key, attempt_count, max_attempts')
    .eq('channel', 'email')
    .in('status', ['queued', 'failed'])
    .eq('retryable', true)
    .or(`next_retry_at.is.null,next_retry_at.lte.${now}`)
    .order('created_at', { ascending: true })
    .limit(batchSize)

  if (error) {
    throw new Error(error.message)
  }

  let processed = 0

  for (const row of (queued ?? []) as QueuedDeliveryRow[]) {
    const claim = await client
      .from('notification_deliveries')
      .update({
        status: 'processing',
        last_attempt_at: now,
      })
      .eq('id', row.id)
      .in('status', ['queued', 'failed'])
      .select('id')
      .maybeSingle()

    if (!claim.data) continue

    const event = await loadEvent(client, row.event_id)
    if (!event) {
      await client
        .from('notification_deliveries')
        .update({
          status: 'failed',
          retryable: false,
          last_error: 'Source notification event not found',
        })
        .eq('id', row.id)
      continue
    }

    const template = renderEmailTemplate(event)
    const message: EmailMessage = {
      ...template,
      to: row.recipient_key.includes('@') ? row.recipient_key : template.to,
    }

    const result = await provider.send(message)
    const attemptCount = row.attempt_count + 1

    if (result.ok === true) {
      await client
        .from('notification_deliveries')
        .update({
          status: 'sent',
          provider: provider.name,
          provider_message_id: result.messageId,
          attempt_count: attemptCount,
          sent_at: new Date().toISOString(),
          last_error: null,
          retryable: false,
          next_retry_at: null,
        })
        .eq('id', row.id)
      processed += 1
      continue
    }

    if (!isProviderSendFailure(result)) {
      continue
    }

    const terminal = !result.retryable || attemptCount >= row.max_attempts

    await client
      .from('notification_deliveries')
      .update({
        status: terminal ? 'failed' : 'queued',
        provider: provider.name,
        attempt_count: attemptCount,
        retryable: !terminal && result.retryable,
        next_retry_at: terminal ? null : nextRetryAt(attemptCount),
        last_error: `${result.errorCode}: ${result.errorMessage}`,
      })
      .eq('id', row.id)

    processed += 1
  }

  return processed
}
