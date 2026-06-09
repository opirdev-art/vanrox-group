import { getAppOrigin } from '@/lib/settings/app-url'
import type { TransactionalEmailContent } from '@/lib/email/layout'
import type { DomainEvent, DomainEventType } from '../events'

function asPayload(event: DomainEvent): Record<string, unknown> {
  return event.payload as Record<string, unknown>
}

export function formatBookingDetailLine(payload: Record<string, unknown>): string | null {
  const parts: string[] = []

  if (typeof payload.serviceName === 'string' && payload.serviceName.trim()) {
    parts.push(payload.serviceName.trim())
  }

  if (typeof payload.preferredWindow === 'string' && payload.preferredWindow.trim()) {
    parts.push(payload.preferredWindow.trim())
  }

  if (typeof payload.siteLocation === 'string' && payload.siteLocation.trim()) {
    parts.push(payload.siteLocation.trim())
  }

  return parts.length > 0 ? parts.join(' · ') : null
}

function leadHref(leadId: string | undefined): string | undefined {
  if (!leadId) return undefined
  return `${getAppOrigin()}/admin/leads/${leadId}`
}

function schedulerHref(): string {
  return `${getAppOrigin()}/admin/scheduler`
}

export function businessEmailContent(event: DomainEvent): TransactionalEmailContent {
  const payload = asPayload(event)
  const eyebrow = 'Business Alert'

  switch (event.eventType) {
    case 'business.booking.created': {
      const customerName =
        typeof payload.customerName === 'string' ? payload.customerName : 'a customer'
      const paragraphs = [`A new booking request was submitted by ${customerName}.`]

      if (typeof payload.serviceName === 'string') paragraphs.push(`Service: ${payload.serviceName}`)
      if (typeof payload.preferredWindow === 'string') {
        paragraphs.push(`Preferred time: ${payload.preferredWindow}`)
      }
      if (typeof payload.siteLocation === 'string') paragraphs.push(`Location: ${payload.siteLocation}`)
      if (typeof payload.customerEmail === 'string') paragraphs.push(`Email: ${payload.customerEmail}`)

      const leadId = typeof payload.leadId === 'string' ? payload.leadId : undefined
      const viewLeadUrl = leadHref(leadId)

      return {
        preheader: `New booking from ${customerName}${payload.serviceName ? ` for ${payload.serviceName}` : ''}`,
        eyebrow,
        paragraphs,
        cta: viewLeadUrl ? { label: 'View lead', url: viewLeadUrl } : undefined,
      }
    }

    case 'business.lead.status_changed': {
      const previousStatus = payload.previousStatus ?? 'unknown'
      const newStatus = payload.newStatus ?? 'updated'
      const leadId = typeof payload.leadId === 'string' ? payload.leadId : undefined

      return {
        preheader: `Lead status changed to ${newStatus}`,
        eyebrow,
        paragraphs: [
          `Lead status changed from ${previousStatus} to ${newStatus}.`,
          'Review the lead record for full context and next steps.',
        ],
        cta: leadHref(leadId) ? { label: 'View lead', url: leadHref(leadId)! } : undefined,
      }
    }

    case 'business.appointment.confirmed': {
      const title = typeof payload.title === 'string' ? payload.title : 'Appointment'
      const scheduledAt = typeof payload.scheduledAt === 'string' ? payload.scheduledAt : null
      const customerName = typeof payload.customerName === 'string' ? payload.customerName : null
      const paragraphs = [`${title} has been confirmed.`]

      if (customerName) paragraphs.push(`Customer: ${customerName}`)
      if (scheduledAt) paragraphs.push(`Scheduled for: ${scheduledAt}`)

      return {
        preheader: `${title} confirmed${scheduledAt ? ` for ${scheduledAt}` : ''}`,
        eyebrow,
        paragraphs,
        cta: { label: 'Open scheduler', url: schedulerHref() },
      }
    }

    case 'business.appointment.rescheduled': {
      const previousScheduledAt = payload.previousScheduledAt ?? 'unknown'
      const newScheduledAt = payload.newScheduledAt ?? 'updated'

      return {
        preheader: `Appointment rescheduled to ${newScheduledAt}`,
        eyebrow,
        paragraphs: [
          `Appointment moved from ${previousScheduledAt} to ${newScheduledAt}.`,
        ],
        cta: { label: 'Open scheduler', url: schedulerHref() },
      }
    }

    case 'business.review.submitted': {
      const authorName =
        typeof payload.authorName === 'string' ? payload.authorName : 'a client'
      const rating = typeof payload.rating === 'number' ? payload.rating : null
      const bodyPreview =
        typeof payload.bodyPreview === 'string' ? payload.bodyPreview.trim() : ''
      const paragraphs = [
        `${authorName} submitted a new review${rating ? ` (${rating} out of 5 stars)` : ''}.`,
      ]

      if (bodyPreview) {
        paragraphs.push(`"${bodyPreview}"`)
      }

      paragraphs.push('Approve or reject it in the admin reviews panel.')

      return {
        preheader: `New review from ${authorName} awaiting approval`,
        eyebrow,
        paragraphs,
        cta: {
          label: 'Moderate review',
          url: `${getAppOrigin()}/admin/reviews`,
        },
      }
    }

    case 'business.appointment.cancelled': {
      const title = typeof payload.title === 'string' ? payload.title : 'An appointment'
      const scheduledAt = typeof payload.scheduledAt === 'string' ? payload.scheduledAt : null
      const paragraphs = [`${title} was cancelled.`]

      if (scheduledAt) paragraphs.push(`Originally scheduled for: ${scheduledAt}`)
      if (typeof payload.reason === 'string' && payload.reason.trim()) {
        paragraphs.push(`Reason: ${payload.reason.trim()}`)
      }

      return {
        preheader: `${title} cancelled`,
        eyebrow,
        paragraphs,
        cta: { label: 'Open scheduler', url: schedulerHref() },
      }
    }

    default:
      return {
        preheader: 'VANROX account notification',
        eyebrow: 'Account Notification',
        paragraphs: ['You have a new notification in the VANROX admin portal.'],
      }
  }
}

export function businessInAppBody(eventType: DomainEventType, payload: Record<string, unknown>): string | null {
  switch (eventType) {
    case 'business.booking.created':
      return formatBookingDetailLine(payload)
    case 'business.lead.status_changed':
      return `Status moved from ${payload.previousStatus ?? 'unknown'} to ${payload.newStatus ?? 'unknown'}.`
    case 'business.appointment.confirmed':
      return typeof payload.scheduledAt === 'string' ? `Scheduled for ${payload.scheduledAt}` : null
    case 'business.appointment.rescheduled':
      return `Moved to ${payload.newScheduledAt ?? 'updated time'}.`
    case 'business.appointment.cancelled':
      return typeof payload.scheduledAt === 'string'
        ? `Was scheduled for ${payload.scheduledAt}`
        : null
    case 'business.review.submitted': {
      const rating = typeof payload.rating === 'number' ? `${payload.rating}★` : null
      const preview =
        typeof payload.bodyPreview === 'string' && payload.bodyPreview.trim()
          ? payload.bodyPreview.trim()
          : null
      if (rating && preview) return `${rating} — ${preview}`
      return rating ?? preview
    }
    default:
      return null
  }
}
