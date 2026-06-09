import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { DomainEvent } from './events'

export type PersistEventResult =
  | { ok: true; deduplicated: false }
  | { ok: true; deduplicated: true }
  | { ok: false; error: string }

export async function persistNotificationEvent(
  client: SupabaseClient,
  event: DomainEvent
): Promise<PersistEventResult> {
  const { error } = await client.from('notification_events').insert({
    event_id: event.eventId,
    event_type: event.eventType,
    aggregate_id: event.aggregateId,
    actor_id: event.actorId,
    source: event.source,
    source_event_key: event.sourceEventKey ?? null,
    payload: event.payload,
    occurred_at: event.occurredAt,
  })

  if (!error) {
    return { ok: true, deduplicated: false }
  }

  if (error.code === 'PGRST205' || error.message.includes('notification_events')) {
    return {
      ok: false,
      error:
        'Notification tables are missing. Apply migration 20260608230000_notification_system.sql to your Supabase database.',
    }
  }

  if (error.code === '23505' && event.sourceEventKey) {
    return { ok: true, deduplicated: true }
  }

  return { ok: false, error: error.message }
}
