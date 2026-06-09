import { describe, expect, it } from 'vitest'
import { renderInAppTemplate } from '../templates/render'
import type { DomainEvent } from '../events'

describe('notification templates', () => {
  it('renders booking in-app payload with lead href', () => {
    const event: DomainEvent = {
      eventId: '11111111-1111-4111-8111-111111111111',
      eventType: 'business.booking.created',
      occurredAt: new Date().toISOString(),
      actorId: null,
      aggregateId: 'lead-123',
      source: 'server_action',
      payload: {
        leadId: 'lead-123',
        customerName: 'Jane Doe',
        serviceName: 'Solar Survey',
        preferredWindow: 'Jun 8, 2026 · 2:00 PM – 3:00 PM',
      },
    }

    const rendered = renderInAppTemplate(event)

    expect(rendered.title).toContain('Jane Doe')
    expect(rendered.body).toContain('Solar Survey')
    expect(rendered.href).toBe('/admin/leads/lead-123')
    expect(rendered.type).toBe('business.booking.created')
  })
})
