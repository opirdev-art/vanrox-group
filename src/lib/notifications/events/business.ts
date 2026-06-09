import type { DomainEventEnvelope } from './envelope'

export type BusinessBookingCreatedPayload = {
  leadId: string
  customerName: string
  serviceName?: string
  preferredWindow?: string
  siteLocation?: string
  customerEmail?: string
}

export type BusinessLeadCreatedPayload = {
  leadId: string
  customerName: string
  source?: string
}

export type BusinessLeadStatusChangedPayload = {
  leadId: string
  previousStatus: string
  newStatus: string
}

export type BusinessAppointmentConfirmedPayload = {
  appointmentId: string
  leadId?: string
  scheduledAt: string
  title?: string
  customerName?: string
}

export type BusinessAppointmentRescheduledPayload = {
  appointmentId: string
  previousScheduledAt: string
  newScheduledAt: string
}

export type BusinessAppointmentCancelledPayload = {
  appointmentId: string
  leadId?: string
  reason?: string
  title?: string
  scheduledAt?: string
}

export type BusinessReferralLeadAttributedPayload = {
  leadId: string
  partnerId: string
}

export type BusinessReviewSubmittedPayload = {
  reviewId: string
  authorName: string
  rating: number
  bodyPreview: string
}

export type BusinessBookingCreatedEvent = DomainEventEnvelope<
  'business.booking.created',
  BusinessBookingCreatedPayload
>
export type BusinessLeadCreatedEvent = DomainEventEnvelope<
  'business.lead.created',
  BusinessLeadCreatedPayload
>
export type BusinessLeadStatusChangedEvent = DomainEventEnvelope<
  'business.lead.status_changed',
  BusinessLeadStatusChangedPayload
>
export type BusinessAppointmentConfirmedEvent = DomainEventEnvelope<
  'business.appointment.confirmed',
  BusinessAppointmentConfirmedPayload
>
export type BusinessAppointmentRescheduledEvent = DomainEventEnvelope<
  'business.appointment.rescheduled',
  BusinessAppointmentRescheduledPayload
>
export type BusinessAppointmentCancelledEvent = DomainEventEnvelope<
  'business.appointment.cancelled',
  BusinessAppointmentCancelledPayload
>
export type BusinessReferralLeadAttributedEvent = DomainEventEnvelope<
  'business.referral.lead_attributed',
  BusinessReferralLeadAttributedPayload
>
export type BusinessReviewSubmittedEvent = DomainEventEnvelope<
  'business.review.submitted',
  BusinessReviewSubmittedPayload
>

export type BusinessDomainEvent =
  | BusinessBookingCreatedEvent
  | BusinessLeadCreatedEvent
  | BusinessLeadStatusChangedEvent
  | BusinessAppointmentConfirmedEvent
  | BusinessAppointmentRescheduledEvent
  | BusinessAppointmentCancelledEvent
  | BusinessReferralLeadAttributedEvent
  | BusinessReviewSubmittedEvent
