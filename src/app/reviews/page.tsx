import type { Metadata } from 'next'
import Link from 'next/link'
import { AGGREGATE_RATING } from '@/lib/reviews/constants'
import { getPaginatedDisplayReviews } from '@/lib/reviews/display'
import { GoogleRatingBadge, ReviewCard } from '@/components/reviews/ReviewCard'
import ReviewsActions from '@/components/home/ReviewsActions'

export const metadata: Metadata = {
  title: 'Client Reviews & Testimonials | VANROX Engineering TT',
  description:
    'Read client reviews and testimonials for VANROX Engineering and Surveying Services in Trinidad & Tobago. 4.9★ on Google with 30+ reviews. Leave your own review.',
  alternates: {
    canonical: 'https://www.vanrox-group.com/reviews',
  },
  openGraph: {
    title: 'Client Reviews & Testimonials | VANROX Engineering TT',
    description:
      'Trusted by landowners and developers across Trinidad & Tobago. Read what clients say about VANROX surveying and engineering services.',
    url: 'https://www.vanrox-group.com/reviews',
  },
}

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageStr } = await searchParams
  const page = Math.max(1, Number(pageStr) || 1)
  const { reviews, total, totalPages, page: currentPage } = await getPaginatedDisplayReviews(page)

  return (
    <div className="bg-navy min-h-screen">
      <section className="px-6 py-16 sm:py-24 md:px-15 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-14">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2.5 font-barlow-condensed text-[0.75rem] font-semibold tracking-[3px] uppercase text-green mb-4">
              <span className="block w-6 h-[0.5px] bg-green" aria-hidden="true" />
              Testimonials
            </div>
            <h1 className="font-bebas text-4xl sm:text-5xl md:text-6xl tracking-[3px] leading-none text-white mb-5">
              Client <span className="text-green">Reviews</span>
            </h1>
            <p className="text-gray text-[1rem] sm:text-[1.05rem] font-light leading-relaxed">
              Real feedback from clients across Trinidad &amp; Tobago. Rated{' '}
              {AGGREGATE_RATING.value} out of 5 on Google with {AGGREGATE_RATING.count} reviews.
              {total > 0 && (
                <span className="block mt-2 text-gray/70 text-[0.9rem]">
                  {total} testimonial{total !== 1 ? 's' : ''} on this site
                </span>
              )}
            </p>
          </div>
          <GoogleRatingBadge />
        </div>

        {reviews.length === 0 ? (
          <div className="py-24 text-center text-gray">
            No reviews published yet. Be the first to share your experience.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-14">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex flex-wrap justify-center items-center gap-3 mb-10 sm:mb-14">
            {currentPage > 1 && (
              <Link
                href={`/reviews?page=${currentPage - 1}`}
                className="inline-flex items-center min-h-11 px-5 border border-white/10 text-gray hover:text-white rounded-sm text-sm uppercase tracking-widest font-barlow-condensed font-bold"
              >
                ← Prev
              </Link>
            )}
            <span className="px-5 py-2 text-gray text-sm">
              Page {currentPage} of {totalPages}
            </span>
            {currentPage < totalPages && (
              <Link
                href={`/reviews?page=${currentPage + 1}`}
                className="inline-flex items-center min-h-11 px-5 border border-white/10 text-gray hover:text-white rounded-sm text-sm uppercase tracking-widest font-barlow-condensed font-bold"
              >
                Next →
              </Link>
            )}
          </div>
        )}

        <div className="flex justify-center">
          <ReviewsActions />
        </div>
      </section>
    </div>
  )
}
