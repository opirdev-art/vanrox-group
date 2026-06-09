export const DOMAIN_EVENT_SOURCES = [
  'server_action',
  'auth_webhook', // legacy enum value; unused (no Supabase Auth Hooks)
  'auth_callback',
  'db_trigger',
] as const

export type DomainEventSource = (typeof DOMAIN_EVENT_SOURCES)[number]

export type DomainEventEnvelope<TType extends string, TPayload> = {
  eventId: string
  eventType: TType
  occurredAt: string
  actorId: string | null
  aggregateId: string
  source: DomainEventSource
  sourceEventKey?: string | null
  payload: TPayload
}

export function isDomainEventSource(value: string): value is DomainEventSource {
  return (DOMAIN_EVENT_SOURCES as readonly string[]).includes(value)
}
