import { createClient } from '@/utils/supabase/server'
import type {
  BlogCategoryRecord,
  BlogPostRecord,
  BlogPostSummary,
  BlogPostWithCategory,
  BlogStatus,
} from './types'

// ── Mappers ──────────────────────────────────────────────────────────────────

function mapCategory(row: {
  id: number
  name: string
  slug: string
  created_at: string
}): BlogCategoryRecord {
  return { id: row.id, name: row.name, slug: row.slug, created_at: row.created_at }
}

function mapPost(row: {
  id: number
  title: string
  slug: string
  excerpt: string | null
  body: string | null
  cover_image_url: string | null
  cover_alt: string | null
  author_name: string
  category_id: number | null
  tags: string[] | null
  status: string
  published_at: string | null
  view_count: number
  created_at: string
  updated_at: string
}): BlogPostRecord {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    body: row.body,
    cover_image_url: row.cover_image_url,
    cover_alt: row.cover_alt,
    author_name: row.author_name,
    category_id: row.category_id,
    tags: row.tags ?? [],
    status: (row.status as BlogStatus) || 'draft',
    published_at: row.published_at,
    view_count: row.view_count,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

// ── Categories ────────────────────────────────────────────────────────────────

export async function getAllBlogCategories(): Promise<BlogCategoryRecord[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('blog_categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []).map(mapCategory)
}

// ── Admin queries (sees all statuses) ────────────────────────────────────────

export async function getBlogPostsForAdmin(opts?: {
  q?: string
  status?: BlogStatus | 'all'
  categoryId?: number
  page?: number
  limit?: number
}): Promise<{ posts: BlogPostSummary[]; total: number }> {
  const supabase = await createClient()
  const page = opts?.page ?? 1
  const limit = opts?.limit ?? 20
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('blog_posts')
    .select(
      `id, title, slug, excerpt, cover_image_url, author_name, category_id,
       tags, status, published_at, view_count, updated_at,
       blog_categories!blog_posts_category_id_fkey(id, name, slug)`,
      { count: 'exact' }
    )
    .order('updated_at', { ascending: false })
    .range(from, to)

  if (opts?.status && opts.status !== 'all') {
    query = query.eq('status', opts.status)
  }
  if (opts?.categoryId) {
    query = query.eq('category_id', opts.categoryId)
  }
  if (opts?.q) {
    query = query.ilike('title', `%${opts.q}%`)
  }

  const { data, error, count } = await query
  if (error) throw new Error(error.message)

  const posts: BlogPostSummary[] = (data ?? []).map((row) => {
    const rawCat = row.blog_categories as unknown
    const cat = Array.isArray(rawCat)
      ? (rawCat[0] as { id: number; name: string; slug: string } | undefined) ?? null
      : (rawCat as { id: number; name: string; slug: string } | null)
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      cover_image_url: row.cover_image_url,
      author_name: row.author_name,
      category: cat ?? null,
      tags: row.tags ?? [],
      status: (row.status as BlogStatus) || 'draft',
      published_at: row.published_at,
      view_count: row.view_count,
      updated_at: row.updated_at,
    }
  })

  return { posts, total: count ?? 0 }
}

export async function getBlogPostForAdmin(
  id: number
): Promise<BlogPostWithCategory | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`*, blog_categories!blog_posts_category_id_fkey(id, name, slug, created_at)`)
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null

  const cat = data.blog_categories as {
    id: number; name: string; slug: string; created_at: string
  } | null

  return {
    ...mapPost(data),
    category: cat ? mapCategory(cat) : null,
  }
}

// ── Public queries (published only) ──────────────────────────────────────────

export async function getPublishedBlogPosts(opts?: {
  categorySlug?: string
  page?: number
  limit?: number
}): Promise<{ posts: BlogPostSummary[]; total: number }> {
  const supabase = await createClient()
  const page = opts?.page ?? 1
  const limit = opts?.limit ?? 12
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('blog_posts')
    .select(
      `id, title, slug, excerpt, cover_image_url, author_name, category_id,
       tags, status, published_at, view_count, updated_at,
       blog_categories!blog_posts_category_id_fkey(id, name, slug)`,
      { count: 'exact' }
    )
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(from, to)

  if (opts?.categorySlug) {
    query = query.eq('blog_categories.slug', opts.categorySlug)
  }

  const { data, error, count } = await query
  if (error) throw new Error(error.message)

  const posts: BlogPostSummary[] = (data ?? []).map((row) => {
    const rawCat = row.blog_categories as unknown
    const cat = Array.isArray(rawCat)
      ? (rawCat[0] as { id: number; name: string; slug: string } | undefined) ?? null
      : (rawCat as { id: number; name: string; slug: string } | null)
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      excerpt: row.excerpt,
      cover_image_url: row.cover_image_url,
      author_name: row.author_name,
      category: cat ?? null,
      tags: row.tags ?? [],
      status: (row.status as BlogStatus) || 'draft',
      published_at: row.published_at,
      view_count: row.view_count,
      updated_at: row.updated_at,
    }
  })

  return { posts, total: count ?? 0 }
}

export async function getPublishedBlogPostBySlug(
  slug: string
): Promise<BlogPostWithCategory | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`*, blog_categories!blog_posts_category_id_fkey(id, name, slug, created_at)`)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null

  const cat = data.blog_categories as {
    id: number; name: string; slug: string; created_at: string
  } | null

  return { ...mapPost(data), category: cat ? mapCategory(cat) : null }
}

export async function getPublishedBlogSlugs(): Promise<string[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('status', 'published')

  if (error) throw new Error(error.message)
  return (data ?? []).map((r) => r.slug)
}

/** Increment view count — called from a server action on article load */
export async function incrementBlogViewCount(id: number): Promise<void> {
  const supabase = await createClient()
  await supabase.rpc('increment_blog_view_count', { post_id: id }).maybeSingle()
}
