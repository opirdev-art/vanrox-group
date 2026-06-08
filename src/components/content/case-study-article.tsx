import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import './case-study-body.css'

export type CaseStudyArticleData = {
  title: string
  summary?: string | null
  body?: string | null
  coverImageUrl?: string | null
  clientName?: string | null
  location?: string | null
  outcome?: string | null
  tags?: string[]
  service: { id: number; name: string; slug: string }
}

type CaseStudyArticleProps = {
  data: CaseStudyArticleData
  /** In preview mode the back/book links are suppressed */
  preview?: boolean
}

export function CaseStudyArticle({ data, preview = false }: CaseStudyArticleProps) {
  const { title, summary, body, coverImageUrl, clientName, location, outcome, service } = data

  const meta = [clientName, location].filter(Boolean).join(' · ')

  return (
    <article className="bg-navy min-h-screen">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="px-6 py-12 md:px-15 border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          {!preview && (
            <nav className="text-xs text-gray uppercase tracking-widest mb-6 flex flex-wrap gap-2 items-center">
              <Link href="/services" className="hover:text-green">
                Services
              </Link>
              <span>/</span>
              <Link href={`/services/${service.slug}`} className="hover:text-green">
                {service.name}
              </Link>
              <span>/</span>
              <span className="text-white">{title}</span>
            </nav>
          )}

          <h1 className="font-bebas text-4xl md:text-5xl tracking-[3px] text-white leading-tight">
            {title || 'Untitled'}
          </h1>

          {meta && (
            <p className="text-gray mt-4 uppercase tracking-widest text-sm">{meta}</p>
          )}

          {outcome && (
            <span className="inline-block mt-4 text-sm bg-green/10 text-green px-3 py-1.5 rounded">
              {outcome}
            </span>
          )}
        </div>
      </header>

      {/* ── Cover image ─────────────────────────────────────────────────── */}
      {coverImageUrl && (
        <div className="max-w-5xl mx-auto px-6 md:px-15">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverImageUrl}
            alt={title}
            className="w-full max-h-[32rem] object-cover rounded-lg border border-white/10 mt-8"
          />
        </div>
      )}

      {/* ── Article body ────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 md:px-15 py-12 space-y-10">
        {summary && (
          <p className="text-lg text-gray leading-relaxed border-l-2 border-green pl-6">
            {summary}
          </p>
        )}

        {body && (
          /* cs-body styles are in case-study-body.css — same in preview and public page */
          <div
            className="cs-body"
            dangerouslySetInnerHTML={{ __html: body }}
          />
        )}

        {!preview && (
          <div className="pt-8 border-t border-white/5 flex flex-wrap gap-4">
            <Link
              href={`/services/${service.slug}`}
              className="inline-flex items-center gap-2 text-sm text-gray hover:text-green uppercase tracking-widest"
            >
              <ArrowLeft size={16} /> Back to {service.name}
            </Link>
            <Link
              href={`/schedule?service=${service.id}`}
              className="inline-flex items-center gap-2 bg-green text-navy px-6 py-3 font-barlow-condensed font-bold tracking-widest uppercase text-sm rounded-sm hover:opacity-90 ml-auto"
            >
              Book consultation <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </article>
  )
}
