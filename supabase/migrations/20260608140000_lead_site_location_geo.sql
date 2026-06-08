-- Store exact survey site coordinates on leads
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS site_location_geo POINT;

-- Booking RPC: require map pin coordinates
CREATE OR REPLACE FUNCTION public.create_booking_request(
  p_full_name TEXT,
  p_phone TEXT,
  p_email TEXT,
  p_service_id BIGINT,
  p_site_location TEXT,
  p_site_lat DOUBLE PRECISION,
  p_site_lng DOUBLE PRECISION,
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

  IF p_site_lat IS NULL OR p_site_lng IS NULL THEN
    RAISE EXCEPTION 'Site map pin is required';
  END IF;

  IF p_site_lat < 9.9 OR p_site_lat > 11.5 OR p_site_lng < -62.0 OR p_site_lng > -60.4 THEN
    RAISE EXCEPTION 'Site must be within Trinidad and Tobago';
  END IF;

  IF trim(p_site_location) = '' THEN
    RAISE EXCEPTION 'Site location description is required';
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
    site_location_geo,
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
    point(p_site_lng, p_site_lat),
    p_preferred_start,
    p_preferred_end
  )
  RETURNING id INTO v_lead_id;

  RETURN v_lead_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_booking_request(
  TEXT, TEXT, TEXT, BIGINT, TEXT, DOUBLE PRECISION, DOUBLE PRECISION, TIMESTAMPTZ, TIMESTAMPTZ, TEXT, TEXT
) TO anon, authenticated;
