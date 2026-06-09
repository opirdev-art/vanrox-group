'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import { approveReviewById, deleteReviewById } from '@/lib/reviews/queries'
import type { ReviewActionResult } from '@/lib/reviews/types'

export async function approveReview(id: number): Promise<ReviewActionResult> {
  await requireAdmin()
  try {
    await approveReviewById(id)
    revalidatePath('/admin/reviews')
    revalidatePath('/')
    revalidatePath('/reviews')
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed to approve review.' }
  }
}

export async function deleteReview(id: number): Promise<ReviewActionResult> {
  await requireAdmin()
  try {
    await deleteReviewById(id)
    revalidatePath('/admin/reviews')
    revalidatePath('/')
    revalidatePath('/reviews')
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Failed to delete review.' }
  }
}
