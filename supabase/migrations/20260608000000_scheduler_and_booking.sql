-- ==============================================================================
-- VANROX: Scheduler settings, lead preferred times, service seed, booking RPCs
-- Date: 2026-06-08
-- ==============================================================================

-- 1. Scheduler settings (singleton)
CREATE TABLE IF NOT EXISTS public.scheduler_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  timezone TEXT NOT NULL DEFAULT 'America/Port_of_Spain',
  slot_duration_minutes INT NOT NULL DEFAULT 60,
  buffer_minutes INT NOT NULL DEFAULT 0,
  weekly_hours JSONB NOT NULL DEFAULT '{
    "mon": {"open": "08:00", "close": "17:00"},
    "tue": {"open": "08:00", "close": "17:00"},
    "wed": {"open": "08:00", "close": "17:00"},
    "thu": {"open": "08:00", "close": "17:00"},
    "fri": {"open": "08:00", "close": "17:00"},
    "sat": null,
    "sun": null
  }'::jsonb,
  booking_horizon_days INT NOT NULL DEFAULT 60,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.scheduler_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.scheduler_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read scheduler settings"
  ON public.scheduler_settings FOR SELECT USING (TRUE);

CREATE POLICY "Admins manage scheduler settings"
  ON public.scheduler_settings FOR ALL USING (public.is_admin());

-- 2. Preferred appointment window on leads
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS preferred_start_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS preferred_end_time TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_leads_preferred_start
  ON public.leads(preferred_start_time)
  WHERE preferred_start_time IS NOT NULL;

