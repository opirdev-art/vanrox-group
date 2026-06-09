export type ReviewSource = 'site' | 'google'

export type Review = {
  id: number
  author_name: string
  rating: number
  body: string
  source: ReviewSource
  google_review_id: string | null
  approved: boolean
  created_at: string
  updated_at: string
}

export type ReviewInsert = {
  author_name: string
  rating: number
  body: string
  source?: ReviewSource
  google_review_id?: string | null
  approved?: boolean
}

export type ReviewActionResult = { ok: true } | { ok: false; error: string }
