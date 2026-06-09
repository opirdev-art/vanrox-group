import { AGGREGATE_RATING, GOOGLE_MAPS_URL } from '@/lib/reviews/constants'

function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5 shrink-0" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={i < count ? '#FBBC04' : 'none'}
          stroke={i < count ? '#FBBC04' : '#4a5568'}
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

function GoogleLogo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

export type ReviewCardItem = {
  id: string | number
  author_name: string
  rating: number
  body: string
  source?: string
}

export function ReviewCard({ review }: { review: ReviewCardItem }) {
  return (
    <article className="bg-navy border border-white/5 rounded-lg p-5 sm:p-6 flex flex-col gap-4 hover:border-green/20 transition-all h-full">
      <svg width="28" height="20" viewBox="0 0 28 20" fill="none" aria-hidden="true" className="shrink-0 opacity-40">
        <path d="M0 20V12.5C0 5.833 3.167 1.667 9.5 0L11 2.5C8.5 3.333 7 5.333 6.5 8.5H11V20H0ZM17 20V12.5C17 5.833 20.167 1.667 26.5 0L28 2.5C25.5 3.333 24 5.333 23.5 8.5H28V20H17Z" fill="#7dc242" />
      </svg>
      <p className="text-off-white text-[0.88rem] leading-[1.8] font-light flex-1">{review.body}</p>
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/5">
        <div className="min-w-0">
          <div className="text-white text-[0.85rem] font-semibold truncate">{review.author_name}</div>
          {review.source === 'google' && (
            <div className="flex items-center gap-1 mt-0.5">
              <GoogleLogo />
              <span className="text-gray text-[0.7rem]">Google review</span>
            </div>
          )}
        </div>
        <Stars count={review.rating} />
      </div>
    </article>
  )
}

export function GoogleRatingBadge() {
  return (
    <a
      href={GOOGLE_MAPS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-5 py-3.5 hover:border-green/30 hover:bg-white/8 transition-all shrink-0 w-full sm:w-auto"
      aria-label={`${AGGREGATE_RATING.value} out of 5 on Google — ${AGGREGATE_RATING.count} reviews`}
    >
      <GoogleLogo />
      <div className="flex flex-col gap-0.5">
        <div className="flex items-baseline gap-1.5">
          <span className="font-bebas text-[1.6rem] text-white leading-none tracking-wide">
            {AGGREGATE_RATING.value}
          </span>
          <Stars count={5} />
        </div>
        <span className="text-gray text-[0.72rem] tracking-wide">
          {AGGREGATE_RATING.count} Google reviews
        </span>
      </div>
    </a>
  )
}
