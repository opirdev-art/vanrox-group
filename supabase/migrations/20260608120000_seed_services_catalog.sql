-- Seed / refresh public services catalog (source of truth for /services and /schedule)
INSERT INTO public.services (name, slug, description, sort_order, is_active, metadata)
VALUES
  (
    'Boundary Surveys',
    'boundary-surveys',
    'Precise determination and marking of property boundaries in accordance with T&T Land Registry requirements. Essential for land transfers and disputes.',
    1,
    TRUE,
    '{"icon":"📐"}'::jsonb
  ),
  (
    'Topographic Surveys',
    'topographic-surveys',
    'Detailed mapping of natural and man-made features including elevation data. Vital for construction, drainage design, and site planning.',
    2,
    TRUE,
    '{"icon":"🗺️"}'::jsonb
  ),
  (
    'Construction Stakeout',
    'construction-stakeout',
    'Accurate staking of building footprints, infrastructure alignments and grades to guide contractors during construction phases.',
    3,
    TRUE,
    '{"icon":"🏗️"}'::jsonb
  ),
  (
    'Cadastral Surveys',
    'cadastral-surveys',
    'Legal boundary surveys for subdivision, amalgamation, and land registration. Prepared to satisfy the requirements of the Land Registry of T&T.',
    4,
    TRUE,
    '{"icon":"📄"}'::jsonb
  ),
  (
    'GPS / GNSS Surveys',
    'gps-gnss-surveys',
    'High-precision GPS-based surveys for control networks, infrastructure projects, and large-scale mapping operations across the country.',
    5,
    TRUE,
    '{"icon":"🛰️"}'::jsonb
  ),
  (
    'Engineering Consultancy',
    'engineering-consultancy',
    'Expert engineering advice and technical reporting for residential, commercial, and government development projects throughout T&T.',
    6,
    TRUE,
    '{"icon":"📊"}'::jsonb
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active,
  metadata = EXCLUDED.metadata,
  deleted_at = NULL,
  updated_at = NOW();
