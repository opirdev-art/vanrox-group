'use client'

import { useState, useTransition } from 'react'
import { Check, Trash2, Star } from 'lucide-react'
import type { Review } from '@/lib/reviews/types'
import { approveReview, deleteReview } from '../actions'

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={13}
          fill={i < rating ? '#FBBC04' : 'none'}
          stroke={i < rating ? '#FBBC04' : '#4a5568'}
        />
      ))}
    </div>
  )
}

function ReviewRow({
  review,
  mode,
}: {
  review: Review
  mode: 'pending' | 'approved'
}) {
  const [isPending, startTransition] = useTransition()
  const [removed, setRemoved] = useState(false)
  const [error, setError] = useState('')

  if (removed) return null

  function handleApprove() {
    startTransition(async () => {
      const result = await approveReview(review.id)
      if ('error' in result) { setError(result.error); return }
      setRemoved(true)
    })
  }

  function handleDelete() {
    if (!confirm('Remove this review? This cannot be undone.')) return
    startTransition(async () => {
      const result = await deleteReview(review.id)
      if ('error' in result) { setError(result.error); return }
      setRemoved(true)
    })
  }

  const date = new Date(review.created_at).toLocaleDateString('en-TT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div
      className={`bg-navy border rounded-lg p-5 transition-opacity ${
        isPending ? 'opacity-50' : 'opacity-100'
      } ${mode === 'pending' ? 'border-yellow-500/20' : 'border-white/5'}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-semibold text-[0.9rem]">{review.author_name}</span>
            <StarDisplay rating={review.rating} />
            {review.source === 'google' && (
              <span className="text-[0.65rem] font-bold tracking-wider uppercase bg-blue-500/15 text-blue-300 px-2 py-0.5 rounded">
                Google
              </span>
            )}
          </div>
          <span className="text-gray/50 text-[0.72rem]">{date}</span>
        </div>

        <div className="flex gap-2 shrink-0">
          {mode === 'pending' && (
            <button
              onClick={handleApprove}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 bg-green/10 border border-green/30 text-green px-3 py-1.5 rounded text-[0.75rem] font-bold tracking-wider uppercase hover:bg-green/20 transition-all disabled:opacity-50"
            >
              <Check size={13} />
              Approve
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-1.5 rounded text-[0.75rem] font-bold tracking-wider uppercase hover:bg-red-500/20 transition-all disabled:opacity-50"
          >
            <Trash2 size={13} />
            {mode === 'pending' ? 'Reject' : 'Remove'}
          </button>
        </div>
      </div>

      <p className="text-gray text-[0.85rem] leading-relaxed mt-3 line-clamp-4">{review.body}</p>

      {error && (
        <p className="text-red-400 text-[0.8rem] mt-2" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export function ReviewModerationList({
  reviews,
  mode,
}: {
  reviews: Review[]
  mode: 'pending' | 'approved'
}) {
  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <ReviewRow key={review.id} review={review} mode={mode} />
      ))}
    </div>
  )
}
