import { describe, expect, it } from 'vitest'
import { buildDeliveryIdempotencyKey, buildSourceDedupeKey } from '../idempotency'

describe('idempotency keys', () => {
  it('builds delivery keys from event, channel, and recipient', () => {
    const eventId = '11111111-1111-4111-8111-111111111111'
    expect(buildDeliveryIdempotencyKey(eventId, 'email', 'user@example.com')).toBe(
      `${eventId}:email:user@example.com`
    )
  })

  it('builds source dedupe keys', () => {
    expect(buildSourceDedupeKey('auth_webhook', 'evt_123')).toBe('auth_webhook:evt_123')
  })
})
