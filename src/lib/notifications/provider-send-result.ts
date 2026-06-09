import type { ProviderSendResult } from './providers/email/types'

export function isProviderSendFailure(
  result: ProviderSendResult
): result is Extract<ProviderSendResult, { ok: false }> {
  return result.ok === false
}

export function providerSendErrorMessage(result: ProviderSendResult): string | null {
  return isProviderSendFailure(result) ? result.errorMessage : null
}
