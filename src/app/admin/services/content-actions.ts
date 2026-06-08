'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'
import { createClient } from '@/utils/supabase/server'
import {
  normalizeMediaUrl,
  parseCaseStudyBody,
  parseCaseStudyDetails,
  parseCaseStudyMediaInput,
  parseServicePageInput,
  resolveCaseStudySlug,
} from '@/lib/service-pages/validation'
import type { ProcessStep } from '@/lib/service-pages/types'
import type { ActionResult } from '@/lib/service-pages/action-result'

export type { ActionResult } from '@/lib/service-pages/action-result'

const CASE_STUDY_BUCKET = 'case-study-media'

function revalidateServicePaths(serviceId: number, serviceSlug?: string) {
  revalidatePath('/services')
  revalidatePath('/admin/services')
  revalidatePath(`/admin/services/${serviceId}`)
  revalidatePath(`/admin/services/${serviceId}/content`)
  revalidatePath(`/admin/services/${serviceId}/case-studies`)
  if (serviceSlug) {
    revalidatePath(`/services/${serviceSlug}`)
  }
}

async function getServiceSlug(serviceId: number): Promise<string | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('services').select('slug').eq('id', serviceId).maybeSingle()
  return data?.slug ?? null
}

export async function upsertServicePage(
  serviceId: number,
  input: unknown
): Promise<ActionResult> {
  await requireAdmin()

  const parsed = parseServicePageInput(input)
  if (parsed.ok === false) return { ok: false, error: parsed.error }

  const data = parsed.data
  const supabase = await createClient()

  const { error } = await supabase.from('service_pages').upsert(
    {
      service_id: serviceId,
      tagline: data.tagline?.trim() || null,
      hero_image_url: data.hero_image_url?.trim() || null,
      overview: data.overview?.trim() || null,
      process_steps: data.process_steps as ProcessStep[],
      published: data.published,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'service_id' }
  )

  if (error) return { ok: false, error: error.message }

  const slug = await getServiceSlug(serviceId)
  revalidateServicePaths(serviceId, slug ?? undefined)
  return { ok: true }
}

export async function uploadServiceHeroImage(
  serviceId: number,
  formData: FormData
): Promise<ActionResult & { url?: string }> {
  await requireAdmin()

  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: 'No file provided' }
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `services/${serviceId}/hero-${Date.now()}.${ext}`

  const supabase = await createClient()
  const { error: uploadError } = await supabase.storage
    .from(CASE_STUDY_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) return { ok: false, error: uploadError.message }

  const { data: publicUrl } = supabase.storage.from(CASE_STUDY_BUCKET).getPublicUrl(path)
  return { ok: true, url: publicUrl.publicUrl }
}

