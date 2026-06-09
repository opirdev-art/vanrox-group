-- Reviews table
-- Stores both on-site submissions (source='site') and synced Google reviews (source='google').
-- Site submissions are unapproved by default; Google reviews are approved on import.

create table public.reviews (
  id           bigint generated always as identity primary key,
  author_name  text        not null,
  rating       smallint    not null check (rating between 1 and 5),
  body         text        not null,
  source       text        not null default 'site' check (source in ('site', 'google')),
  -- Unique identifier from the Google Places/Business Profile API response (for dedup on sync)
  google_review_id text unique,
  approved     boolean     not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Automatically update updated_at on row change
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger reviews_set_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();

-- Row Level Security
alter table public.reviews enable row level security;

-- Public can read only approved reviews
create policy "approved reviews are publicly readable"
  on public.reviews
  for select
  to anon
  using (approved = true);

-- Public can submit new site reviews (must be unapproved, source=site, no google id)
create policy "public can submit site reviews"
  on public.reviews
  for insert
  to anon
  with check (
    approved = false
    and source = 'site'
    and google_review_id is null
  );

-- Authenticated admins can read all reviews (including pending)
create policy "admins can read all reviews"
  on public.reviews
  for select
  to authenticated
  using (true);

-- Authenticated admins can update reviews (e.g. approve/reject)
create policy "admins can update reviews"
  on public.reviews
  for update
  to authenticated
  using (true)
  with check (true);

-- Authenticated admins can delete reviews
create policy "admins can delete reviews"
  on public.reviews
  for delete
  to authenticated
  using (true);

-- Authenticated admins can insert reviews (for Google sync import)
create policy "admins can insert reviews"
  on public.reviews
  for insert
  to authenticated
  with check (true);

-- Performance indices
create index reviews_approved_idx on public.reviews (approved, created_at desc);
create index reviews_source_idx   on public.reviews (source);
