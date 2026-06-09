import 'server-only'
import { createAdminClient } from '@/utils/supabase/admin-client'
import { EmailNotificationChannel } from './channels/email'
import { InAppNotificationChannel } from './channels/in-app'
import type { NotificationChannel } from './channels/types'
import { isParseFailure } from '@/lib/parse-result'
import { validateDomainEvent, type DomainEvent } from './events'
import { isChannelEnabledForRecipient } from './preferences'
import { persistNotificationEvent } from './persist-event'
import { getEventRouting } from './routing'
import { enrichRecipientsWithEmails } from './recipient-email'
import { resolveRecipients } from './recipient-resolver'
import { renderEmailTemplate, renderInAppTemplate } from './templates/render'
import type { DeliverySummary, NotifyResult } from './types'

function logNotification(event: DomainEvent, delivery: DeliverySummary) {
  console.info('[notification]', {
    eventId: event.eventId,
    eventType: event.eventType,
    channel: delivery.channel,
    recipientKey: delivery.recipientKey,
    status: delivery.status,
  })
}

export async function notify(event: DomainEvent): Promise<NotifyResult> {
  const validation = validateDomainEvent(event)
  if (isParseFailure(validation)) {
    return { ok: false, error: validation.error }
  }

  const validatedEvent = validation.data
  const adminClient = createAdminClient()

  const persistResult = await persistNotificationEvent(adminClient, validatedEvent)
  if (persistResult.ok === false) {
    return { ok: false, eventId: validatedEvent.eventId, error: persistResult.error }
  }

  if (persistResult.deduplicated) {
    return {
      ok: true,
      eventId: validatedEvent.eventId,
      deduplicated: true,
      deliveries: [],
    }
  }

  const routing = getEventRouting(validatedEvent.eventType)
  if (routing.auditOnly) {
    return {
      ok: true,
      eventId: validatedEvent.eventId,
      deduplicated: false,
      deliveries: [],
    }
  }

  const inAppChannel = new InAppNotificationChannel(adminClient)
  const emailChannel = new EmailNotificationChannel(adminClient)
  const inAppTemplate = renderInAppTemplate(validatedEvent)
  const emailTemplate = renderEmailTemplate(validatedEvent)

  const deliveries: DeliverySummary[] = []

  const dispatchChannel = async (
    channel: NotificationChannel,
    rules: typeof routing.inApp
  ) => {
    let recipients = await resolveRecipients(adminClient, validatedEvent, rules)

    if (channel === 'email') {
      recipients = await enrichRecipientsWithEmails(adminClient, recipients)
    }

    for (const recipient of recipients) {
      if (
        !isChannelEnabledForRecipient(
          validatedEvent.eventType,
          channel,
          {
            profileId: recipient.profileId,
            role: recipient.role,
            metadata: recipient.metadata,
          },
          routing
        )
      ) {
        const skipped: DeliverySummary = {
          channel,
          recipientKey: recipient.profileId,
          status: 'skipped',
        }
        deliveries.push(skipped)
        logNotification(validatedEvent, skipped)
        continue
      }

      const adapter = channel === 'in_app' ? inAppChannel : emailChannel
      const result = await adapter.dispatch({
        event: validatedEvent,
        recipient,
        inApp: inAppTemplate,
        email: {
          ...emailTemplate,
          to: recipient.email ?? '',
        },
      })

      const summary: DeliverySummary = {
        channel,
        recipientKey: recipient.profileId,
        status: result.ok ? result.status : 'failed',
      }
      deliveries.push(summary)
      logNotification(validatedEvent, summary)
    }
  }

  if (routing.inApp !== 'off') {
    await dispatchChannel('in_app', routing.inApp)
  }

  if (routing.email !== 'off') {
    await dispatchChannel('email', routing.email)
  }

  return {
    ok: true,
    eventId: validatedEvent.eventId,
    deduplicated: false,
    deliveries,
  }
}
