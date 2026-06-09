import type { EmailMessage } from '@/lib/notifications/providers/email/types'
import { getEmailReplyTo } from './config'
import { buildTransactionalHeaders } from './headers'

type EmailEnvelopeInput = Omit<EmailMessage, 'text' | 'replyTo' | 'headers'> & {
  text?: string
  replyTo?: string
  headers?: Record<string, string>
  referenceId?: string
}

export function finalizeEmailMessage(input: EmailEnvelopeInput): EmailMessage {
  if (!input.text?.trim()) {
    throw new Error('Transactional emails require a plain-text body for deliverability')
  }

  return {
    ...input,
    text: input.text.trim(),
    replyTo: input.replyTo ?? getEmailReplyTo(),
    headers: {
      ...buildTransactionalHeaders({ referenceId: input.referenceId }),
      ...input.headers,
    },
  }
}
