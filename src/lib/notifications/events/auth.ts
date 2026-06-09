import type { DomainEventEnvelope } from './envelope'

export type AuthLoginSucceededPayload = {
  userId: string
  emailMasked?: string
}

export type AuthLoginFailedPayload = {
  emailHash: string
  reason: string
  ipAddress?: string
}

export type AuthLoginUnauthorizedPayload = {
  userId: string
  emailMasked?: string
  attemptedPath?: string
}

export type AuthLogoutPayload = {
  userId: string
}

export type AuthSessionRequiredPayload = {
  sessionKey: string
  path: string
}

export type AuthCallbackSucceededPayload = {
  userId: string
}

export type AuthCallbackFailedPayload = {
  sessionKey: string
  reason: string
  subjectUserId?: string
  subjectEmail?: string
}

export type AuthStaffInvitedPayload = {
  invitedUserId: string
  inviteeEmail: string
  inviteeName: string
  role: string
}

export type AuthStaffInviteAcceptedPayload = {
  userId: string
  fullName: string
}

export type AuthStaffRoleChangedPayload = {
  userId: string
  previousRole: string
  newRole: string
}

export type AuthStaffDeactivatedPayload = {
  userId: string
  fullName: string
}

export type AuthPasswordChangedPayload = {
  userId: string
}

export type AuthPasswordResetRequestedPayload = {
  userId: string
  email: string
}

export type AuthPasswordResetCompletedPayload = {
  userId: string
}

export type AuthLoginSucceededEvent = DomainEventEnvelope<'auth.login.succeeded', AuthLoginSucceededPayload>
export type AuthLoginFailedEvent = DomainEventEnvelope<'auth.login.failed', AuthLoginFailedPayload>
export type AuthLoginUnauthorizedEvent = DomainEventEnvelope<
  'auth.login.unauthorized',
  AuthLoginUnauthorizedPayload
>
export type AuthLogoutEvent = DomainEventEnvelope<'auth.logout', AuthLogoutPayload>
export type AuthSessionRequiredEvent = DomainEventEnvelope<'auth.session.required', AuthSessionRequiredPayload>
export type AuthCallbackSucceededEvent = DomainEventEnvelope<
  'auth.callback.succeeded',
  AuthCallbackSucceededPayload
>
export type AuthCallbackFailedEvent = DomainEventEnvelope<'auth.callback.failed', AuthCallbackFailedPayload>
export type AuthStaffInvitedEvent = DomainEventEnvelope<'auth.staff.invited', AuthStaffInvitedPayload>
export type AuthStaffInviteAcceptedEvent = DomainEventEnvelope<
  'auth.staff.invite_accepted',
  AuthStaffInviteAcceptedPayload
>
export type AuthStaffRoleChangedEvent = DomainEventEnvelope<
  'auth.staff.role_changed',
  AuthStaffRoleChangedPayload
>
export type AuthStaffDeactivatedEvent = DomainEventEnvelope<
  'auth.staff.deactivated',
  AuthStaffDeactivatedPayload
>
export type AuthPasswordChangedEvent = DomainEventEnvelope<'auth.password.changed', AuthPasswordChangedPayload>
export type AuthPasswordResetRequestedEvent = DomainEventEnvelope<
  'auth.password.reset_requested',
  AuthPasswordResetRequestedPayload
>
export type AuthPasswordResetCompletedEvent = DomainEventEnvelope<
  'auth.password.reset_completed',
  AuthPasswordResetCompletedPayload
>

export type AuthDomainEvent =
  | AuthLoginSucceededEvent
  | AuthLoginFailedEvent
  | AuthLoginUnauthorizedEvent
  | AuthLogoutEvent
  | AuthSessionRequiredEvent
  | AuthCallbackSucceededEvent
  | AuthCallbackFailedEvent
  | AuthStaffInvitedEvent
  | AuthStaffInviteAcceptedEvent
  | AuthStaffRoleChangedEvent
  | AuthStaffDeactivatedEvent
  | AuthPasswordChangedEvent
  | AuthPasswordResetRequestedEvent
  | AuthPasswordResetCompletedEvent
