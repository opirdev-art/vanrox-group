import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin-client'
import type { Review, ReviewInsert } from './types'

const TABLE = 'reviews'

/** Public: returns all approved reviews, newest first. */
export async function getApprovedReviews(): Promise<Review[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as Review[]
}

/** Public: paginated approved reviews, newest first. */
export async function getApprovedReviewsPaginated({
  page = 1,
  limit = 9,
}: {
  page?: number
  limit?: number
}): Promise<{ reviews: Review[]; total: number }> {
  const supabase = await createClient()
  const safePage = Math.max(1, page)
  const offset = (safePage - 1) * limit

  const { data, error, count } = await supabase
    .from(TABLE)
    .select('*', { count: 'exact' })
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw new Error(error.message)
  return { reviews: (data ?? []) as Review[], total: count ?? 0 }
}

/** Admin: returns all reviews (approved + pending), newest first. */
export async function getAllReviewsForAdmin(): Promise<Review[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('approved', { ascending: true })   // pending first
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as Review[]
}

/** Admin: count of reviews awaiting approval. */
export async function getPendingReviewCount(): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from(TABLE)
    .select('*', { count: 'exact', head: true })
    .eq('approved', false)
    .eq('source', 'site')

  if (error) return 0
  return count ?? 0
}

/** Admin (service role): upsert Google reviews by google_review_id. */
export async function upsertGoogleReviews(reviews: ReviewInsert[]): Promise<number> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from(TABLE)
    .upsert(reviews, { onConflict: 'google_review_id', ignoreDuplicates: false })
    .select('id')

  if (error) throw new Error(error.message)
  return (data ?? []).length
}

/** Admin (service role): approve a review by id. */
export async function approveReviewById(id: number): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from(TABLE)
    .update({ approved: true })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

/** Admin (service role): delete a review by id. */
export async function deleteReviewById(id: number): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}
