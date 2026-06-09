import type { EmailMessage, EmailProvider, ProviderSendResult } from './types'

export class NoopEmailProvider implements EmailProvider {
  readonly name = 'noop'

  async send(message: EmailMessage): Promise<ProviderSendResult> {
    void message
    return { ok: true, messageId: `noop-${crypto.randomUUID()}` }
  }
}
