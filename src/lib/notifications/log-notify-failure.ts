import type { NotifyResult } from './types'

export function isNotifyFailure(
  result: NotifyResult
): result is Extract<NotifyResult, { ok: false }> {
  return result.ok === false
}

export function logNotifyFailure(
  label: string,
  result: NotifyResult,
  context?: Record<string, unknown>
): void {
  if (!isNotifyFailure(result)) return

  console.error(`[notification] ${label}`, {
    ...context,
    eventId: result.eventId,
    error: result.error,
  })
}
