import Link from 'next/link'
import { ArrowRight, Calendar, User } from 'lucide-react'
import { getPublishedBlogPosts, getAllBlogCategories } from '@/lib/blog/queries'
import type { BlogPostSummary } from '@/lib/blog/types'

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>
}) {
  const { category: categorySlug, page: pageStr } = await searchParams
  const page = Math.max(1, Number(pageStr) || 1)

  const [{ posts, total }, categories] = await Promise.all([
    getPublishedBlogPosts({ categorySlug, page, limit: 9 }).catch(() => ({ posts: [], total: 0 })),
    getAllBlogCategories().catch(() => []),
  ])

  const totalPages = Math.ceil(total / 9)

  return (
    <div className="bg-navy min-h-screen">
      <section className="px-6 py-24 md:px-15 max-w-7xl mx-auto">
        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2.5 font-barlow-condensed text-[0.75rem] font-semibold tracking-[3px] uppercase text-green mb-4">
            <span className="block w-6 h-[0.5px] bg-green" />
            Land Insights
          </div>
          <h1 className="font-bebas text-4xl md:text-6xl tracking-[4px] leading-none text-white mb-6">
            Expert <span className="text-green">Knowledge</span> for Landowners
          </h1>
          <p className="text-gray text-[1.1rem] max-w-2xl font-light">
            Stay informed with the latest articles on surveying, land development, and regulatory compliance in Trinidad &amp; Tobago.
          </p>
        </div>

        {/* ── Category filter ────────────────────────────────────────── */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            <Link
              href="/insights"
              className={`px-4 py-2 rounded-sm font-barlow-condensed text-[0.7rem] font-bold tracking-widest uppercase transition-colors ${
                !categorySlug ? 'bg-green text-navy' : 'border border-white/10 text-gray hover:text-white'
              }`}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/insights?category=${cat.slug}`}
                className={`px-4 py-2 rounded-sm font-barlow-condensed text-[0.7rem] font-bold tracking-widest uppercase transition-colors ${
                  categorySlug === cat.slug ? 'bg-green text-navy' : 'border border-white/10 text-gray hover:text-white'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        {/* ── Post grid ────────────────────────────────────────────────── */}
        {posts.length === 0 ? (
          <div className="py-24 text-center text-gray">
            No articles published yet. Check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {/* ── Pagination ────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-3 mt-14">
            {page > 1 && (
              <Link
                href={`/insights?${categorySlug ? `category=${categorySlug}&` : ''}page=${page - 1}`}
                className="px-5 py-2 border border-white/10 text-gray hover:text-white rounded-sm text-sm uppercase tracking-widest font-barlow-condensed font-bold"
              >
                ← Prev
              </Link>
            )}
            <span className="px-5 py-2 text-gray text-sm">
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`/insights?${categorySlug ? `category=${categorySlug}&` : ''}page=${page + 1}`}
                className="px-5 py-2 border border-white/10 text-gray hover:text-white rounded-sm text-sm uppercase tracking-widest font-barlow-condensed font-bold"
              >
                Next →
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

function PostCard({ post }: { post: BlogPostSummary }) {
  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-TT', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null

  return (
    <article className="bg-navy-light border border-white/5 rounded-lg overflow-hidden flex flex-col hover:border-green/20 transition-all group">
      <div className="aspect-video bg-navy-mid relative overflow-hidden">
        {post.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-green/10 font-bebas text-4xl tracking-widest">
            VANROX
          </div>
        )}
        {post.category && (
          <div className="absolute top-4 left-4 bg-green text-navy px-3 py-1 font-barlow-condensed text-[0.7rem] font-bold tracking-wider uppercase rounded-sm">
            {post.category.name}
          </div>
        )}
      </div>

      <div className="p-8 flex-grow flex flex-col">
        <div className="flex items-center gap-4 text-gray text-[0.75rem] mb-4">
          {formattedDate && (
            <div className="flex items-center gap-1.5">
              <Calendar size={13} />
              {formattedDate}
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <User size={13} />
            {post.author_name}
          </div>
        </div>

        <h3 className="font-barlow-condensed text-xl font-bold tracking-wide text-white mb-4 group-hover:text-green transition-colors leading-tight line-clamp-2">
          <Link href={`/insights/${post.slug}`}>{post.title}</Link>
        </h3>

        {post.excerpt && (
          <p className="text-gray text-[0.9rem] leading-relaxed mb-6 font-light flex-grow line-clamp-3">
            {post.excerpt}
          </p>
        )}

        <Link
          href={`/insights/${post.slug}`}
          className="mt-auto text-green text-[0.85rem] font-bold tracking-widest uppercase flex items-center gap-2 hover:gap-3 transition-all"
        >
          Read Article <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  )
}
