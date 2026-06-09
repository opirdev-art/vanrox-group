import type { MetadataRoute } from 'next'

const BASE_URL = 'https://www.vanrox-group.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/services`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/reviews`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/insights`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/schedule`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  const serviceRoutes: MetadataRoute.Sitemap = await (async () => {
    try {
      const { getActiveServiceSlugs } = await import('@/lib/service-pages/queries')
      const slugs = await getActiveServiceSlugs()
      return slugs.map((slug) => ({
        url: `${BASE_URL}/services/${slug}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      }))
    } catch {
      return []
    }
  })()

  const blogRoutes: MetadataRoute.Sitemap = await (async () => {
    try {
      const { getPublishedBlogPosts } = await import('@/lib/blog/queries')
      const { posts } = await getPublishedBlogPosts({ limit: 500 })
      return posts.map((post) => ({
        url: `${BASE_URL}/insights/${post.slug}`,
        lastModified: post.published_at ? new Date(post.published_at) : now,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))
    } catch {
      return []
    }
  })()

  return [...staticRoutes, ...serviceRoutes, ...blogRoutes]
}
