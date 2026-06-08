export type BlogStatus = 'draft' | 'published' | 'archived'

export type BlogCategoryRecord = {
  id: number
  name: string
  slug: string
  created_at: string
}

export type BlogPostRecord = {
  id: number
  title: string
  slug: string
  excerpt: string | null
  body: string | null
  cover_image_url: string | null
  cover_alt: string | null
  author_name: string
  category_id: number | null
  tags: string[]
  status: BlogStatus
  published_at: string | null
  view_count: number
  created_at: string
  updated_at: string
}

export type BlogPostWithCategory = BlogPostRecord & {
  category: BlogCategoryRecord | null
}

/** Minimal type for list views */
export type BlogPostSummary = {
  id: number
  title: string
  slug: string
  excerpt: string | null
  cover_image_url: string | null
  author_name: string
  category: { id: number; name: string; slug: string } | null
  tags: string[]
  status: BlogStatus
  published_at: string | null
  view_count: number
  updated_at: string
}
