'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import { createClient } from '@/utils/supabase/server'
import { parseBlogPostInput, slugifyPost } from '@/lib/blog/validation'
import type { ActionResult } from '@/lib/service-pages/action-result'

function revalidateBlogPaths(slug?: string) {
  revalidatePath('/admin/blog')
  revalidatePath('/insights')
  if (slug) revalidatePath(`/insights/${slug}`)
}

// ── Ensure slug uniqueness ───────────────────────────────────────────────────
async function ensureUniqueSlug(
  slug: string,
  excludeId?: number
): Promise<string> {
  const supabase = await createClient()
  let candidate = slug
  let attempt = 0

  while (true) {
    let q = supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', candidate)

    if (excludeId) q = q.neq('id', excludeId)

    const { data } = await q.maybeSingle()
    if (!data) return candidate

    attempt++
    candidate = `${slug}-${attempt}`
  }
}

// ── Create ───────────────────────────────────────────────────────────────────
export async function createBlogPost(input: unknown): Promise<ActionResult> {
  await requireAdmin()

  const parsed = parseBlogPostInput(input)
  if (parsed.ok === false) return { ok: false, error: parsed.error }

  const d = parsed.data
  const slug = await ensureUniqueSlug(slugifyPost(d.title, d.slug))
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      title: d.title,
      slug,
      excerpt: d.excerpt || null,
      body: d.body || null,
      cover_image_url: d.cover_image_url || null,
      cover_alt: d.cover_alt || null,
      author_name: d.author_name,
      category_id: d.category_id ?? null,
      tags: d.tags,
      status: d.status,
      published_at: d.status === 'published' ? new Date().toISOString() : null,
    })
    .select('id')
    .single()

  if (error) return { ok: false, error: error.message }

  revalidateBlogPaths(slug)
  return { ok: true, id: data.id }
}

// ── Update ───────────────────────────────────────────────────────────────────
export async function updateBlogPost(
  id: number,
  input: unknown,
  prevPublished: boolean
): Promise<ActionResult> {
  await requireAdmin()

  const parsed = parseBlogPostInput(input)
  if (parsed.ok === false) return { ok: false, error: parsed.error }

  const d = parsed.data
  const slug = await ensureUniqueSlug(slugifyPost(d.title, d.slug), id)
  const supabase = await createClient()

  const becomingPublished = !prevPublished && d.status === 'published'

  const { error } = await supabase
    .from('blog_posts')
    .update({
      title: d.title,
      slug,
      excerpt: d.excerpt || null,
      body: d.body || null,
      cover_image_url: d.cover_image_url || null,
      cover_alt: d.cover_alt || null,
      author_name: d.author_name,
      category_id: d.category_id ?? null,
      tags: d.tags,
      status: d.status,
      published_at: becomingPublished ? new Date().toISOString() : undefined,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { ok: false, error: error.message }

  revalidateBlogPaths(slug)
  return { ok: true, id }
}

// ── Toggle published / unpublish ─────────────────────────────────────────────
export async function toggleBlogPublished(
  id: number,
  publish: boolean
): Promise<ActionResult> {
  await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase
    .from('blog_posts')
    .update({
      status: publish ? 'published' : 'draft',
      published_at: publish ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return { ok: false, error: error.message }

  revalidateBlogPaths()
  return { ok: true }
}

// ── Delete ───────────────────────────────────────────────────────────────────
export async function deleteBlogPost(id: number): Promise<ActionResult> {
  await requireAdmin()
  const supabase = await createClient()

  // fetch slug for path revalidation
  const { data: row } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('id', id)
    .maybeSingle()

  const { error } = await supabase.from('blog_posts').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidateBlogPaths(row?.slug)
  return { ok: true }
}

// ── Categories ───────────────────────────────────────────────────────────────
export async function createBlogCategory(name: string): Promise<ActionResult> {
  await requireAdmin()

  const trimmed = name.trim()
  if (!trimmed) return { ok: false, error: 'Category name is required' }

  const slug = slugifyPost(trimmed)
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('blog_categories')
    .insert({ name: trimmed, slug })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') return { ok: false, error: 'A category with that name already exists' }
    return { ok: false, error: error.message }
  }

  revalidatePath('/admin/blog')
  return { ok: true, id: data.id }
}

// ── Upload blog media ─────────────────────────────────────────────────────────
export async function uploadBlogMedia(
  postId: number | null,
  formData: FormData
): Promise<ActionResult & { url?: string }> {
  await requireAdmin()

  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: 'No file provided' }
  }

  const folder = postId ? `posts/${postId}` : `posts/drafts`
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `${folder}/${Date.now()}.${ext}`

  const supabase = await createClient()
  const { error } = await supabase.storage
    .from('blog-media')
    .upload(path, file, { upsert: true, contentType: file.type })

  if (error) return { ok: false, error: error.message }

  const { data: { publicUrl } } = supabase.storage.from('blog-media').getPublicUrl(path)
  return { ok: true, url: publicUrl }
}
