'use server'

import { revalidatePath } from 'next/cache'
import { logNotifyFailure } from '@/lib/notifications/log-notify-failure'
import { notify } from '@/lib/notifications/orchestrator'
import { createClient } from '@/utils/supabase/server'
import type { ReviewActionResult } from './types'

export async function submitReview(formData: FormData): Promise<ReviewActionResult> {
  const authorName = String(formData.get('author_name') ?? '').trim()
  const ratingRaw = Number(formData.get('rating') ?? 0)
  const body = String(formData.get('body') ?? '').trim()

  if (!authorName || authorName.length < 2) {
    return { ok: false, error: 'Please enter your full name.' }
  }
  if (!Number.isInteger(ratingRaw) || ratingRaw < 1 || ratingRaw > 5) {
    return { ok: false, error: 'Please select a star rating.' }
  }
  if (!body || body.length < 20) {
    return { ok: false, error: 'Review must be at least 20 characters.' }
  }
  if (body.length > 2000) {
    return { ok: false, error: 'Review must be under 2000 characters.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      author_name: authorName,
      rating: ratingRaw,
      body,
      source: 'site',
      approved: false,
    })
    .select('id')
    .single()

  if (error || !data) {
    return { ok: false, error: 'Could not submit your review. Please try again.' }
  }

  const reviewId = String(data.id)
  const notifyResult = await notify({
    eventId: crypto.randomUUID(),
    eventType: 'business.review.submitted',
    occurredAt: new Date().toISOString(),
    actorId: null,
    aggregateId: reviewId,
    source: 'server_action',
    sourceEventKey: `review:${reviewId}`,
    payload: {
      reviewId,
      authorName,
      rating: ratingRaw,
      bodyPreview: body.length > 160 ? `${body.slice(0, 157)}…` : body,
    },
  })

  logNotifyFailure('review submission notification failed', notifyResult, { reviewId })

  revalidatePath('/')
  revalidatePath('/reviews')
  revalidatePath('/admin/reviews')
  return { ok: true }
}
