-- ==============================================================================
-- VANROX ENGINEERING & SURVEYING SERVICES - REFINED PRODUCTION SCHEMA
-- Date: 2026-05-25
-- Standards: 3NF, Supabase RLS, Soft Deletes, Polymorphic Audit Logging
-- ==============================================================================

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. BASE UTILITIES & TRIGGERS
-- Standard function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. CORE: ADMINISTRATION & USERS
-- Extends Supabase Auth users with business-specific roles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'staff' CHECK (role IN ('super_admin', 'admin', 'staff')),
    avatar_url TEXT,
    bio TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete support
);

-- 3. CONTENT: SERVICES CATALOG
-- Professional catalog of offerings (Boundary, Topo, etc.)
CREATE TABLE IF NOT EXISTS public.services (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    features TEXT[], -- Array of bullet points
    base_price_cents BIGINT, -- Stored in cents to avoid float issues
    duration_estimate_hours INT,
    sort_order INT DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 4. CONTENT: INSIGHTS BLOG
-- Categories for both posts and services (Taxonomy)
CREATE TABLE IF NOT EXISTS public.categories (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Blog articles for authority and SEO
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    category_id BIGINT REFERENCES public.categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL, -- Full markdown or HTML
    featured_image TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,
    seo_title TEXT,
    seo_description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 5. CRM: PARTNERS & CUSTOMERS
-- Professional referral partners (Real Estate, Lawyers, etc.)
CREATE TABLE IF NOT EXISTS public.referral_partners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    company TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    referral_code TEXT UNIQUE NOT NULL,
    commission_rate_bps INT DEFAULT 0, -- Basis points (100 = 1%)
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Core customer data (Leads eventually become customers)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 6. SALES & OPERATIONS: LEADS, APPOINTMENTS, PAYOUTS
-- Sales inquiries from the website
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    service_id BIGINT REFERENCES public.services(id) ON DELETE SET NULL,
    referral_partner_id UUID REFERENCES public.referral_partners(id) ON DELETE SET NULL,
    source TEXT DEFAULT 'website', -- website, direct, referral
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'converted', 'lost', 'spam')),
    inquiry_details TEXT,
    site_location TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Operational schedule (visits to site)
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    assigned_staff_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'noshow')),
    is_blockout BOOLEAN DEFAULT FALSE, -- Flag for manual "Off Time"
    location_geo POINT, -- Optional geo coordinates for Tobago sites
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Financial tracking for referrals
CREATE TABLE IF NOT EXISTS public.referral_payouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    partner_id UUID REFERENCES public.referral_partners(id) NOT NULL,
    lead_id UUID REFERENCES public.leads(id) NOT NULL,
    amount_cents BIGINT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
    paid_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 7. AUDIT: SYSTEM-WIDE LOGGING
-- Tracks who changed what for professional accountability
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- e.g., 'INSERT', 'UPDATE', 'DELETE'
    table_name TEXT NOT NULL,
    record_id UUID, -- Polymorphic reference
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ==============================================================================
-- RLS POLICIES (Supabase Security)
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Shared Policy Helpers: (SELECT auth.uid()) is cached by Postgres for performance
-- ADMIN POLICY: Grants full access to admins/super_admins
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = (SELECT auth.uid()) 
    AND role IN ('admin', 'super_admin')
    AND deleted_at IS NULL
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 1. Profiles
CREATE POLICY "Public profiles are readable" ON public.profiles FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (id = (SELECT auth.uid()));

-- 2. Services / Categories
CREATE POLICY "Services are readable by all" ON public.services FOR SELECT USING (is_active = TRUE AND deleted_at IS NULL);
CREATE POLICY "Admins can manage services" ON public.services FOR ALL USING (public.is_admin());
CREATE POLICY "Categories readable by all" ON public.categories FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (public.is_admin());

-- 3. Posts
CREATE POLICY "Published posts readable by all" ON public.posts FOR SELECT USING (is_published = TRUE AND deleted_at IS NULL);
CREATE POLICY "Admins can manage posts" ON public.posts FOR ALL USING (public.is_admin());

-- 4. CRM & Operations (Private to Admin/Staff)
CREATE POLICY "Staff can view CRM data" ON public.customers FOR SELECT USING (public.is_admin() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid())));
CREATE POLICY "Admins manage everything else" ON public.referral_partners FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage leads" ON public.leads FOR ALL USING (public.is_admin());
CREATE POLICY "Public can create leads" ON public.leads FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Public can create customers" ON public.customers FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admins manage appointments" ON public.appointments FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage payouts" ON public.referral_payouts FOR ALL USING (public.is_admin());

-- 5. Audit Logs
CREATE POLICY "Only super admins view logs" ON public.audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = (SELECT auth.uid()) AND role = 'super_admin')
);

-- ==============================================================================
-- INDEXES & PERFORMANCE
-- ==============================================================================

-- Foreign Key Indexes (Essential for JOIN performance)
CREATE INDEX IF NOT EXISTS idx_posts_author ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category_id);
CREATE INDEX IF NOT EXISTS idx_leads_customer ON public.leads(customer_id);
CREATE INDEX IF NOT EXISTS idx_leads_referral ON public.leads(referral_partner_id);
CREATE INDEX IF NOT EXISTS idx_appointments_lead ON public.appointments(lead_id);
CREATE INDEX IF NOT EXISTS idx_appointments_staff ON public.appointments(assigned_staff_id);

-- Performance & Uniqueness Indexes
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_services_slug ON public.services(slug) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_timerange ON public.appointments(start_time, end_time) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_referral_partners_code ON public.referral_partners(referral_code) WHERE deleted_at IS NULL;

-- ==============================================================================
-- TRIGGERS & AUTOMATION
-- ==============================================================================

-- Updated At Timestamps
CREATE TRIGGER set_timestamp_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER set_timestamp_services BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER set_timestamp_posts BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER set_timestamp_partners BEFORE UPDATE ON public.referral_partners FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER set_timestamp_leads BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER set_timestamp_appointments BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Sync Auth Users to Profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'New Member'),
    new.raw_user_meta_data->>'avatar_url',
    'staff'
  );
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Audit Log Trigger (Polymorphic)
-- This captures any manual change in critical tables
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_data, new_data)
  VALUES (
    (SELECT auth.uid()),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach Audit to critical business tables
CREATE TRIGGER audit_services AFTER INSERT OR UPDATE OR DELETE ON public.services FOR EACH ROW EXECUTE PROCEDURE audit_trigger_func();
CREATE TRIGGER audit_leads AFTER INSERT OR UPDATE OR DELETE ON public.leads FOR EACH ROW EXECUTE PROCEDURE audit_trigger_func();
CREATE TRIGGER audit_appointments AFTER INSERT OR UPDATE OR DELETE ON public.appointments FOR EACH ROW EXECUTE PROCEDURE audit_trigger_func();
CREATE TRIGGER audit_referral_partners AFTER INSERT OR UPDATE OR DELETE ON public.referral_partners FOR EACH ROW EXECUTE PROCEDURE audit_trigger_func();
