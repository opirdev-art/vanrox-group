import type { DomainEventType } from './events'

export type RecipientRule =
  | 'all_admins'
  | 'super_admins_only'
  | 'actor'
  | 'subject'
  | 'business_contact'

export type EventRouting = {
  eventType: DomainEventType
  inApp: RecipientRule[] | 'off'
  email: RecipientRule[] | 'off'
  emailRequired?: boolean
  auditOnly?: boolean
}

export const EVENT_ROUTING: Record<DomainEventType, EventRouting> = {
  'business.booking.created': {
    eventType: 'business.booking.created',
    inApp: ['all_admins'],
    email: ['all_admins'],
  },
  'business.lead.created': {
    eventType: 'business.lead.created',
    inApp: ['all_admins'],
    email: ['all_admins'],
  },
  'business.lead.status_changed': {
    eventType: 'business.lead.status_changed',
    inApp: ['all_admins'],
    email: 'off',
  },
  'business.appointment.confirmed': {
    eventType: 'business.appointment.confirmed',
    inApp: ['all_admins'],
    email: ['all_admins'],
  },
  'business.appointment.rescheduled': {
    eventType: 'business.appointment.rescheduled',
    inApp: ['all_admins'],
    email: ['all_admins'],
  },
  'business.appointment.cancelled': {
    eventType: 'business.appointment.cancelled',
    inApp: ['all_admins'],
    email: ['all_admins'],
  },
  'business.referral.lead_attributed': {
    eventType: 'business.referral.lead_attributed',
    inApp: ['all_admins'],
    email: 'off',
  },
  'content.case_study.published': {
    eventType: 'content.case_study.published',
    inApp: ['all_admins'],
    email: 'off',
  },
  'content.blog_post.published': {
    eventType: 'content.blog_post.published',
    inApp: ['all_admins'],
    email: 'off',
  },
  'auth.login.succeeded': {
    eventType: 'auth.login.succeeded',
    inApp: 'off',
    email: ['super_admins_only'],
  },
  'auth.login.failed': {
    eventType: 'auth.login.failed',
    inApp: 'off',
    email: 'off',
    auditOnly: true,
  },
  'auth.login.unauthorized': {
    eventType: 'auth.login.unauthorized',
    inApp: ['super_admins_only'],
    email: ['super_admins_only'],
    emailRequired: true,
  },
  'auth.logout': {
    eventType: 'auth.logout',
    inApp: 'off',
    email: 'off',
    auditOnly: true,
  },
  'auth.session.required': {
    eventType: 'auth.session.required',
    inApp: 'off',
    email: 'off',
    auditOnly: true,
  },
  'auth.callback.succeeded': {
    eventType: 'auth.callback.succeeded',
    inApp: 'off',
    email: 'off',
    auditOnly: true,
  },
  'auth.callback.failed': {
    eventType: 'auth.callback.failed',
    inApp: 'off',
    email: ['subject'],
  },
  'auth.staff.invited': {
    eventType: 'auth.staff.invited',
    inApp: ['all_admins'],
    // Invite email is sent inline in staff action (generateLink + EmailProvider).
    email: 'off',
  },
  'auth.staff.invite_accepted': {
    eventType: 'auth.staff.invite_accepted',
    inApp: ['all_admins'],
    email: ['subject'],
  },
  'auth.staff.role_changed': {
    eventType: 'auth.staff.role_changed',
    inApp: ['all_admins', 'subject'],
    email: ['subject'],
  },
  'auth.staff.deactivated': {
    eventType: 'auth.staff.deactivated',
    inApp: ['super_admins_only'],
    email: ['subject'],
  },
  'auth.password.changed': {
    eventType: 'auth.password.changed',
    inApp: ['subject'],
    email: ['subject'],
    emailRequired: true,
  },
  'auth.password.reset_requested': {
    eventType: 'auth.password.reset_requested',
    inApp: 'off',
    email: ['subject'],
    emailRequired: true,
  },
  'auth.password.reset_completed': {
    eventType: 'auth.password.reset_completed',
    inApp: ['subject'],
    email: ['subject'],
  },
}

export function getEventRouting(eventType: DomainEventType): EventRouting {
  return EVENT_ROUTING[eventType]
}
