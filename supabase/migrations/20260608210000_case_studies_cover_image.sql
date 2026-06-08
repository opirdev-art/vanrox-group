-- Add dedicated cover image URL to case studies (set by the rich editor cover picker)
ALTER TABLE public.case_studies
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
