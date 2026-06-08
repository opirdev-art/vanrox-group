import { createClient } from '@/utils/supabase/server'
import type {
  CaseStudyMediaRecord,
  CaseStudyRecord,
  CaseStudyWithMedia,
  ProcessStep,
  ServiceDetailBundle,
  ServicePageRecord,
} from './types'

function parseProcessSteps(value: unknown): ProcessStep[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item, index) => {
      if (!item || typeof item !== 'object') return null
      const row = item as Record<string, unknown>
      const title = typeof row.title === 'string' ? row.title : ''
      const description = typeof row.description === 'string' ? row.description : ''
      const stepNumber =
        typeof row.step_number === 'number' ? row.step_number : index + 1
      if (!title || !description) return null
      return { step_number: stepNumber, title, description }
    })
    .filter((step): step is ProcessStep => step !== null)
    .sort((a, b) => a.step_number - b.step_number)
}

function mapServicePage(row: {
  service_id: number
  tagline: string | null
  hero_image_url: string | null
  overview: string | null
  process_steps: unknown
  published: boolean
  updated_at: string
}): ServicePageRecord {
  return {
    service_id: row.service_id,
    tagline: row.tagline,
    hero_image_url: row.hero_image_url,
    overview: row.overview,
    process_steps: parseProcessSteps(row.process_steps),
    published: row.published,
    updated_at: row.updated_at,
  }
}

function mapCaseStudy(row: {
  id: number
  service_id: number
  title: string
  slug: string
  summary: string | null
  body: string | null
  cover_image_url?: string | null
  client_name: string | null
  location: string | null
  outcome: string | null
  tags: string[] | null
  published: boolean
  sort_order: number
  created_at: string
  updated_at: string
}): CaseStudyRecord {
  return {
    id: row.id,
    service_id: row.service_id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    body: row.body,
    cover_image_url: row.cover_image_url ?? null,
    client_name: row.client_name,
    location: row.location,
    outcome: row.outcome,
    tags: row.tags ?? [],
    published: row.published,
    sort_order: row.sort_order,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

function mapMedia(row: {
  id: number
  case_study_id: number
  media_type: string
  url: string
  caption: string | null
  is_cover: boolean
  sort_order: number
  created_at: string
}): CaseStudyMediaRecord {
  return {
    id: row.id,
    case_study_id: row.case_study_id,
    media_type: row.media_type as CaseStudyMediaRecord['media_type'],
    url: row.url,
    caption: row.caption,
    is_cover: row.is_cover,
    sort_order: row.sort_order,
    created_at: row.created_at,
  }
}

export async function getServicePageForAdmin(
  serviceId: number
): Promise<ServicePageRecord | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('service_pages')
    .select('*')
    .eq('service_id', serviceId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data ? mapServicePage(data) : null
}

export async function getPublishedServiceDetailBySlug(
  slug: string
): Promise<ServiceDetailBundle | null> {
  const supabase = await createClient()

  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('id, name, slug, description, metadata')
    .eq('slug', slug)
    .eq('is_active', true)
    .is('deleted_at', null)
    .maybeSingle()

  if (serviceError) throw new Error(serviceError.message)
  if (!service) return null

  const { data: page } = await supabase
    .from('service_pages')
    .select('*')
    .eq('service_id', service.id)
    .eq('published', true)
    .maybeSingle()

  const { data: studies, error: studiesError } = await supabase
    .from('case_studies')
    .select('*')
    .eq('service_id', service.id)
    .eq('published', true)
    .order('sort_order', { ascending: true })

  if (studiesError) throw new Error(studiesError.message)

  const studyIds = (studies ?? []).map((s) => s.id)
  let mediaRows: CaseStudyMediaRecord[] = []

  if (studyIds.length > 0) {
    const { data: media, error: mediaError } = await supabase
      .from('case_study_media')
      .select('*')
      .in('case_study_id', studyIds)
      .order('sort_order', { ascending: true })

    if (mediaError) throw new Error(mediaError.message)
    mediaRows = (media ?? []).map(mapMedia)
  }

  const caseStudies: CaseStudyWithMedia[] = (studies ?? []).map((study) => ({
    ...mapCaseStudy(study),
    media: mediaRows.filter((m) => m.case_study_id === study.id),
  }))

  const metadata =
    service.metadata && typeof service.metadata === 'object'
      ? (service.metadata as { icon?: string })
      : null

  return {
    id: service.id,
    name: service.name,
    slug: service.slug,
    description: service.description,
    metadata,
    page: page ? mapServicePage(page) : null,
    caseStudies,
  }
}

export async function getPublishedCaseStudyBySlugs(
  serviceSlug: string,
  caseSlug: string
): Promise<(CaseStudyWithMedia & { service: { id: number; name: string; slug: string } }) | null> {
  const supabase = await createClient()

  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('id, name, slug')
    .eq('slug', serviceSlug)
    .eq('is_active', true)
    .is('deleted_at', null)
    .maybeSingle()

  if (serviceError) throw new Error(serviceError.message)
  if (!service) return null

  const { data: study, error: studyError } = await supabase
    .from('case_studies')
    .select('*')
    .eq('service_id', service.id)
    .eq('slug', caseSlug)
    .eq('published', true)
    .maybeSingle()

  if (studyError) throw new Error(studyError.message)
  if (!study) return null

  const { data: media, error: mediaError } = await supabase
    .from('case_study_media')
    .select('*')
    .eq('case_study_id', study.id)
    .order('sort_order', { ascending: true })

  if (mediaError) throw new Error(mediaError.message)

  return {
    ...mapCaseStudy(study),
    media: (media ?? []).map(mapMedia),
    service: { id: service.id, name: service.name, slug: service.slug },
  }
}

export async function getCaseStudiesForAdmin(serviceId: number): Promise<CaseStudyRecord[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('case_studies')
    .select('*')
    .eq('service_id', serviceId)
    .order('sort_order', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []).map(mapCaseStudy)
}

export async function getCaseStudyForAdmin(
  serviceId: number,
  caseStudyId: number
): Promise<CaseStudyWithMedia | null> {
  const supabase = await createClient()

  const { data: study, error } = await supabase
    .from('case_studies')
    .select('*')
    .eq('id', caseStudyId)
    .eq('service_id', serviceId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!study) return null

  const { data: media, error: mediaError } = await supabase
    .from('case_study_media')
    .select('*')
    .eq('case_study_id', caseStudyId)
    .order('sort_order', { ascending: true })

  if (mediaError) throw new Error(mediaError.message)

  return {
    ...mapCaseStudy(study),
    media: (media ?? []).map(mapMedia),
  }
}

export async function getActiveServiceSlugs(): Promise<string[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('services')
    .select('slug')
    .eq('is_active', true)
    .is('deleted_at', null)

  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => row.slug)
}

export async function getPublishedCaseStudyPaths(): Promise<
  { serviceSlug: string; caseSlug: string }[]
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('case_studies')
    .select('slug, services!inner(slug)')
    .eq('published', true)

  if (error) throw new Error(error.message)

  return (data ?? []).flatMap((row) => {
    const services = row.services as { slug: string } | { slug: string }[] | null
    const serviceSlug = Array.isArray(services) ? services[0]?.slug : services?.slug
    if (!serviceSlug) return []
    return [{ serviceSlug, caseSlug: row.slug }]
  })
}
