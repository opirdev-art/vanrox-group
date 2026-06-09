'use client'

import { useCallback, useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'
import ReviewForm from './ReviewForm'

type ReviewModalProps = {
  open: boolean
  onClose: () => void
}

export default function ReviewModal({ open, onClose }: ReviewModalProps) {
  const titleId = useId()
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (!open) return

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
    const focusTimer = window.setTimeout(() => closeButtonRef.current?.focus(), 0)

    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
      window.clearTimeout(focusTimer)
    }
  }, [open, handleKeyDown])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-navy/85 backdrop-blur-sm"
        aria-label="Close review form"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full sm:max-w-lg max-h-[92dvh] sm:max-h-[85dvh] overflow-y-auto bg-navy-light border-t sm:border border-green/20 rounded-t-2xl sm:rounded-xl shadow-2xl px-5 pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] sm:px-7 sm:py-7"
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="min-w-0 pr-2">
            <p className="font-barlow-condensed text-[0.7rem] font-semibold tracking-[3px] uppercase text-green mb-1">
              Share Your Experience
            </p>
            <h2
              id={titleId}
              className="font-bebas text-2xl sm:text-3xl tracking-[2px] leading-none text-white"
            >
              Leave a <span className="text-green">Review</span>
            </h2>
            <p className="text-gray text-[0.85rem] font-light mt-2 leading-relaxed">
              Your feedback helps others in Trinidad &amp; Tobago find trusted surveying services.
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 flex items-center justify-center min-h-11 min-w-11 rounded-sm border border-white/10 text-gray hover:text-white hover:border-green/30 transition-colors"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <ReviewForm onSuccess={onClose} />
      </div>
    </div>
  )
}
