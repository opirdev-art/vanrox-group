'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { submitReview } from '@/lib/reviews/actions'
import { GOOGLE_MAPS_URL } from '@/lib/reviews/constants'

function StarPicker({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const [hovered, setHovered] = useState(0)
  const active = hovered || value

  return (
    <div
      className="flex gap-1.5"
      role="radiogroup"
      aria-label="Star rating"
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          className="flex items-center justify-center min-h-11 min-w-11 p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-green rounded"
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill={star <= active ? '#FBBC04' : 'none'}
            stroke={star <= active ? '#FBBC04' : '#4a5568'}
            strokeWidth="1.5"
            className="transition-colors"
            aria-hidden="true"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

type Status = 'idle' | 'submitting' | 'success' | 'error'

type ReviewFormProps = {
  onSuccess?: () => void
}

export default function ReviewForm({ onSuccess }: ReviewFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [rating, setRating] = useState(0)
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === 'submitting') return

    if (rating < 1) {
      setStatus('error')
      setErrorMsg('Please select a star rating.')
      return
    }

    const fd = new FormData(e.currentTarget)
    fd.set('rating', String(rating))

    setStatus('submitting')
    setErrorMsg('')

    const result = await submitReview(fd)

    if ('error' in result) {
      setStatus('error')
      setErrorMsg(result.error)
      return
    }

    setStatus('success')
    formRef.current?.reset()
    setRating(0)
  }

  if (status === 'success') {
    return (
      <div className="bg-green/5 border border-green/20 rounded-xl p-6 sm:p-8 text-center">
        <div className="text-3xl mb-3" aria-hidden="true">✓</div>
        <h3 className="font-bebas text-2xl tracking-[3px] text-white mb-2">
          Thank You!
        </h3>
        <p className="text-gray text-[0.9rem] leading-relaxed mb-6">
          Your review has been submitted and will appear on the site once approved.
          Want to share it on Google too? It helps others find us.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center min-h-11 bg-green text-navy px-7 py-3.5 font-barlow-condensed text-[0.85rem] font-bold tracking-[2px] uppercase rounded-sm hover:bg-green/80 transition-all"
          >
            Also Post on Google
          </Link>
          {onSuccess && (
            <button
              type="button"
              onClick={onSuccess}
              className="inline-flex items-center justify-center min-h-11 border border-white/15 text-white px-7 py-3.5 font-barlow-condensed text-[0.85rem] font-semibold tracking-[2px] uppercase rounded-sm hover:border-green/40 transition-all"
            >
              Close
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <label
          htmlFor="review-name"
          className="block font-barlow-condensed text-[0.75rem] font-bold tracking-[2px] uppercase text-gray mb-2"
        >
          Your Name
        </label>
        <input
          id="review-name"
          name="author_name"
          type="text"
          required
          minLength={2}
          maxLength={80}
          autoComplete="name"
          placeholder="e.g. John Smith"
          className="w-full bg-navy border border-white/10 rounded-sm px-4 py-3.5 text-white placeholder:text-gray/40 text-base sm:text-[0.9rem] focus:outline-none focus:border-green/50 transition-colors"
        />
      </div>

      <div>
        <span className="block font-barlow-condensed text-[0.75rem] font-bold tracking-[2px] uppercase text-gray mb-2">
          Your Rating
        </span>
        <StarPicker value={rating} onChange={setRating} />
        <input type="hidden" name="rating" value={rating} />
      </div>

      <div>
        <label
          htmlFor="review-body"
          className="block font-barlow-condensed text-[0.75rem] font-bold tracking-[2px] uppercase text-gray mb-2"
        >
          Your Review
        </label>
        <textarea
          id="review-body"
          name="body"
          required
          minLength={20}
          maxLength={2000}
          rows={5}
          placeholder="Tell us about your experience with VANROX..."
          className="w-full bg-navy border border-white/10 rounded-sm px-4 py-3.5 text-white placeholder:text-gray/40 text-base sm:text-[0.9rem] focus:outline-none focus:border-green/50 transition-colors resize-none leading-relaxed"
        />
      </div>

      {status === 'error' && errorMsg && (
        <p className="text-red-400 text-[0.85rem]" role="alert">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full min-h-11 bg-green text-navy py-4 font-barlow-condensed text-[0.9rem] font-bold tracking-[2px] uppercase rounded-sm hover:bg-green/80 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'submitting' ? 'Submitting…' : 'Submit Review'}
      </button>

      <p className="text-gray/50 text-[0.75rem] text-center">
        Reviews are moderated before appearing on the site.
      </p>
    </form>
  )
}
