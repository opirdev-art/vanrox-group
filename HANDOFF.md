# VANROX Platform — Handoff Document
**Date:** June 8, 2026  
**Project:** `vanrox-group` (Next.js 16 App Router + Supabase)  
**Repo root:** `c:\Users\xernm\OneDrive\Desktop\Projects\vanrox-group`

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.6 — App Router, Server Components, Server Actions |
| Database | Supabase PostgreSQL (project: `stcacpadxbugkmnomzzk`) |
| Auth | Supabase Auth + custom `profiles` table with roles |
| Storage | Supabase Storage — buckets: `case-study-media`, `blog-media` |
| Styling | Tailwind CSS v4 (`@import "tailwindcss"`) — custom navy/green brand tokens |
| Fonts | Bebas Neue (headings), Barlow, Barlow Condensed |
| Rich text | TipTap v3 — `RichEditor` component with `InlineMedia` custom node |
| Validation | Custom `ParseResult<T>` type (no Zod — user preference) |
| Testing | Vitest — 9 test files, 31 passing tests |

### Environment variables (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=https://stcacpadxbugkmnomzzk.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SECRET_KEY=...
```

---

## 2. Database Migrations (in order)

All migrations live in `supabase/migrations/`. They have **not yet been applied to the remote DB** — use `npx supabase db push` with `SUPABASE_DB_PASSWORD` set, or paste each file into the Supabase SQL Editor.

| File | What it does |
|---|---|
| `20260525000000_initial_schema.sql` | Core schema: `profiles`, `services`, `leads`, `customers`, `appointments`, `audit_logs`, `referral_partners` |
| `20260608000000_scheduler_and_booking.sql` | Scheduler slots, blockouts, booking flow, RLS, storage bucket `case-study-media` |
| `20260608120000_seed_services_catalog.sql` | Seeds 8 VANROX services (Boundary Survey, Topo Survey, etc.) |
| `20260608130000_fix_audit_logs_record_id.sql` | Makes `audit_logs.record_id` polymorphic (TEXT) |
| `20260608140000_lead_site_location_geo.sql` | Adds `location_geo` to leads (PostGIS), map pin picker support |
| `20260608200000_service_pages_case_studies.sql` | `service_pages`, `case_studies`, `case_study_media` tables + RLS + indexes |
| `20260608210000_case_studies_cover_image.sql` | Adds `cover_image_url TEXT` to `case_studies` |
| `20260608220000_blog_system.sql` | `blog_categories`, `blog_posts`, RLS, indexes, `blog-media` storage bucket, view count RPC, seeds 5 default categories |

### Key helper function (already in initial schema)
```sql
public.is_admin() -- returns true if current user has role 'admin' or 'super_admin'
```

---

## 3. What Has Been Built (Completed)

### 3.1 Booking System
- **Public `/schedule`** — multi-step booking wizard (service selection → time slot → contact details → site location map picker → confirmation)
- **Slot engine** — `src/lib/booking/slots.ts` calculates available 2-hour slots from `availability_slots` table, excludes blockouts
- **Server action** `src/app/schedule/actions.ts` — validates with `parseBookingRequest`, creates `customers` + `leads` + `appointments` rows
- **Map picker** — Leaflet-based pin drop at `src/app/schedule/components/site-location-picker.tsx`
- **Pre-select service** — `/schedule?service=ID` pre-fills the service step

### 3.2 Admin Portal
| Route | Status | Notes |
|---|---|---|
| `/admin` | ✅ Wired | Dashboard with real DB stats: new leads, upcoming surveys, recent leads, upcoming appointments |
| `/admin/leads` | ✅ Wired | Lead list with filter by status; links to detail pages |
| `/admin/leads/[id]` | ✅ Wired | Full lead detail, status updates, confirm → appointment conversion |
| `/admin/scheduler` | ✅ Wired | Calendar view + blockout form + confirm lead panel |
| `/admin/services` | ✅ Wired | CRUD for services catalog (active/inactive toggle, sort order) |
| `/admin/services/[id]/content` | ✅ Wired | Service page editor (tagline, hero image, overview markdown, process steps) |
| `/admin/services/[id]/case-studies` | ✅ Wired | Case study list with publish toggle + sort order |
| `/admin/services/[id]/case-studies/new` | ✅ Wired | Blog-like TipTap editor for case studies |
| `/admin/services/[id]/case-studies/[caseId]` | ✅ Wired | Edit case study |
| `/admin/blog` | ✅ Wired | Blog post list with publish/unpublish/delete |
| `/admin/blog/new` | ✅ Wired | Full blog editor (TipTap + cover + preview + categories) |
| `/admin/blog/[id]` | ✅ Wired | Edit blog post |
| `/admin/referrals` | ⚠️ Static | UI only — no DB wiring yet (deferred) |
| `/admin/settings` | ⚠️ Static | UI shell only — buttons don't save (see upcoming work) |

### 3.3 Public Pages
| Route | Status |
|---|---|
| `/` | ✅ Static landing (Hero, services preview, CTA) |
| `/about` | ✅ Static |
| `/services` | ✅ DB-wired (lists active services with links) |
| `/services/[slug]` | ✅ SSG — service detail page with overview, process steps, case study grid |
| `/services/[slug]/[caseSlug]` | ✅ SSG — case study article (uses shared `CaseStudyArticle` component) |
| `/insights` | ✅ DB-wired — paginated grid, category filter |
| `/insights/[slug]` | ✅ SSG — blog article (uses shared `BlogArticle` component) |
| `/schedule` | ✅ DB-wired booking wizard |

### 3.4 Shared Editor System (Reusable for Blog + Case Studies)
All live in `src/components/editor/` and `src/components/content/`:

| Component | Purpose |
|---|---|
| `RichEditor` | TipTap v3 wrapper — toolbar, inline link, `+ Media` button, localStorage draft auto-save |
| `InlineMedia` (extension) | Custom TipTap node: inserts `<figure data-block="media">` for images + YouTube iframes |
| `MediaPanel` | Slide-in drawer: upload inline image, upload cover photo, embed YouTube. Generic — takes `getUploadFolder()` callback + `bucket` prop |
| `StudioPreview` | Preview modal for case studies (uses `CaseStudyArticle` — one source of truth) |
| `BlogPreview` | Preview modal for blog posts (uses `BlogArticle` — one source of truth) |
| `CaseStudyArticle` | Shared renderer: used on `/services/[slug]/[caseSlug]` AND in `StudioPreview` |
| `BlogArticle` | Shared renderer: used on `/insights/[slug]` AND in `BlogPreview` |
| `case-study-body.css` | Dark-navy TipTap HTML typography (`.cs-body` class) — imported by both articles |

### 3.5 API Routes
- `POST /api/admin/upload-media` — admin-authenticated media upload to Supabase Storage. Accepts `file`, `folder`, `bucket` (case-study-media or blog-media)

### 3.6 Auth
- Supabase email/password auth
- `requireAdmin()` server-side guard on all admin routes
- Admin login link subtly placed in footer
- Admin account: `opi.rdev@gmail.com`
- Roles in `profiles`: `super_admin`, `admin`, `staff`

---

## 4. Upcoming Work (Priority Order)

### 4.1 🔔 Notification System — PRIMARY NEXT TASK

**Goal:** Admins receive real-time + email notifications for key business events.

**Events to notify on:**
1. New booking submitted (lead + appointment created)
2. New lead submitted via contact/inquiry form
3. Appointment confirmed / rescheduled / cancelled
4. New case study published (internal)
5. (Deferred) Referral partner generates a new lead

**Design approach:**
- **In-app notifications** — `admin_notifications` table: `id`, `type`, `title`, `body`, `metadata JSONB`, `read`, `created_at`, `recipient_id` (FK to profiles)
- **Bell icon** in admin layout sidebar/top bar with unread count badge
- **Notification drawer** (slide-in panel) listing recent notifications — click navigates to the relevant admin page
- **Email notifications** — Supabase Edge Function OR Next.js API route using Resend/Nodemailer triggered by database webhooks or server actions
- **Trigger points** in existing server actions:
  - `src/app/schedule/actions.ts` → after booking confirmed, insert notification row
  - `src/app/admin/leads/actions.ts` → after lead status change
  - `src/app/admin/scheduler/actions.ts` → after appointment confirm/cancel

**Suggested DB schema:**
```sql
CREATE TABLE public.admin_notifications (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  type        TEXT NOT NULL,  -- 'new_booking' | 'new_lead' | 'appointment_confirmed' | etc.
  title       TEXT NOT NULL,
  body        TEXT,
  href        TEXT,           -- admin URL to navigate to on click
  metadata    JSONB NOT NULL DEFAULT '{}',
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- All admins see all notifications (no per-recipient for now)
-- RLS: admin read/update, server-only insert
```

**Suggested notification bell component:**
```
src/components/admin/notification-bell.tsx  ← Client component, polls or uses Supabase Realtime
src/app/admin/layout.tsx                    ← Add bell to top-right of admin header
src/app/admin/notifications/page.tsx        ← Full notification history page
```

**Email delivery:** Use Resend (free tier covers this). Add `RESEND_API_KEY` to `.env.local`. Create `src/lib/email/send-notification.ts`.

---

### 4.2 🚀 Deployment

**Target:** Vercel (frontend) + Supabase (DB/Auth/Storage)

**Steps:**
1. **Apply all pending migrations** to remote Supabase:
   ```bash
   SUPABASE_DB_PASSWORD=<password> npx supabase db push
   ```
   Or paste each migration SQL file into Supabase Dashboard → SQL Editor.

2. **Vercel deployment:**
   ```bash
   npm i -g vercel
   vercel --prod
   ```
   Set these environment variables in Vercel dashboard:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
   SUPABASE_SECRET_KEY
   RESEND_API_KEY       (once notification email is added)
   ```

3. **next.config.ts** — already has `remotePatterns` for Supabase Storage image URLs.

4. **Auth redirect URLs** — in Supabase Dashboard → Auth → URL Configuration, add:
   - `https://your-vercel-domain.vercel.app/auth/callback`

---

### 4.3 ⚙️ Settings Page

The settings page (`/admin/settings`) is currently a **static UI shell**. Needs wiring:

**Sub-sections to implement:**

1. **Business Information** (already has form UI)
   - Create `business_settings` table or use a single-row config approach
   - Wire the save button to a server action

2. **Notification Preferences** (part of notification system)
   - Per-admin toggles: email on new booking, email on new lead, etc.
   - Stored in `profiles.metadata` JSONB

3. **Staff Management** (see 4.4 below — feeds into this page)

4. **Security** — change password form (Supabase `updateUser`)

**Suggested migration:**
```sql
CREATE TABLE public.business_settings (
  id      INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),  -- single-row table
  phone   TEXT,
  email   TEXT,
  address TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'
);
```

---

### 4.4 👥 Staff Invite System

**Goal:** Super admin can invite new staff/admin users. They receive an email, sign up, and get a `profiles` row with the assigned role.

**Flow:**
1. Admin fills in name + email + role (staff / admin) in Settings → Staff tab
2. Server action calls `supabase.auth.admin.inviteUserByEmail(email, { data: { full_name, role } })`
   - Requires `SUPABASE_SECRET_KEY` (service role) — already in env
3. Supabase sends a magic-link invite email
4. On first sign-in, `auth.callback` route triggers → `profiles` row auto-created via Supabase trigger OR explicit upsert in callback handler
5. Staff can then log in to `/admin`

**DB:** The `profiles` table already exists with `role` column (`super_admin`, `admin`, `staff`).

**Suggested route:** `src/app/admin/settings/staff/page.tsx`

**Key server action:**
```typescript
// src/app/admin/settings/actions.ts
import { createClient } from '@/utils/supabase/server'

export async function inviteStaffMember(email: string, fullName: string, role: 'admin' | 'staff') {
  const supabase = await createClient()  // uses SUPABASE_SECRET_KEY
  const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName, role }
  })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
```

**Auth callback update** (`src/app/auth/callback/route.ts`) — after exchange, upsert `profiles`:
```typescript
await supabase.from('profiles').upsert({
  id: user.id,
  full_name: user.user_metadata.full_name ?? 'Staff',
  role: user.user_metadata.role ?? 'staff',
})
```

---

### 4.5 📣 Referral System (Deferred)

Already has:
- `referral_partners` table in initial schema
- `leads.referral_partner` FK
- Static UI at `/admin/referrals`

**When ready, wire:**
- CRUD for partners
- Unique referral codes (cookie-based tracking already in `src/lib/referrals/cookie.ts`)
- Attribution of leads to partners
- Performance dashboard (conversion rate, leads per partner)

---

## 5. File Structure Reference

```
src/
  app/
    admin/
      blog/               ← Blog CMS (fully wired)
        components/
          blog-editor.tsx
          blog-list.tsx
        actions.ts
        page.tsx
        new/page.tsx
        [id]/page.tsx
      leads/              ← Lead management (fully wired)
      scheduler/          ← Calendar + blockouts (fully wired)
      services/           ← Service + case study CMS (fully wired)
      referrals/          ← STATIC — needs DB wiring
      settings/           ← STATIC shell — needs wiring
      layout.tsx          ← Sidebar nav + requireAdmin guard
    api/
      admin/upload-media/ ← Authenticated media upload to Storage
    insights/             ← Public blog (fully wired)
    schedule/             ← Public booking wizard (fully wired)
    services/             ← Public service + case study pages (fully wired)
  components/
    content/
      blog-article.tsx    ← ONE SOURCE OF TRUTH for blog rendering
      case-study-article.tsx  ← ONE SOURCE OF TRUTH for case study rendering
      case-study-body.css ← Shared TipTap HTML typography (dark navy)
      markdown-content.tsx
    editor/
      rich-editor.tsx     ← TipTap editor (reused by blog + case studies)
      rich-editor.css
      media-panel.tsx     ← Generic media upload panel
      blog-preview.tsx    ← Uses BlogArticle
      studio-preview.tsx  ← Uses CaseStudyArticle
      extensions/
        inline-media.ts   ← Custom TipTap figure node
    layout/
      Navbar.tsx
      Footer.tsx          ← Has subtle admin login link
    home/Hero.tsx
  lib/
    blog/                 ← types, queries, validation
    booking/              ← slots, validation, datetime utils, phone, geocode
    leads/                ← queries, status helpers
    scheduler/            ← queries
    service-pages/        ← types, queries, validation, youtube parser
    services/             ← queries, slug
    auth/                 ← requireAdmin, getAdminProfile
    parse-result.ts       ← ParseResult<T> type (no Zod)
  types/
    database.types.ts     ← Supabase-generated types (needs regeneration after migrations applied)
supabase/
  migrations/             ← 8 migration files (see section 2)
```

---

## 6. Known Gaps / Technical Debt

1. **`database.types.ts` is stale** — doesn't include `service_pages`, `case_studies`, `blog_posts`, `blog_categories` tables. Regenerate after applying migrations:
   ```bash
   npx supabase gen types typescript --project-id stcacpadxbugkmnomzzk > src/types/database.types.ts
   ```

2. **Admin layout has no notification bell yet** — the layout (`src/app/admin/layout.tsx`) renders a static sidebar; the top bar has no header area for a bell icon. Will need a layout redesign or a top-bar component added.

3. **`incrementBlogViewCount` uses an RPC** (`increment_blog_view_count`) — the Supabase function is defined in the migration but the TypeScript type doesn't know about it, hence a `.maybeSingle()` workaround. Will type correctly after regenerating types.

4. **Case study wizard (`case-study-wizard.tsx`) still exists** but is no longer used — the new `case-study-editor.tsx` replaced it. The wizard file can be deleted.

5. **`/insights` uses `getPublishedBlogPosts` with `categorySlug` filter** — this filter works via PostgREST's foreign-table filtering syntax (`eq('blog_categories.slug', ...)`) which may behave differently depending on join type. Verify in Supabase.

6. **No email template system yet** — once notifications are wired, email templates need to be designed.

---

## 7. Commands

```bash
# Dev server
npm run dev

# Type check
npx tsc --noEmit

# Tests (31 passing)
npm test

# Production build
npm run build

# Apply DB migrations to remote
SUPABASE_DB_PASSWORD=<pw> npx supabase db push

# Regenerate DB types
npx supabase gen types typescript --project-id stcacpadxbugkmnomzzk > src/types/database.types.ts
```

---

## 8. Next Session — Recommended Order

1. **Apply all migrations** to remote Supabase DB (required before any live testing)
2. **Deploy to Vercel** (set env vars, add auth callback URL)
3. **Notification system** — DB table → server action triggers → bell component → email via Resend
4. **Staff invite** — `inviteUserByEmail` server action → Settings → Staff tab
5. **Settings page wiring** — `business_settings` table + save action
6. **Referral system** — wire existing UI to DB

---

*Build status: ✅ All TypeScript checks passing. All 31 tests passing. Production build clean.*
