-- ==============================================================================
-- VANROX: Service detail pages + case studies
-- Date: 2026-06-08
-- ==============================================================================

-- 1. Service pages (1:1 editorial content — booking form keeps using services table)
CREATE TABLE IF NOT EXISTS public.service_pages (
  service_id BIGINT PRIMARY KEY REFERENCES public.services(id) ON DELETE CASCADE,
  tagline TEXT,
  hero_image_url TEXT,
  overview TEXT,
  process_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  published BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.service_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published service pages"
  ON public.service_pages FOR SELECT
  USING (published = TRUE);

CREATE POLICY "Admins manage service pages"
  ON public.service_pages FOR ALL
  USING ((SELECT public.is_admin()));

-- 2. Case studies (many per service)
CREATE TABLE IF NOT EXISTS public.case_studies (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  service_id BIGINT NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  summary TEXT,
  body TEXT,
  client_name TEXT,
  location TEXT,
  outcome TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  published BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (service_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_case_studies_service_id
  ON public.case_studies (service_id);

CREATE INDEX IF NOT EXISTS idx_case_studies_service_published
  ON public.case_studies (service_id, sort_order)
  WHERE published = TRUE;

CREATE INDEX IF NOT EXISTS idx_case_studies_tags
  ON public.case_studies USING gin (tags);

ALTER TABLE public.case_studies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published case studies"
  ON public.case_studies FOR SELECT
  USING (published = TRUE);

CREATE POLICY "Admins manage case studies"
  ON public.case_studies FOR ALL
  USING ((SELECT public.is_admin()));

-- 3. Case study media
CREATE TABLE IF NOT EXISTS public.case_study_media (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  case_study_id BIGINT NOT NULL REFERENCES public.case_studies(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video_embed', 'video_upload')),
  url TEXT NOT NULL,
  caption TEXT,
  is_cover BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_case_study_media_case_study_id
  ON public.case_study_media (case_study_id);

CREATE INDEX IF NOT EXISTS idx_case_study_media_cover
  ON public.case_study_media (case_study_id)
  WHERE is_cover = TRUE;

ALTER TABLE public.case_study_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read media for published studies"
  ON public.case_study_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.case_studies cs
      WHERE cs.id = case_study_id AND cs.published = TRUE
    )
  );

CREATE POLICY "Admins manage case study media"
  ON public.case_study_media FOR ALL
  USING ((SELECT public.is_admin()));

-- 4. Storage bucket for case study images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'case-study-media',
  'case-study-media',
  TRUE,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read case study media files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'case-study-media');

CREATE POLICY "Admins upload case study media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'case-study-media'
    AND (SELECT public.is_admin())
  );

CREATE POLICY "Admins update case study media files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'case-study-media'
    AND (SELECT public.is_admin())
  );

CREATE POLICY "Admins delete case study media files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'case-study-media'
    AND (SELECT public.is_admin())
  );
