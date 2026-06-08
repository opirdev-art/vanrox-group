import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { BlogArticle } from '@/components/content/blog-article'
import {
  getPublishedBlogPostBySlug,
  getPublishedBlogSlugs,
  incrementBlogViewCount,
} from '@/lib/blog/queries'

export async function generateStaticParams() {
  try {
    const slugs = await getPublishedBlogSlugs()
    return slugs.map((slug) => ({ slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  try {
    const post = await getPublishedBlogPostBySlug(slug)
    if (!post) return {}
    return {
      title: `${post.title} | VANROX Insights`,
      description: post.excerpt ?? undefined,
      openGraph: {
        title: post.title,
        description: post.excerpt ?? undefined,
        images: post.cover_image_url ? [post.cover_image_url] : [],
      },
    }
  } catch {
    return {}
  }
}

export default async function InsightArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  let post: Awaited<ReturnType<typeof getPublishedBlogPostBySlug>> = null
  try {
    post = await getPublishedBlogPostBySlug(slug)
  } catch {
    post = null
  }

  if (!post) notFound()

  // Fire-and-forget view count increment
  void incrementBlogViewCount(post.id)

  return (
    <BlogArticle
      data={{
        title: post.title,
        excerpt: post.excerpt,
        body: post.body,
        coverImageUrl: post.cover_image_url,
        coverAlt: post.cover_alt,
        authorName: post.author_name,
        publishedAt: post.published_at,
        category: post.category,
        tags: post.tags,
      }}
    />
  )
}