export async function createCaseStudy(
  serviceId: number,
  input: {
    details: unknown
    body?: unknown
    cover_image_url?: string | null
    published?: boolean
  }
): Promise<ActionResult> {
  await requireAdmin()

  const detailsParsed = parseCaseStudyDetails(input.details)
  if (detailsParsed.ok === false) return { ok: false, error: detailsParsed.error }

  const bodyParsed = parseCaseStudyBody({ body: input.body ?? '' })
  if (bodyParsed.ok === false) return { ok: false, error: bodyParsed.error }

  const slug = resolveCaseStudySlug(detailsParsed.data.title, detailsParsed.data.slug)
  const supabase = await createClient()

  const { data: maxOrderRow } = await supabase
    .from('case_studies')
    .select('sort_order')
    .eq('service_id', serviceId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const sortOrder = (maxOrderRow?.sort_order ?? -1) + 1

  const { data: study, error } = await supabase
    .from('case_studies')
    .insert({
      service_id: serviceId,
      title: detailsParsed.data.title,
      slug,
      summary: detailsParsed.data.summary?.trim() || null,
      body: bodyParsed.data.body?.trim() || null,
      cover_image_url: input.cover_image_url?.trim() || null,
      client_name: detailsParsed.data.client_name?.trim() || null,
      location: detailsParsed.data.location?.trim() || null,
      outcome: detailsParsed.data.outcome?.trim() || null,
      tags: detailsParsed.data.tags,
      published: input.published ?? false,
      sort_order: sortOrder,
    })
    .select('id')
    .single()

  if (error) return { ok: false, error: error.message }

  const serviceSlug = await getServiceSlug(serviceId)
  revalidateServicePaths(serviceId, serviceSlug ?? undefined)
  revalidatePath(`/services/${serviceSlug}/${slug}`)

  return { ok: true, id: study.id }
}

export async function updateCaseStudy(
  serviceId: number,
  caseStudyId: number,
  input: {
    details: unknown
    body?: unknown
    cover_image_url?: string | null
    published?: boolean
  }
): Promise<ActionResult> {
  await requireAdmin()

  const detailsParsed = parseCaseStudyDetails(input.details)
  if (detailsParsed.ok === false) return { ok: false, error: detailsParsed.error }

  const bodyParsed = parseCaseStudyBody({ body: input.body ?? '' })
  if (bodyParsed.ok === false) return { ok: false, error: bodyParsed.error }

  const slug = resolveCaseStudySlug(detailsParsed.data.title, detailsParsed.data.slug)
  const supabase = await createClient()

  const { error } = await supabase
    .from('case_studies')
    .update({
      title: detailsParsed.data.title,
      slug,
      summary: detailsParsed.data.summary?.trim() || null,
      body: bodyParsed.data.body?.trim() || null,
      cover_image_url: input.cover_image_url?.trim() || null,
      client_name: detailsParsed.data.client_name?.trim() || null,
      location: detailsParsed.data.location?.trim() || null,
      outcome: detailsParsed.data.outcome?.trim() || null,
      tags: detailsParsed.data.tags,
      published: input.published ?? false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', caseStudyId)
    .eq('service_id', serviceId)

  if (error) return { ok: false, error: error.message }

  const serviceSlug = await getServiceSlug(serviceId)
  revalidateServicePaths(serviceId, serviceSlug ?? undefined)
  revalidatePath(`/services/${serviceSlug}/${slug}`)

  return { ok: true, id: caseStudyId }
}

async function replaceCaseStudyMedia(
  caseStudyId: number,
  mediaInput: unknown[]
): Promise<ActionResult> {
  const supabase = await createClient()

  const rows = mediaInput.flatMap((item, index) => {
    const parsed = parseCaseStudyMediaInput(item)
    if (parsed.ok === false) return []

    const url = normalizeMediaUrl(parsed.data.media_type, parsed.data.url)
    if (!url) return []

    return [
      {
        case_study_id: caseStudyId,
        media_type: parsed.data.media_type,
        url,
        caption: parsed.data.caption?.trim() || null,
        is_cover: parsed.data.is_cover,
        sort_order: parsed.data.sort_order ?? index,
      },
    ]
  })

  const { error: deleteError } = await supabase
    .from('case_study_media')
    .delete()
    .eq('case_study_id', caseStudyId)

  if (deleteError) return { ok: false, error: deleteError.message }

  if (rows.length === 0) return { ok: true }

  const { error: insertError } = await supabase.from('case_study_media').insert(rows)
  if (insertError) return { ok: false, error: insertError.message }

  return { ok: true }
}

export async function toggleCaseStudyPublished(
  serviceId: number,
  caseStudyId: number,
  published: boolean
): Promise<ActionResult> {
  await requireAdmin()

  const supabase = await createClient()
  const { error } = await supabase
    .from('case_studies')
    .update({ published, updated_at: new Date().toISOString() })
    .eq('id', caseStudyId)
    .eq('service_id', serviceId)

  if (error) return { ok: false, error: error.message }

  const serviceSlug = await getServiceSlug(serviceId)
  revalidateServicePaths(serviceId, serviceSlug ?? undefined)
  return { ok: true }
}

export async function updateCaseStudySortOrder(
  serviceId: number,
  orderedIds: number[]
): Promise<ActionResult> {
  await requireAdmin()

  const supabase = await createClient()

  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase
      .from('case_studies')
      .update({ sort_order: i })
      .eq('id', orderedIds[i])
      .eq('service_id', serviceId)

    if (error) return { ok: false, error: error.message }
  }

  const serviceSlug = await getServiceSlug(serviceId)
  revalidateServicePaths(serviceId, serviceSlug ?? undefined)
  return { ok: true }
}

export async function deleteCaseStudy(
  serviceId: number,
  caseStudyId: number
): Promise<ActionResult> {
  await requireAdmin()

  const supabase = await createClient()
  const { error } = await supabase
    .from('case_studies')
    .delete()
    .eq('id', caseStudyId)
    .eq('service_id', serviceId)

  if (error) return { ok: false, error: error.message }

  const serviceSlug = await getServiceSlug(serviceId)
  revalidateServicePaths(serviceId, serviceSlug ?? undefined)
  return { ok: true }
}

export async function uploadCaseStudyImage(
  serviceId: number,
  caseStudyId: number | null,
  formData: FormData
): Promise<ActionResult & { url?: string }> {
  await requireAdmin()

  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: 'No file provided' }
  }

  const folder = caseStudyId ? `case-studies/${caseStudyId}` : `case-studies/drafts/${serviceId}`
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `${folder}/${Date.now()}.${ext}`

  const supabase = await createClient()
  const { error: uploadError } = await supabase.storage
    .from(CASE_STUDY_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) return { ok: false, error: uploadError.message }

  const { data: publicUrl } = supabase.storage.from(CASE_STUDY_BUCKET).getPublicUrl(path)
  return { ok: true, url: publicUrl.publicUrl }
}
