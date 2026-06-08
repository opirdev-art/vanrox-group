import type { ParseResult } from '@/lib/parse-result'
import type { BlogStatus } from './types'
import { slugifyServiceName } from '@/lib/services/slug'

export type BlogPostInput = {
  title: string
  slug: string
  excerpt?: string
  author_name: string
  category_id?: number | null
  tags: string[]
  cover_image_url?: string | null
  cover_alt?: string | null
  body?: string | null
  status: BlogStatus
}

function readString(v: unknown): string | undefined {
  return typeof v === 'string' ? v.trim() : undefined
}

function readNumber(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string') {
    const n = Number(v)
    if (Number.isFinite(n)) return n
  }
  return null
}

function asRecord(v: unknown): Record<string, unknown> | null {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return null
  return v as Record<string, unknown>
}

export function slugifyPost(title: string, existingSlug?: string): string {
  const base = existingSlug?.trim() || slugifyServiceName(title)
  return base || 'post'
}

export function parseBlogPostInput(input: unknown): ParseResult<BlogPostInput> {
  const row = asRecord(input)
  if (!row) return { ok: false, error: 'Invalid post data' }

  const title = readString(row.title) ?? ''
  if (title.length < 2) return { ok: false, error: 'Title must be at least 2 characters' }

  const rawSlug = readString(row.slug) ?? ''
  const slug = slugifyPost(title, rawSlug)

  const author_name = readString(row.author_name) || 'VANROX'

  const rawStatus = readString(row.status)
  const status: BlogStatus =
    rawStatus === 'published' || rawStatus === 'archived' ? rawStatus : 'draft'

  const tags = Array.isArray(row.tags)
    ? row.tags.flatMap((t) => {
        const s = readString(t)
        return s ? [s] : []
      })
    : []

  const categoryId = row.category_id != null ? readNumber(row.category_id) : null

  return {
    ok: true,
    data: {
      title,
      slug,
      excerpt: readString(row.excerpt) || undefined,
      author_name,
      category_id: categoryId,
      tags,
      cover_image_url: readString(row.cover_image_url) || null,
      cover_alt: readString(row.cover_alt) || null,
      body: readString(row.body) || null,
      status,
    },
  }
}