-- 3. Seed services catalog
INSERT INTO public.services (name, slug, description, sort_order, is_active)
VALUES
  ('Boundary Survey', 'boundary-survey', 'Property boundary determination and marking.', 1, TRUE),
  ('Topographic Survey', 'topographic-survey', 'Detailed land elevation and feature mapping.', 2, TRUE),
  ('Construction Stakeout', 'construction-stakeout', 'Precise layout for construction projects.', 3, TRUE),
  ('Cadastral Survey', 'cadastral-survey', 'Official land registration surveys.', 4, TRUE),
  ('Engineering Consultancy', 'engineering-consultancy', 'Professional engineering advisory services.', 5, TRUE),
  ('Other', 'other', 'Custom surveying or engineering request.', 6, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- 4. Helper: parse HH:MM to minutes
CREATE OR REPLACE FUNCTION public.time_to_minutes(p_time TEXT)
RETURNS INT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT (split_part(p_time, ':', 1)::INT * 60) + split_part(p_time, ':', 2)::INT;
$$;

-- 5. RPC: available slots for a calendar day
CREATE OR REPLACE FUNCTION public.get_available_slots(p_date DATE)
RETURNS TABLE(slot_start TIMESTAMPTZ, slot_end TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_settings public.scheduler_settings%ROWTYPE;
  v_day_key TEXT;
  v_day_hours JSONB;
  v_open TEXT;
  v_close TEXT;
  v_open_min INT;
  v_close_min INT;
  v_cursor_min INT;
  v_slot_start TIMESTAMPTZ;
  v_slot_end TIMESTAMPTZ;
  v_busy BOOLEAN;
BEGIN
  SELECT * INTO v_settings FROM public.scheduler_settings WHERE id = 1;

  IF p_date < (NOW() AT TIME ZONE v_settings.timezone)::DATE THEN
    RETURN;
  END IF;

  IF p_date > ((NOW() AT TIME ZONE v_settings.timezone)::DATE + v_settings.booking_horizon_days) THEN
    RETURN;
  END IF;

  v_day_key := lower(trim(to_char(p_date, 'Dy')));
  v_day_hours := v_settings.weekly_hours -> v_day_key;

  IF v_day_hours IS NULL OR v_day_hours = 'null'::jsonb THEN
    RETURN;
  END IF;

  v_open := v_day_hours ->> 'open';
  v_close := v_day_hours ->> 'close';

  IF v_open IS NULL OR v_close IS NULL THEN
    RETURN;
  END IF;

  v_open_min := public.time_to_minutes(v_open);
  v_close_min := public.time_to_minutes(v_close);

  v_cursor_min := v_open_min;
  WHILE v_cursor_min + v_settings.slot_duration_minutes <= v_close_min LOOP
    v_slot_start := (p_date::TEXT || ' ' ||
      lpad((v_cursor_min / 60)::TEXT, 2, '0') || ':' ||
      lpad((v_cursor_min % 60)::TEXT, 2, '0'))::TIMESTAMP
      AT TIME ZONE v_settings.timezone;

    v_slot_end := v_slot_start + (v_settings.slot_duration_minutes || ' minutes')::INTERVAL;

    SELECT EXISTS (
      SELECT 1
      FROM public.appointments a
      WHERE a.deleted_at IS NULL
        AND a.status NOT IN ('cancelled')
        AND tstzrange(a.start_time, a.end_time, '[)') && tstzrange(v_slot_start, v_slot_end, '[)')
    ) INTO v_busy;

    IF NOT v_busy THEN
      slot_start := v_slot_start;
      slot_end := v_slot_end;
      RETURN NEXT;
    END IF;

    v_cursor_min := v_cursor_min + v_settings.slot_duration_minutes + v_settings.buffer_minutes;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_available_slots(DATE) TO anon, authenticated;

-- 6. RPC: public booking request (v1 — customer + lead only)
CREATE OR REPLACE FUNCTION public.create_booking_request(
  p_full_name TEXT,
  p_phone TEXT,
  p_email TEXT,
  p_service_id BIGINT,
  p_site_location TEXT,
  p_preferred_start TIMESTAMPTZ,
  p_preferred_end TIMESTAMPTZ,
  p_referral_code TEXT DEFAULT NULL,
  p_inquiry_details TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer_id UUID;
  v_lead_id UUID;
  v_partner_id UUID;
  v_source TEXT := 'website';
  v_slot_available BOOLEAN;
  v_date DATE;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.services
    WHERE id = p_service_id AND is_active = TRUE AND deleted_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Invalid service';
  END IF;

  IF p_preferred_start >= p_preferred_end THEN
    RAISE EXCEPTION 'Invalid preferred time range';
  END IF;

  IF p_preferred_start < NOW() THEN
    RAISE EXCEPTION 'Preferred time must be in the future';
  END IF;

  v_date := (p_preferred_start AT TIME ZONE 'America/Port_of_Spain')::DATE;

  SELECT EXISTS (
    SELECT 1
    FROM public.get_available_slots(v_date) s
    WHERE s.slot_start = p_preferred_start AND s.slot_end = p_preferred_end
  ) INTO v_slot_available;

  IF NOT v_slot_available THEN
    RAISE EXCEPTION 'Selected time is no longer available';
  END IF;

  IF p_referral_code IS NOT NULL AND length(trim(p_referral_code)) > 0 THEN
    SELECT id INTO v_partner_id
    FROM public.referral_partners
    WHERE referral_code = trim(p_referral_code)
      AND status = 'active'
      AND deleted_at IS NULL
    LIMIT 1;

    IF v_partner_id IS NOT NULL THEN
      v_source := 'referral';
    END IF;
  END IF;

  SELECT id INTO v_customer_id
  FROM public.customers
  WHERE phone = trim(p_phone)
  LIMIT 1;

  IF v_customer_id IS NULL AND p_email IS NOT NULL AND length(trim(p_email)) > 0 THEN
    SELECT id INTO v_customer_id
    FROM public.customers
    WHERE email = trim(p_email)
    LIMIT 1;
  END IF;

  IF v_customer_id IS NULL THEN
    INSERT INTO public.customers (full_name, email, phone)
    VALUES (trim(p_full_name), NULLIF(trim(p_email), ''), trim(p_phone))
    RETURNING id INTO v_customer_id;
  ELSE
    UPDATE public.customers
    SET
      full_name = trim(p_full_name),
      email = COALESCE(NULLIF(trim(p_email), ''), email),
      phone = trim(p_phone),
      updated_at = NOW()
    WHERE id = v_customer_id;
  END IF;

  INSERT INTO public.leads (
    customer_id,
    service_id,
    referral_partner_id,
    source,
    status,
    inquiry_details,
    site_location,
    preferred_start_time,
    preferred_end_time
  )
  VALUES (
    v_customer_id,
    p_service_id,
    v_partner_id,
    v_source,
    'new',
    p_inquiry_details,
    trim(p_site_location),
    p_preferred_start,
    p_preferred_end
  )
  RETURNING id INTO v_lead_id;

  RETURN v_lead_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_booking_request(
  TEXT, TEXT, TEXT, BIGINT, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, TEXT, TEXT
) TO anon, authenticated;
