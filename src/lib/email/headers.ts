export function sanitizeHeaderValue(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim()
}

export function buildTransactionalHeaders(input?: {
  referenceId?: string
}): Record<string, string> {
  const headers: Record<string, string> = {
    'Auto-Submitted': 'auto-generated',
    'X-Auto-Response-Suppress': 'OOF, AutoReply',
    'X-PM-Message-Stream': 'outbound',
  }

  if (input?.referenceId) {
    headers['X-Entity-Ref-ID'] = sanitizeHeaderValue(input.referenceId)
  }

  return headers
}
