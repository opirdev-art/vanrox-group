import { describe, expect, it } from 'vitest'
import { validateDomainEvent } from '../events'

describe('validateDomainEvent', () => {
  it('accepts a valid booking event', () => {
    const result = validateDomainEvent({
      eventId: '11111111-1111-4111-8111-111111111111',
      eventType: 'business.booking.created',
      occurredAt: new Date().toISOString(),
      actorId: null,
      aggregateId: 'lead-123',
      source: 'server_action',
      payload: {
        leadId: 'lead-123',
        customerName: 'Jane Doe',
      },
    })

    expect(result.ok).toBe(true)
  })

  it('rejects malformed payloads', () => {
    const result = validateDomainEvent({
      eventId: '11111111-1111-4111-8111-111111111111',
      eventType: 'business.booking.created',
      occurredAt: new Date().toISOString(),
      actorId: null,
      aggregateId: 'lead-123',
      source: 'server_action',
      payload: {},
    })

    expect(result.ok).toBe(false)
  })
})
