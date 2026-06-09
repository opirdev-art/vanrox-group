import { describe, expect, it } from 'vitest'
import type { DomainEvent } from '../events'
import { businessEmailContent, formatBookingDetailLine } from '../templates/business-copy'
import { renderEmailTemplate, renderInAppTemplate } from '../templates/render'

describe('business notification copy', () => {
  it('formats booking detail lines for in-app notifications', () => {
    const line = formatBookingDetailLine({
      serviceName: 'Solar Survey',
      preferredWindow: 'Jun 8, 2026 · 2:00 PM – 3:00 PM',
      siteLocation: 'Scarborough',
    })

    expect(line).toContain('Solar Survey')
    expect(line).toContain('Scarborough')
  })

  it('renders rich booking email with CTA', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'

    const event: DomainEvent = {
      eventId: '11111111-1111-4111-8111-111111111111',
      eventType: 'business.booking.created',
      occurredAt: new Date().toISOString(),
      actorId: null,
      aggregateId: 'lead-123',
      source: 'server_action',
      sourceEventKey: 'booking:lead-123',
      payload: {
        leadId: 'lead-123',
        customerName: 'Jane Doe',
        serviceName: 'Solar Survey',
        preferredWindow: 'Jun 8, 2026 · 2:00 PM – 3:00 PM',
        siteLocation: 'Scarborough',
        customerEmail: 'jane@example.com',
      },
    }

    const inApp = renderInAppTemplate(event)
    const email = renderEmailTemplate(event)

    expect(inApp.body).toContain('Solar Survey')
    expect(email.html).toContain('View lead')
    expect(email.html).toContain('jane@example.com')
    expect(email.text).toContain('Solar Survey')
    expect(businessEmailContent(event).cta?.url).toBe('http://localhost:3000/admin/leads/lead-123')
  })
})
