import { getAllReviewsForAdmin } from '@/lib/reviews/queries'
import type { Review } from '@/lib/reviews/types'
import { ReviewModerationList } from './components/review-moderation-list'

export default async function AdminReviewsPage() {
  let reviews: Review[] = []
  let loadError: string | null = null

  try {
    reviews = await getAllReviewsForAdmin()
  } catch (e) {
    loadError = e instanceof Error ? e.message : 'Failed to load reviews.'
  }

  const pending = reviews.filter((r) => !r.approved && r.source === 'site')
  const approved = reviews.filter((r) => r.approved)

  return (
    <div className="space-y-10">
      <header className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <h1 className="font-bebas text-4xl tracking-[3px] text-white">Reviews</h1>
          <p className="text-gray font-light mt-1">
            Moderate client review submissions.
          </p>
        </div>
      </header>

      {loadError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
          {loadError}
        </div>
      )}

      {/* Pending */}
      <section>
        <h2 className="font-barlow-condensed text-[0.75rem] font-bold tracking-[3px] uppercase text-green mb-4 flex items-center gap-2">
          Awaiting Approval
          {pending.length > 0 && (
            <span className="bg-green text-navy text-[0.65rem] font-bold rounded-full px-2 py-0.5">
              {pending.length}
            </span>
          )}
        </h2>
        {pending.length === 0 ? (
          <p className="text-gray/50 text-sm py-6 text-center border border-white/5 rounded-lg">
            No pending reviews.
          </p>
        ) : (
          <ReviewModerationList reviews={pending} mode="pending" />
        )}
      </section>

      {/* Approved */}
      <section>
        <h2 className="font-barlow-condensed text-[0.75rem] font-bold tracking-[3px] uppercase text-green mb-4">
          Published ({approved.length})
        </h2>
        {approved.length === 0 ? (
          <p className="text-gray/50 text-sm py-6 text-center border border-white/5 rounded-lg">
            No published reviews yet.
          </p>
        ) : (
          <ReviewModerationList reviews={approved} mode="approved" />
        )}
      </section>
    </div>
  )
}
