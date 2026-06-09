import { NextResponse } from 'next/server'
import { processQueuedEmailDeliveries } from '@/lib/notifications'

function readWorkerSecret(request: Request): string | null {
  const headerSecret = request.headers.get('x-worker-secret')
  if (headerSecret) return headerSecret

  const auth = request.headers.get('authorization')
  if (!auth) return null

  const [scheme, token] = auth.split(' ')
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null
  return token
}

function parseLimit(request: Request): number | undefined {
  const { searchParams } = new URL(request.url)
  const raw = searchParams.get('limit')
  if (!raw) return undefined

  const parsed = Number(raw)
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined
  return Math.floor(parsed)
}

export async function POST(request: Request) {
  const expected = process.env.NOTIFICATION_WORKER_SECRET?.trim()
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: 'NOTIFICATION_WORKER_SECRET is not configured' },
      { status: 500 }
    )
  }

  const provided = readWorkerSecret(request)
  if (!provided || provided !== expected) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const processed = await processQueuedEmailDeliveries(parseLimit(request))
    return NextResponse.json({ ok: true, processed })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Worker execution failed'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
