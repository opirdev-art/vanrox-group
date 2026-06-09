import { isParseFailure, type ParseResult } from '@/lib/parse-result'
import type { AuthDomainEvent } from './auth'
import type { BusinessDomainEvent } from './business'
import type { ContentDomainEvent } from './content'
import { isDomainEventSource, type DomainEventEnvelope } from './envelope'

export * from './envelope'
export * from './business'
export * from './auth'
export * from './content'

export const DOMAIN_EVENT_TYPES = [
  'business.booking.created',
  'business.lead.created',
  'business.lead.status_changed',
  'business.appointment.confirmed',
  'business.appointment.rescheduled',
  'business.appointment.cancelled',
  'business.referral.lead_attributed',
  'content.case_study.published',
  'content.blog_post.published',
  'auth.login.succeeded',
  'auth.login.failed',
  'auth.login.unauthorized',
  'auth.logout',
  'auth.session.required',
  'auth.callback.succeeded',
  'auth.callback.failed',
  'auth.staff.invited',
  'auth.staff.invite_accepted',
  'auth.staff.role_changed',
  'auth.staff.deactivated',
  'auth.password.changed',
  'auth.password.reset_requested',
  'auth.password.reset_completed',
] as const

export type DomainEventType = (typeof DOMAIN_EVENT_TYPES)[number]

export type DomainEvent = BusinessDomainEvent | ContentDomainEvent | AuthDomainEvent

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isIsoDateString(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}

function validateEnvelope(
  event: unknown
): ParseResult<DomainEventEnvelope<string, Record<string, unknown>>> {
  if (!isRecord(event)) {
    return { ok: false, error: 'Event must be an object' }
  }

  const { eventId, eventType, occurredAt, actorId, aggregateId, source, payload } = event

  if (!isNonEmptyString(eventId) || !UUID_RE.test(eventId)) {
    return { ok: false, error: 'eventId must be a UUID' }
  }

  if (!isNonEmptyString(eventType) || !(DOMAIN_EVENT_TYPES as readonly string[]).includes(eventType)) {
    return { ok: false, error: 'eventType is invalid' }
  }

  if (!isIsoDateString(occurredAt)) {
    return { ok: false, error: 'occurredAt must be an ISO 8601 timestamp' }
  }

  if (actorId !== null && (!isNonEmptyString(actorId) || !UUID_RE.test(actorId))) {
    return { ok: false, error: 'actorId must be null or a UUID' }
  }

  if (!isNonEmptyString(aggregateId)) {
    return { ok: false, error: 'aggregateId is required' }
  }

  if (!isNonEmptyString(source) || !isDomainEventSource(source)) {
    return { ok: false, error: 'source is invalid' }
  }

  if (!isRecord(payload)) {
    return { ok: false, error: 'payload must be an object' }
  }

  const sourceEventKey = event.sourceEventKey
  if (
    sourceEventKey !== undefined &&
    sourceEventKey !== null &&
    !isNonEmptyString(sourceEventKey)
  ) {
    return { ok: false, error: 'sourceEventKey must be null, undefined, or a non-empty string' }
  }

  const normalizedActorId: string | null =
    actorId === null || actorId === undefined
      ? null
      : isNonEmptyString(actorId)
        ? actorId
        : null

  const normalizedSourceEventKey: string | null =
    sourceEventKey === null || sourceEventKey === undefined
      ? null
      : isNonEmptyString(sourceEventKey)
        ? sourceEventKey
        : null

  return {
    ok: true,
    data: {
      eventId,
      eventType,
      occurredAt,
      actorId: normalizedActorId,
      aggregateId,
      source,
      sourceEventKey: normalizedSourceEventKey,
      payload,
    },
  }
}

function validatePayload(eventType: DomainEventType, payload: Record<string, unknown>): ParseResult<Record<string, unknown>> {
  const requireFields = (...fields: string[]): ParseResult<Record<string, unknown>> => {
    for (const field of fields) {
      if (!isNonEmptyString(payload[field])) {
        return { ok: false, error: `payload.${field} is required` }
      }
    }
    return { ok: true, data: payload }
  }

  switch (eventType) {
    case 'business.booking.created':
      return requireFields('leadId', 'customerName')
    case 'business.lead.created':
      return requireFields('leadId', 'customerName')
    case 'business.lead.status_changed':
      return requireFields('leadId', 'previousStatus', 'newStatus')
    case 'business.appointment.confirmed':
      return requireFields('appointmentId', 'scheduledAt')
    case 'business.appointment.rescheduled':
      return requireFields('appointmentId', 'previousScheduledAt', 'newScheduledAt')
    case 'business.appointment.cancelled':
      return requireFields('appointmentId')
    case 'business.referral.lead_attributed':
      return requireFields('leadId', 'partnerId')
    case 'content.case_study.published':
      return requireFields('caseStudyId', 'title', 'slug')
    case 'content.blog_post.published':
      return requireFields('blogPostId', 'title', 'slug')
    case 'auth.login.succeeded':
      return requireFields('userId')
    case 'auth.login.failed':
      return requireFields('emailHash', 'reason')
    case 'auth.login.unauthorized':
      return requireFields('userId')
    case 'auth.logout':
      return requireFields('userId')
    case 'auth.session.required':
      return requireFields('sessionKey', 'path')
    case 'auth.callback.succeeded':
      return requireFields('userId')
    case 'auth.callback.failed':
      return requireFields('sessionKey', 'reason')
    case 'auth.staff.invited':
      return requireFields('invitedUserId', 'inviteeEmail', 'inviteeName', 'role')
    case 'auth.staff.invite_accepted':
      return requireFields('userId', 'fullName')
    case 'auth.staff.role_changed':
      return requireFields('userId', 'previousRole', 'newRole')
    case 'auth.staff.deactivated':
      return requireFields('userId', 'fullName')
    case 'auth.password.changed':
      return requireFields('userId')
    case 'auth.password.reset_requested':
      return requireFields('userId', 'email')
    case 'auth.password.reset_completed':
      return requireFields('userId')
    default:
      return { ok: false, error: 'Unsupported event type' }
  }
}

export function validateDomainEvent(event: unknown): ParseResult<DomainEvent> {
  const envelopeResult = validateEnvelope(event)
  if (isParseFailure(envelopeResult)) {
    return { ok: false, error: envelopeResult.error }
  }

  const payloadResult = validatePayload(
    envelopeResult.data.eventType as DomainEventType,
    envelopeResult.data.payload
  )
  if (isParseFailure(payloadResult)) {
    return { ok: false, error: payloadResult.error }
  }

  return {
    ok: true,
    data: {
      ...envelopeResult.data,
      payload: payloadResult.data,
    } as DomainEvent,
  }
}

export function isDomainEventType(value: string): value is DomainEventType {
  return (DOMAIN_EVENT_TYPES as readonly string[]).includes(value)
}
