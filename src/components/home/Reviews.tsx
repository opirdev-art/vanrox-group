import Link from 'next/link'
import { AGGREGATE_RATING } from '@/lib/reviews/constants'
import { getDisplayReviews } from '@/lib/reviews/display'
import { GoogleRatingBadge, ReviewCard } from '@/components/reviews/ReviewCard'
import ReviewsActions from './ReviewsActions'

const aggregateRatingSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'VANROX Engineering and Surveying Services',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: String(AGGREGATE_RATING.value),
    reviewCount: String(AGGREGATE_RATING.count),
    bestRating: '5',
    worstRating: '1',
  },
}

export default async function Reviews() {
  const displayReviews = await getDisplayReviews(6)

  return (
    <section
      id="reviews"
      className="px-6 py-16 sm:py-20 md:px-15 bg-navy-light border-t border-green/10"
      aria-labelledby="reviews-heading"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aggregateRatingSchema) }}
      />

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-2.5 font-barlow-condensed text-[0.75rem] font-semibold tracking-[3px] uppercase text-green mb-4">
              <span className="block w-6 h-[0.5px] bg-green" aria-hidden="true" />
              Client Reviews
            </div>
            <h2
              id="reviews-heading"
              className="font-bebas text-3xl sm:text-4xl md:text-5xl tracking-[3px] leading-none text-white"
            >
              What Our <span className="text-green">Clients</span> Say
            </h2>
          </div>
          <GoogleRatingBadge />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-8 sm:mb-10">
          {displayReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        <div className="flex flex-col items-center gap-4">
          <ReviewsActions />
          <Link
            href="/reviews"
            className="text-gray hover:text-green text-[0.8rem] font-barlow-condensed font-semibold tracking-[2px] uppercase transition-colors min-h-11 inline-flex items-center"
          >
            View all testimonials →
          </Link>
        </div>
      </div>
    </section>
  )
}
