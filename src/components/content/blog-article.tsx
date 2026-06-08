import Link from 'next/link'
import { Calendar, User, ArrowLeft, Tag } from 'lucide-react'
import './case-study-body.css'

export type BlogArticleData = {
  title: string
  excerpt?: string | null
  body?: string | null
  coverImageUrl?: string | null
  coverAlt?: string | null
  authorName?: string
  publishedAt?: string | null
  category?: { name: string; slug: string } | null
  tags?: string[]
}

type BlogArticleProps = {
  data: BlogArticleData
  /** In preview mode the breadcrumb nav is suppressed */
  preview?: boolean
}

export function BlogArticle({ data, preview = false }: BlogArticleProps) {
  const {
    title,
    excerpt,
    body,
    coverImageUrl,
    coverAlt,
    authorName = 'VANROX',
    publishedAt,
    category,
    tags,
  } = data

  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString('en-TT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <article className="bg-navy min-h-screen">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="px-6 py-16 md:px-15 border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          {!preview && (
            <nav className="text-xs text-gray uppercase tracking-widest mb-8 flex flex-wrap gap-2 items-center">
              <Link href="/insights" className="hover:text-green">
                Insights
              </Link>
              {category && (
                <>
                  <span>/</span>
                  <Link href={`/insights?category=${category.slug}`} className="hover:text-green">
                    {category.name}
                  </Link>
                </>
              )}
            </nav>
          )}

          {category && (
            <span className="inline-block mb-4 text-[0.65rem] font-bold tracking-[2px] uppercase bg-green text-navy px-3 py-1 rounded-sm">
              {category.name}
            </span>
          )}

          <h1 className="font-bebas text-4xl md:text-6xl tracking-[3px] text-white leading-tight">
            {title || 'Untitled'}
          </h1>

          {excerpt && (
            <p className="mt-5 text-lg text-gray leading-relaxed max-w-2xl">
              {excerpt}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-gray">
            <div className="flex items-center gap-1.5">
              <User size={14} className="text-green" />
              {authorName}
            </div>
            {formattedDate && (
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-green" />
                {formattedDate}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Cover image ─────────────────────────────────────────────────── */}
      {coverImageUrl && (
        <div className="max-w-5xl mx-auto px-6 md:px-15">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverImageUrl}
            alt={coverAlt || title}
            className="w-full max-h-[32rem] object-cover rounded-lg border border-white/10 mt-8"
          />
        </div>
      )}

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-6 md:px-15 py-12">
        {body ? (
          <div className="cs-body" dangerouslySetInnerHTML={{ __html: body }} />
        ) : (
          preview && (
            <p className="text-gray/50 italic">Write your article to see it previewed here.</p>
          )
        )}

        {/* ── Tags ────────────────────────────────────────────────────── */}
        {tags && tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-white/5 flex flex-wrap items-center gap-2">
            <Tag size={14} className="text-gray/50" />
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2.5 py-1 rounded bg-white/5 text-gray border border-white/8 font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* ── Back link ───────────────────────────────────────────────── */}
        {!preview && (
          <div className="mt-10 pt-8 border-t border-white/5">
            <Link
              href="/insights"
              className="inline-flex items-center gap-2 text-sm text-gray hover:text-green uppercase tracking-widest"
            >
              <ArrowLeft size={16} /> Back to Insights
            </Link>
          </div>
        )}
      </div>
    </article>
  )
}
