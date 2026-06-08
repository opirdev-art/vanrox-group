'use client'

import { useState } from 'react'
import { CaseStudyArticle } from '@/components/content/case-study-article'
import type { CaseStudyArticleData } from '@/components/content/case-study-article'

type StudioPreviewProps = {
  open: boolean
  onClose: () => void
  data: CaseStudyArticleData
}

export function StudioPreview({ open, onClose, data }: StudioPreviewProps) {
  const [mode, setMode] = useState<'desktop' | 'mobile'>('desktop')

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="min-h-full flex flex-col">
          {/* Header bar */}
          <div className="sticky top-0 z-10 bg-navy-mid border-b border-white/8 px-6 py-3 flex items-center gap-4 shrink-0">
            <span className="font-barlow-condensed text-sm uppercase tracking-[2px] text-green">
              Preview
            </span>
            <span className="text-xs text-gray">/services/{data.service.slug}/…</span>

            <div className="ml-auto flex items-center gap-3">
              <div className="flex rounded overflow-hidden border border-white/10">
                <button
                  type="button"
                  onClick={() => setMode('desktop')}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${mode === 'desktop' ? 'bg-green/20 text-green' : 'text-gray hover:text-white'}`}
                >
                  Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setMode('mobile')}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${mode === 'mobile' ? 'bg-green/20 text-green' : 'text-gray hover:text-white'}`}
                >
                  Mobile
                </button>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-gray hover:text-white text-xl leading-none ml-2"
              >
                ×
              </button>
            </div>
          </div>

          {/* Preview content — uses the exact same component as the public page */}
          <div className={`flex-1 ${mode === 'mobile' ? 'max-w-[420px] mx-auto w-full' : 'w-full'}`}>
            {data.body || data.title ? (
              <CaseStudyArticle data={data} preview />
            ) : (
              <div className="flex items-center justify-center h-48 text-gray text-sm">
                Add content in the editor to preview.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
