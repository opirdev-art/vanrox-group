import { finalizeEmailMessage } from '@/lib/email/envelope'
import { buildTransactionalHtml, buildTransactionalText } from '@/lib/email/layout'
import { formatNotificationSubject } from '@/lib/email/subject'
import type { DomainEvent, DomainEventType } from '../events'
import type { EmailMessage } from '../providers/email/types'
import { businessEmailContent, businessInAppBody } from './business-copy'
import type { InAppTemplatePayload } from './render'

const BUSINESS_EVENT_TYPES = new Set<DomainEventType>([
  'business.booking.created',
  'business.lead.created',
  'business.lead.status_changed',
  'business.appointment.confirmed',
  'business.appointment.rescheduled',
  'business.appointment.cancelled',
  'business.review.submitted',
])

type TemplateBundle = {
  inApp: InAppTemplatePayload
  email: EmailMessage
}

function defaultHref(event: DomainEvent): string | null {
  switch (event.eventType) {
    case 'business.booking.created':
    case 'business.lead.created':
    case 'business.lead.status_changed':
      return `/admin/leads/${event.aggregateId}`
    case 'business.appointment.confirmed':
    case 'business.appointment.rescheduled':
    case 'business.appointment.cancelled':
      return `/admin/scheduler`
    case 'business.review.submitted':
      return '/admin/reviews'
    case 'content.case_study.published':
      return `/services/${(event.payload as { slug?: string }).slug ?? ''}`
    case 'content.blog_post.published':
      return `/blog/${(event.payload as { slug?: string }).slug ?? ''}`
    case 'auth.login.unauthorized':
      return '/admin/settings/security'
    case 'auth.staff.invited':
    case 'auth.staff.invite_accepted':
    case 'auth.staff.role_changed':
    case 'auth.staff.deactivated':
      return '/admin/settings/staff'
    default:
      return null
  }
}

function titleFor(eventType: DomainEventType, event: DomainEvent): string {
  const payload = event.payload as Record<string, unknown>

  switch (eventType) {
    case 'business.booking.created':
      return `New booking from ${payload.customerName ?? 'a customer'}`
    case 'business.lead.created':
      return `New lead: ${payload.customerName ?? 'Unknown'}`
    case 'business.lead.status_changed':
      return `Lead status changed to ${payload.newStatus ?? 'updated'}`
    case 'business.appointment.confirmed':
      return 'Appointment confirmed'
    case 'business.appointment.rescheduled':
      return 'Appointment rescheduled'
    case 'business.appointment.cancelled':
      return 'Appointment cancelled'
    case 'business.review.submitted': {
      const rating = payload.rating
      const stars = typeof rating === 'number' ? `${rating}★` : ''
      return `New review from ${payload.authorName ?? 'a client'}${stars ? ` (${stars})` : ''}`
    }
    case 'content.case_study.published':
      return `Case study published: ${payload.title ?? 'Untitled'}`
    case 'content.blog_post.published':
      return `Blog post published: ${payload.title ?? 'Untitled'}`
    case 'auth.login.unauthorized':
      return 'Unauthorized login attempt'
    case 'auth.staff.invited':
      return `Staff invited: ${payload.inviteeName ?? 'New user'}`
    case 'auth.staff.invite_accepted':
      return `${payload.fullName ?? 'A user'} accepted their invite`
    case 'auth.staff.role_changed':
      return 'Your role was updated'
    case 'auth.staff.deactivated':
      return 'Your account was deactivated'
    case 'auth.password.changed':
      return 'Your password was changed'
    case 'auth.password.reset_requested':
      return 'Password reset requested'
    case 'auth.password.reset_completed':
      return 'Password reset completed'
    case 'auth.callback.failed':
      return 'Sign-in failed'
    default:
      return eventType
  }
}

function bodyFor(eventType: DomainEventType, event: DomainEvent): string | null {
  const payload = event.payload as Record<string, unknown>

  if (BUSINESS_EVENT_TYPES.has(eventType)) {
    return businessInAppBody(eventType, payload)
  }

  switch (eventType) {
    case 'auth.login.unauthorized':
      return payload.emailMasked ? `Attempt by ${payload.emailMasked}` : 'A non-admin user attempted admin access.'
    case 'auth.staff.role_changed':
      return `Role changed from ${payload.previousRole ?? 'unknown'} to ${payload.newRole ?? 'unknown'}.`
    default:
      return null
  }
}

function emailFor(event: DomainEvent): EmailMessage {
  const title = titleFor(event.eventType, event)
  const body = bodyFor(event.eventType, event) ?? title
  const content = BUSINESS_EVENT_TYPES.has(event.eventType)
    ? businessEmailContent(event)
    : {
        preheader: body,
        eyebrow: 'Account Notification',
        paragraphs: [body],
      }

  return finalizeEmailMessage({
    to: '',
    subject: formatNotificationSubject(title),
    html: buildTransactionalHtml(content),
    text: buildTransactionalText(content),
    tags: [
      { name: 'event_type', value: event.eventType },
      { name: 'event_id', value: event.eventId },
    ],
    referenceId: event.eventId,
  })
}

export function renderTemplateForEvent(event: DomainEvent): TemplateBundle {
  const title = titleFor(event.eventType, event)
  const body = bodyFor(event.eventType, event)

  return {
    inApp: {
      type: event.eventType,
      title,
      body,
      href: defaultHref(event),
      metadata: {
        aggregateId: event.aggregateId,
        occurredAt: event.occurredAt,
      },
    },
    email: emailFor(event),
  }
}
