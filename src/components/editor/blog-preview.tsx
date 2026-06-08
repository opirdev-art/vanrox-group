'use client'

import { useState } from 'react'
import { BlogArticle } from '@/components/content/blog-article'
import type { BlogArticleData } from '@/components/content/blog-article'

type BlogPreviewProps = {
  open: boolean
  onClose: () => void
  data: BlogArticleData
  slug?: string
}

export function BlogPreview({ open, onClose, data, slug }: BlogPreviewProps) {
  const [mode, setMode] = useState<'desktop' | 'mobile'>('desktop')

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />

      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="min-h-full flex flex-col">
          {/* Header bar */}
          <div className="sticky top-0 z-10 bg-navy-mid border-b border-white/8 px-6 py-3 flex items-center gap-4 shrink-0">
            <span className="font-barlow-condensed text-sm uppercase tracking-[2px] text-green">Preview</span>
            {slug && (
              <span className="text-xs text-gray">/insights/{slug}</span>
            )}

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
              <button type="button" onClick={onClose} className="text-gray hover:text-white text-xl leading-none ml-2">×</button>
            </div>
          </div>

          {/* Preview — exact same component as the public page */}
          <div className={`flex-1 ${mode === 'mobile' ? 'max-w-[420px] mx-auto w-full' : 'w-full'}`}>
            {data.body || data.title ? (
              <BlogArticle data={data} preview />
            ) : (
              <div className="flex items-center justify-center h-48 text-gray text-sm">
                Add content to preview.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
