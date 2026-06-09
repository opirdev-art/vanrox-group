import type { DomainEvent } from '../events'
import type { EmailMessage } from '../providers/email/types'
import { renderTemplateForEvent } from './registry'

export type InAppTemplatePayload = {
  type: string
  title: string
  body: string | null
  href: string | null
  metadata: Record<string, unknown>
}

export function renderInAppTemplate(event: DomainEvent): InAppTemplatePayload {
  return renderTemplateForEvent(event).inApp
}

export function renderEmailTemplate(event: DomainEvent): EmailMessage {
  return renderTemplateForEvent(event).email
}
