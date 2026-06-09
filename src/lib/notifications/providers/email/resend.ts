import { formatEmailFromAddress } from '@/lib/email/config'
import type { EmailMessage, EmailProvider, ProviderSendResult } from './types'
import { Resend } from 'resend'
import { sanitizeResendTags } from './resend-tags'

export class ResendEmailProvider implements EmailProvider {
  readonly name = 'resend'
  private readonly resend: Resend
  private readonly from: string

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey)
    this.from = formatEmailFromAddress()
  }

  async send(message: EmailMessage): Promise<ProviderSendResult> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.from,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text,
        replyTo: message.replyTo,
        headers: message.headers,
        tags: sanitizeResendTags(message.tags),
      })

      if (error) {
        const statusCode =
          'statusCode' in error && typeof error.statusCode === 'number' ? error.statusCode : null
        const retryable = statusCode === 429 || (statusCode !== null && statusCode >= 500)
        return {
          ok: false,
          errorCode: error.name ?? 'resend_error',
          errorMessage: error.message ?? 'Resend API error',
          retryable,
        }
      }

      if (!data?.id) {
        return {
          ok: false,
          errorCode: 'resend_missing_message_id',
          errorMessage: 'Resend did not return a message id',
          retryable: true,
        }
      }

      return { ok: true, messageId: data.id }
    } catch (error) {
      const messageText = error instanceof Error ? error.message : 'Unknown send error'
      const retryable = /timed out|timeout|network|fetch|429|5\d\d/i.test(messageText)
      return {
        ok: false,
        errorCode: 'resend_exception',
        errorMessage: messageText,
        retryable,
      }
    }
  }

  static isConfigured(apiKey: string | undefined, from: string | undefined): boolean {
    return Boolean(apiKey?.trim()) && Boolean(from?.trim())
  }
}

export function createResendProviderFromEnv():
  | { ok: true; provider: ResendEmailProvider }
  | { ok: false; reason: string } {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from = process.env.EMAIL_FROM?.trim()

  if (!ResendEmailProvider.isConfigured(apiKey, from)) {
    return {
      ok: false,
      reason: 'Missing RESEND_API_KEY or EMAIL_FROM',
    }
  }

  return {
    ok: true,
    provider: new ResendEmailProvider(apiKey!),
  }
}
