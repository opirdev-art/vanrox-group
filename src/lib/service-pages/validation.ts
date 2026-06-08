import { slugifyServiceName } from '@/lib/services/slug'
import type { CaseStudyMediaType, ProcessStep } from './types'
import { parseYouTubeEmbedUrl } from './youtube'

import type { ParseResult } from '@/lib/parse-result'

export type ServicePageInput = {
  tagline?: string
  hero_image_url?: string
  overview?: string
  process_steps: ProcessStep[]
  published: boolean
}

export type CaseStudyDetailsInput = {
  title: string
  slug?: string
  summary?: string
  client_name?: string
  location?: string
  outcome?: string
  tags: string[]
}

export type CaseStudyBodyInput = {
  body?: string
}

export type CaseStudyMediaInput = {
  media_type: CaseStudyMediaType
  url: string
  caption?: string
  is_cover: boolean
  sort_order: number
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' ? value.trim() : undefined
}

function readBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

function parseProcessSteps(value: unknown): ProcessStep[] {
  if (!Array.isArray(value)) return []

  return value.flatMap((item, index) => {
    const row = asRecord(item)
    if (!row) return []

    const title = readString(row.title) ?? ''
    const description = readString(row.description) ?? ''
    const stepNumber =
      typeof row.step_number === 'number' && Number.isInteger(row.step_number) && row.step_number > 0
        ? row.step_number
        : index + 1

    if (!title || !description) return []
    return [{ step_number: stepNumber, title, description }]
  })
}

export function parseServicePageInput(input: unknown): ParseResult<ServicePageInput> {
  const row = asRecord(input)
  if (!row) return { ok: false, error: 'Invalid service page' }

  const heroImageUrl = readString(row.hero_image_url)
  if (heroImageUrl && !isValidUrl(heroImageUrl)) {
    return { ok: false, error: 'Hero image must be a valid URL' }
  }

  return {
    ok: true,
    data: {
      tagline: readString(row.tagline),
      hero_image_url: heroImageUrl,
      overview: readString(row.overview),
      process_steps: parseProcessSteps(row.process_steps),
      published: readBoolean(row.published),
    },
  }
}

export function parseCaseStudyDetails(input: unknown): ParseResult<CaseStudyDetailsInput> {
  const row = asRecord(input)
  if (!row) return { ok: false, error: 'Invalid case study details' }

  const title = readString(row.title) ?? ''
  if (title.length < 2) return { ok: false, error: 'Title is required' }

  const slug = readString(row.slug)
  if (slug && slug.length < 2) return { ok: false, error: 'Slug is too short' }

  const tags = Array.isArray(row.tags)
    ? row.tags.flatMap((tag) => {
        const value = readString(tag)
        return value ? [value] : []
      })
    : []

  return {
    ok: true,
    data: {
      title,
      slug,
      summary: readString(row.summary),
      client_name: readString(row.client_name),
      location: readString(row.location),
      outcome: readString(row.outcome),
      tags,
    },
  }
}

export function parseCaseStudyBody(input: unknown): ParseResult<CaseStudyBodyInput> {
  const row = asRecord(input)
  if (!row) return { ok: true, data: { body: undefined } }
  return { ok: true, data: { body: readString(row.body) } }
}

export function parseCaseStudyMediaInput(input: unknown): ParseResult<CaseStudyMediaInput> {
  const row = asRecord(input)
  if (!row) return { ok: false, error: 'Invalid media item' }

  const mediaType = row.media_type
  if (mediaType !== 'image' && mediaType !== 'video_embed' && mediaType !== 'video_upload') {
    return { ok: false, error: 'Invalid media type' }
  }

  const url = readString(row.url) ?? ''
  if (!url) return { ok: false, error: 'Media URL is required' }

  const sortOrder =
    typeof row.sort_order === 'number' && Number.isInteger(row.sort_order) && row.sort_order >= 0
      ? row.sort_order
      : 0

  return {
    ok: true,
    data: {
      media_type: mediaType,
      url,
      caption: readString(row.caption),
      is_cover: readBoolean(row.is_cover),
      sort_order: sortOrder,
    },
  }
}

export function resolveCaseStudySlug(title: string, slug?: string): string {
  const base = slug?.trim() || slugifyServiceName(title)
  return base || 'case-study'
}

export function normalizeMediaUrl(mediaType: string, url: string): string | null {
  if (mediaType === 'video_embed') {
    return parseYouTubeEmbedUrl(url) ?? (url.includes('youtube.com/embed/') ? url : null)
  }
  return url.trim() || null
}
