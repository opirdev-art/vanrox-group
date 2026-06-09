import 'server-only'
import type { EmailProvider } from './types'
import { NoopEmailProvider } from './noop'
import { createResendProviderFromEnv } from './resend'

let cachedProvider: EmailProvider | null = null

export function createEmailProvider(): EmailProvider {
  if (cachedProvider) return cachedProvider

  const configured = process.env.EMAIL_PROVIDER?.trim().toLowerCase()

  if (configured === 'resend') {
    const resend = createResendProviderFromEnv()
    if (resend.ok === true) {
      cachedProvider = resend.provider
      return cachedProvider
    }

    console.warn('[notification] falling back to noop provider', {
      provider: 'resend',
      reason: resend.reason,
    })
    cachedProvider = new NoopEmailProvider()
    return cachedProvider
  }

  cachedProvider = new NoopEmailProvider()
  return cachedProvider
}

export function resetEmailProviderForTests() {
  cachedProvider = null
}
