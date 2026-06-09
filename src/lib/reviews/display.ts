import { getApprovedReviews, getApprovedReviewsPaginated } from './queries'
import type { Review } from './types'
import type { ReviewCardItem } from '@/components/reviews/ReviewCard'

export const FALLBACK_REVIEWS: Omit<
  Review,
  'id' | 'source' | 'google_review_id' | 'approved' | 'updated_at'
>[] = [
  {
    author_name: 'Anton Edwards',
    rating: 5,
    body: 'Very professional and knowledgeable surveyor. He understands the system, follows up on submissions, and provides relevant advice. Totally satisfied!',
    created_at: '2025-08-01T00:00:00Z',
  },
  {
    author_name: 'Tyler Graham',
    rating: 5,
    body: 'They were very professional and explained every step to us as we went along. They were affordable and highly communicative. Would recommend to anyone looking for surveying services.',
    created_at: '2024-06-01T00:00:00Z',
  },
  {
    author_name: 'Avi James',
    rating: 5,
    body: 'EXTREMELY professional and accommodating. The quality of service received was beyond my expectation. Will recommend this business to anyone! All the best in future endeavors!',
    created_at: '2024-05-01T00:00:00Z',
  },
  {
    author_name: 'De Vaughn Grant',
    rating: 5,
    body: 'Greatly impressed with the warmth and willingness of Mr. Mottley and his team. Contacted them to do a cadastral for a plot of land in a residential area. The guys were pleasant, cooperative and thorough.',
    created_at: '2024-04-01T00:00:00Z',
  },
  {
    author_name: 'Marie Miller',
    rating: 5,
    body: 'I cannot sing the praises of this company enough. They are efficient, cost effective, genuine, and produce a product that exceeds competitors. In speaking with the owner, I discovered that this level of excellence is multi-generational.',
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    author_name: 'Omarie Quashie',
    rating: 5,
    body: 'This organization is very reliable and they went the extra mile to provide excellent customer service to my family and I. They handled my business in a professional and timely manner. I would recommend this company to anyone.',
    created_at: '2025-02-01T00:00:00Z',
  },
  {
    author_name: 'Ann Phillips',
    rating: 5,
    body: 'My experience with VANROX was very smooth professional done and an easy process. First was communication. The process and requirements were clearly stated this made me very comfortable. Next was punctuality. On the two visits to my property they were on time and thorough.',
    created_at: '2024-03-01T00:00:00Z',
  },
  {
    author_name: 'Abby Alex Dick',
    rating: 5,
    body: 'The service I received from Mr MOTTLEY was timely, impeccable and done in excellence. 5 star performance. Will recommend to anyone any day.',
    created_at: '2024-02-01T00:00:00Z',
  },
  {
    author_name: 'Joanne Jack',
    rating: 5,
    body: '5 Starr service. Professional, Honest and Reliable.',
    created_at: '2024-01-01T00:00:00Z',
  },
]

export async function getDisplayReviews(limit?: number): Promise<ReviewCardItem[]> {
  let dbReviews: Review[] = []
  try {
    dbReviews = await getApprovedReviews()
  } catch {
    dbReviews = []
  }

  const items: ReviewCardItem[] =
    dbReviews.length > 0
      ? dbReviews.map((r) => ({ ...r, id: r.id }))
      : FALLBACK_REVIEWS.map((r, i) => ({ ...r, id: `fallback-${i}` }))

  return limit ? items.slice(0, limit) : items
}

export const REVIEWS_PAGE_SIZE = 9

export async function getPaginatedDisplayReviews(page = 1): Promise<{
  reviews: ReviewCardItem[]
  total: number
  totalPages: number
  page: number
}> {
  let dbReviews: Review[] = []
  let total = 0

  try {
    const result = await getApprovedReviewsPaginated({ page, limit: REVIEWS_PAGE_SIZE })
    dbReviews = result.reviews
    total = result.total
  } catch {
    dbReviews = []
    total = 0
  }

  if (total > 0) {
    const totalPages = Math.ceil(total / REVIEWS_PAGE_SIZE)
    return {
      reviews: dbReviews.map((r) => ({ ...r, id: r.id })),
      total,
      totalPages,
      page: Math.min(Math.max(1, page), totalPages),
    }
  }

  const fallback = FALLBACK_REVIEWS.map((r, i) => ({ ...r, id: `fallback-${i}` }))
  const totalPages = Math.ceil(fallback.length / REVIEWS_PAGE_SIZE)
  const safePage = Math.min(Math.max(1, page), totalPages || 1)
  const offset = (safePage - 1) * REVIEWS_PAGE_SIZE

  return {
    reviews: fallback.slice(offset, offset + REVIEWS_PAGE_SIZE),
    total: fallback.length,
    totalPages,
    page: safePage,
  }
}
