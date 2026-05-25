# VANROX Engineering & Surveying Services - Design Specification

**Date:** 2026-05-25
**Location:** Scarborough, Tobago
**Target Domain:** vanrox-group.com
**Tech Stack:** Next.js (App Router), Tailwind CSS, Supabase (PostgreSQL, Auth, Storage, Edge Functions).

---

## 1. Project Overview
VANROX is a professional engineering and surveying firm based in Tobago. This platform will serve as their primary digital storefront, lead generation engine, and operational hub. It replaces the initial static concept with a dynamic, data-driven Next.js application integrated with a custom administrative suite.

### Key Goals
- Establish professional credibility in the Tobago/Trinidad market.
- Capture leads through a custom scheduling and quote request system.
- Drive organic traffic via a specialized "Land Insights" blog.
- Track and incentivize professional referrals.
- Provide a 100% custom admin interface for business management.

---

## 2. Site Map

### Public Pages (Next.js App Router)
- `/` (Home): Hero, Value Proposition, Featured Services, Trust signals.
- `/about`: Company history, Licensed status, Pillars of excellence.
- `/services`: Detailed breakdown of Boundary, Topographic, Construction, and Cadastral services.
- `/insights`: Blog listing page (SEO-optimized articles).
- `/insights/[slug]`: Individual article pages.
- `/schedule`: Multi-step booking/quote request flow.
- `/referral`: Information for partners (Real Estate, Lawyers) to join the referral network.
- `/contact`: Direct contact information (Phone: 2721240) and simple lead form.

### Admin Pages (Authenticated via Supabase Auth)
- `/admin`: Dashboard overview (New leads, upcoming appointments).
- `/admin/scheduler`: Calendar view with manual "Block Out" capabilities.
- `/admin/blog`: Article editor (Markdown/Rich Text) and management.
- `/admin/referrals`: Referral partner directory and lead tracking.
- `/admin/leads`: Detailed view of all quote requests and bookings.

---

## 3. Database Schema (Supabase/PostgreSQL)

Following Supabase best practices for performance and security (RLS).

### 3.1 Profiles (Public/Admin)
Tracks user data for the admin panel.
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'staff')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3.2 Services
The catalog of surveying services offered.
```sql
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  base_price_info TEXT, -- Descriptive, as surveying costs vary
  duration_estimate TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3.3 Blog Posts
Articles for SEO and lead conversion.
```sql
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL, -- Markdown or JSON for Rich Text
  excerpt TEXT,
  featured_image_url TEXT,
  category TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3.4 Referral Partners
Tracks professional partners who refer business.
```sql
CREATE TABLE referral_partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  referral_code TEXT UNIQUE NOT NULL, -- Generated (e.g., VAN-MOTT-123)
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3.5 Appointments & Leads
Unified table for bookings, block-outs, and general quotes.
```sql
CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES services(id),
  referral_partner_id UUID REFERENCES referral_partners(id),
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  location_address TEXT, -- Specific to the survey site
  requested_date DATE,
  requested_time_slot TIME,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'blocked')),
  notes TEXT,
  is_blockout BOOLEAN DEFAULT FALSE, -- Used for manual schedule blocking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 4. Core System Logic

### 4.1 Custom Scheduler Engine
- **Availability Logic**: A server-side check looks at `appointments` where `status` is 'confirmed' or 'blocked'.
- **Client Flow**: Clients select a service -> Select date (calendar shows available slots) -> Provide site details -> Submit.
- **Admin Manual Block**: Admin can create an "Appointment" with `is_blockout = true` and `status = 'blocked'` to instantly remove that slot from the public calendar.

### 4.2 In-House Referral System
- **Tracking**: Partners are given a unique URL (e.g., `vanrox-group.com/schedule?ref=CODE`).
- **Attribution**: The frontend stores the `ref` code in a session/cookie. When a lead is submitted, the `referral_partner_id` is automatically linked in the database.
- **Transparency**: Admin view shows which partners are generating the most value.

### 4.3 Content Management
- **SEO Strategy**: Each blog post will have custom metadata fields. Next.js will use `generateMetadata` for dynamic SEO tags.
- **Media**: Images stored in Supabase Storage buckets.

---

## 5. Security & Performance
- **Row-Level Security (RLS)**: 
    - `profiles`, `referral_partners`, and `appointments` (non-public fields) will have RLS enabled to prevent unauthorized access.
    - Public can `INSERT` into `appointments` and `SELECT` from `posts` and `services`.
- **Indexing**: B-tree indexes on `slug` and `requested_date` for fast lookups.
- **Caching**: ISR (Incremental Static Regeneration) for blog posts to ensure fast load times while allowing updates.

---

## 6. Development Milestones
1. **Infrastructure**: Supabase setup + Schema migration.
2. **Core Website**: Marketing pages + Tailwind implementation.
3. **Admin Core**: Auth + Blog management.
4. **Custom Scheduler**: Frontend calendar UI + Backend availability logic.
5. **Referral Layer**: Attribution logic + Partner management.
6. **Final Launch**: Domain connection + SEO audit.

---
