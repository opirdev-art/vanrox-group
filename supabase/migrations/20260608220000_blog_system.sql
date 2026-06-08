-- ── Blog system ────────────────────────────────────────────────────────────
-- Tables: blog_categories, blog_posts
-- RLS: public read for published content, admin full control
-- Indexes: status/published_at for list queries, slug for detail lookup
-- Storage: blog-media bucket

-- ── Categories ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       TEXT   NOT NULL,
  slug       TEXT   NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Posts ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title           TEXT    NOT NULL,
  slug            TEXT    NOT NULL UNIQUE,
  excerpt         TEXT,
  body            TEXT,                         -- TipTap HTML
  cover_image_url TEXT,
  cover_alt       TEXT,
  author_name     TEXT    NOT NULL DEFAULT 'VANROX',
  category_id     BIGINT  REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  tags            TEXT[]  NOT NULL DEFAULT '{}',
  status          TEXT    NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('draft', 'published', 'archived')),
  published_at    TIMESTAMPTZ,
  view_count      INT     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────────────────────────
-- Public list: published posts ordered by published_at
CREATE INDEX IF NOT EXISTS idx_blog_posts_published
  ON public.blog_posts (published_at DESC)
  WHERE status = 'published';

-- Category filter
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_id
  ON public.blog_posts (category_id);

-- Slug lookup
CREATE UNIQUE INDEX IF NOT EXISTS idx_blog_posts_slug
  ON public.blog_posts (slug);

-- Tags full-text filter
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags
  ON public.blog_posts USING GIN (tags);

-- Admin list ordered by updated_at
CREATE INDEX IF NOT EXISTS idx_blog_posts_updated_at
  ON public.blog_posts (updated_at DESC);

-- ── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts      ENABLE ROW LEVEL SECURITY;

-- Public: anyone can read published posts and all categories
CREATE POLICY "blog_categories_public_read"
  ON public.blog_categories
  FOR SELECT
  USING (true);

CREATE POLICY "blog_posts_public_read"
  ON public.blog_posts
  FOR SELECT
  USING (status = 'published');

-- Admin: full control
CREATE POLICY "blog_categories_admin_all"
  ON public.blog_categories
  FOR ALL
  USING      ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

CREATE POLICY "blog_posts_admin_all"
  ON public.blog_posts
  FOR ALL
  USING      ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

-- ── Storage bucket ───────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-media', 'blog-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "blog_media_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-media');

CREATE POLICY "blog_media_admin_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'blog-media' AND (SELECT public.is_admin()));

CREATE POLICY "blog_media_admin_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'blog-media' AND (SELECT public.is_admin()));

CREATE POLICY "blog_media_admin_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'blog-media' AND (SELECT public.is_admin()));

-- ── View count increment (SECURITY DEFINER bypasses RLS) ───────────────────
CREATE OR REPLACE FUNCTION public.increment_blog_view_count(post_id BIGINT)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.blog_posts
  SET view_count = view_count + 1
  WHERE id = post_id AND status = 'published';
$$;

-- ── Seed default categories ──────────────────────────────────────────────────
INSERT INTO public.blog_categories (name, slug) VALUES
  ('Boundary Issues',  'boundary-issues'),
  ('Land Development', 'land-development'),
  ('Surveying',        'surveying'),
  ('Engineering',      'engineering'),
  ('Regulatory',       'regulatory')
ON CONFLICT (slug) DO NOTHING;
