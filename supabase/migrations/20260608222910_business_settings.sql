-- ── Business settings (single-row config) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.business_settings (
  id         INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  phone      TEXT,
  email      TEXT,
  address    TEXT,
  metadata   JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Explicit API grants for authenticated role.
GRANT SELECT, INSERT, UPDATE ON public.business_settings TO authenticated;

ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "business_settings_admin_all"
  ON public.business_settings
  FOR ALL
  TO authenticated
  USING      ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

INSERT INTO public.business_settings (id, phone, email, address, metadata)
VALUES (1, '2721240', 'info@vanrox-group.com', 'Scarborough, Tobago', '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

DROP TRIGGER IF EXISTS set_timestamp_business_settings ON public.business_settings;
CREATE TRIGGER set_timestamp_business_settings
  BEFORE UPDATE ON public.business_settings
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();
