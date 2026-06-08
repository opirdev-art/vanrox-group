# Booking & Admin Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship admin auth + scheduler foundation + testable booking engine, then wire public `/schedule` to Supabase.

**Architecture:** Admin-first. Postgres RPCs (`get_available_slots`, `create_booking_request`) handle availability and atomic lead creation under RLS. Pure TypeScript slot logic in `src/lib/booking/` mirrors RPC rules and is covered by Vitest. Next.js Server Actions call Supabase; admin routes guarded by `require-admin` + proxy session check.

**Tech Stack:** Next.js 16 App Router, Supabase SSR, PostgreSQL RPCs, Vitest, Zod

**Spec:** `docs/superpowers/specs/2026-06-08-booking-and-admin-design.md`

---

## Phase 0: Test Tooling

- [x] Install vitest + configure `vitest.config.ts` with `@/*` paths
- [x] Add `npm test` and `npm run test:watch` scripts
- [x] Write failing `slots.test.ts` → implement `src/lib/booking/slots.ts`
- [x] Write failing `phone.test.ts` → implement `src/lib/booking/phone.ts`
- [x] Write failing `validation.test.ts` → implement `src/lib/booking/validation.ts`

## Phase 1–3: Database

- [x] Create `supabase/migrations/20260608000000_scheduler_and_booking.sql`
- [ ] Push migration: `supabase db push` (CLI pooler error — apply via Dashboard SQL or retry link)
- [ ] Regenerate types: `npm run supabase:types:linked`
- [ ] Create admin user in Dashboard + `UPDATE profiles SET role = 'admin'`

## Phase 2: Admin Auth

- [x] `src/app/login/page.tsx` — email/password form
- [x] `src/app/auth/callback/route.ts` — OAuth/code exchange
- [x] `src/lib/auth/require-admin.ts` — role guard for admin layout
- [x] Fix `src/utils/supabase/middleware.ts` — redirect `/admin/*` when no session
- [x] Wire logout in `src/app/admin/layout.tsx`

## Phase 4: Slot Engine (tests green)

- [x] `buildSlotsForDay` handles weekly hours, busy ranges, Tobago UTC-4
- [x] All Phase A tests pass (8 tests)

## Phase 5: Admin Leads

- [x] `/admin/leads` server-fetched list with status filters
- [x] `/admin/leads/[id]` detail + status update Server Action
- [x] Dashboard wired to real lead data
- [x] TDD: `src/lib/leads/status.ts`, `format.ts` (7 tests)

## Phase 6: Admin Scheduler

- [x] Month calendar view from `appointments`
- [x] Blockout create Server Action + form
- [x] Confirm appointment from lead (`?lead=id` panel)
- [ ] Cancel appointment UI (action exists, no button yet)

## Phase 7: Public Booking (next)

- [ ] Refactor `/schedule` to 4 steps
- [ ] `schedule/actions.ts` → RPC calls
- [ ] Referral cookie middleware

---

## Task Detail: Phase 0 — slots.test.ts

**Files:**
- Create: `src/lib/booking/slots.ts`
- Create: `src/lib/booking/__tests__/slots.test.ts`
- Create: `vitest.config.ts`

- [ ] **Step 1:** Write failing tests for Mon 8–5 / 60min slots (9 slots)
- [ ] **Step 2:** Run `npm test` — confirm FAIL
- [ ] **Step 3:** Implement minimal `buildSlotsForDay`
- [ ] **Step 4:** Run `npm test` — confirm PASS

## Task Detail: Phase 2 — require-admin

**Files:**
- Create: `src/lib/auth/require-admin.ts`
- Modify: `src/app/admin/layout.tsx`
- Modify: `src/utils/supabase/middleware.ts`

- [ ] **Step 1:** Middleware redirects unauthenticated `/admin` → `/login`
- [ ] **Step 2:** `requireAdmin()` loads profile, redirects if not admin
- [ ] **Step 3:** Login page signs in and redirects to `/admin`

---

*Implementation in progress — checkboxes updated as work completes.*
