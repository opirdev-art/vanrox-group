export type EmailMessage = {
  to: string | string[]
  subject: string
  html: string
  text: string
  replyTo?: string
  headers?: Record<string, string>
  tags?: { name: string; value: string }[]
}

export type ProviderSendResult =
  | { ok: true; messageId: string }
  | { ok: false; errorCode: string; errorMessage: string; retryable: boolean }

export interface EmailProvider {
  readonly name: string
  send(message: EmailMessage): Promise<ProviderSendResult>
}
