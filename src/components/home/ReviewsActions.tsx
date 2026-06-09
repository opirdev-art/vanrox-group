'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AGGREGATE_RATING, GOOGLE_MAPS_URL } from '@/lib/reviews/constants'
import ReviewModal from './ReviewModal'

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

export default function ReviewsActions() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
        <Link
          href={GOOGLE_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2.5 min-h-11 bg-green text-navy px-6 sm:px-8 py-3.5 sm:py-4 font-barlow-condensed text-[0.85rem] sm:text-[0.9rem] font-bold tracking-[2px] uppercase rounded-sm hover:bg-green/80 hover:-translate-y-0.5 transition-all shadow-[0_0_30px_rgba(125,194,66,0.2)]"
        >
          <GoogleLogo />
          View All {AGGREGATE_RATING.count} on Google
        </Link>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center min-h-11 border border-green/40 text-white px-6 sm:px-8 py-3.5 sm:py-4 font-barlow-condensed text-[0.85rem] sm:text-[0.9rem] font-semibold tracking-[2px] uppercase rounded-sm hover:border-green hover:bg-green/10 hover:-translate-y-0.5 transition-all"
        >
          Leave a Review
        </button>
      </div>

      <ReviewModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
