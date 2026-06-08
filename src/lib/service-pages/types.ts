export type ProcessStep = {
  step_number: number
  title: string
  description: string
}

export type ServicePageRecord = {
  service_id: number
  tagline: string | null
  hero_image_url: string | null
  overview: string | null
  process_steps: ProcessStep[]
  published: boolean
  updated_at: string
}

export type CaseStudyMediaType = 'image' | 'video_embed' | 'video_upload'

export type CaseStudyMediaRecord = {
  id: number
  case_study_id: number
  media_type: CaseStudyMediaType
  url: string
  caption: string | null
  is_cover: boolean
  sort_order: number
  created_at: string
}

export type CaseStudyRecord = {
  id: number
  service_id: number
  title: string
  slug: string
  summary: string | null
  body: string | null
  cover_image_url: string | null
  client_name: string | null
  location: string | null
  outcome: string | null
  tags: string[]
  published: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type CaseStudyWithMedia = CaseStudyRecord & {
  media: CaseStudyMediaRecord[]
}

export type ServiceDetailBundle = {
  id: number
  name: string
  slug: string
  description: string | null
  metadata: { icon?: string } | null
  page: ServicePageRecord | null
  caseStudies: CaseStudyWithMedia[]
}
