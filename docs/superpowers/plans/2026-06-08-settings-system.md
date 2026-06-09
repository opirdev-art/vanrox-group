# Settings System — Full Requirements Plan

**Date:** 2026-06-08  
**Status:** Approved design — implementation pending  
**Current state:** `/admin/settings` has four decorative cards and one wired form (Business Information). Security, Notifications, and Data Management are non-functional.

---

## 1. Route Architecture

Convert the flat page into a **sub-routed settings hub** with secondary navigation.

```
/admin/settings                  → hub/redirect → /admin/settings/general
/admin/settings/general          → Business Information
/admin/settings/security         → Change password, session management
/admin/settings/notifications    → Per-event notification toggles
/admin/settings/staff            → Invite, manage, deactivate staff (super_admin only)
/admin/settings/data             → Audit log viewer, exports
```

### 1.1 Shared settings layout

`src/app/admin/settings/layout.tsx` — wraps all sub-routes with a secondary tab nav:

```
[ General ] [ Security ] [ Notifications ] [ Staff* ] [ Data* ]
```

`*` — Staff and Data tabs visible to `super_admin` only; hidden for `admin` and `staff` roles.

`requireAdmin()` already fires at the top-level admin layout. Each settings action additionally enforces role where needed.

### 1.2 Existing form migration

Move the Business Information form from `page.tsx` into `general/page.tsx`. The root `page.tsx` becomes a redirect to `./general`.

---

## 2. General — `/admin/settings/general`

### 2.1 What it covers

- **Business Information** (already implemented — migrate here)
- No new DB schema required

### 2.2 Business Information (existing — move)

Already wired via:
- `src/lib/settings/queries.ts` → `getBusinessSettings()`
- `src/app/admin/settings/actions.ts` → `saveBusinessSettings()`
- `src/app/admin/settings/components/business-settings-form.tsx`

Migration to `/general/page.tsx` is a file move only; no logic changes.

---

## 3. Security — `/admin/settings/security`

### 3.1 What it covers

1. Change password (current user only)
2. Active sessions list
3. Sign out all other sessions

### 3.2 Change password

**Flow:**
1. User submits: current password + new password + confirm new password
2. Server action re-authenticates with `signInWithPassword` to verify current password
3. On success, call `supabase.auth.updateUser({ password: newPassword })`
4. Emit `auth.password.changed` notification event (Phase 3 of notification system)

**Validation (`src/lib/settings/security-validation.ts`):**
```typescript
type ChangePasswordInput = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
// Rules:
// - all fields present
// - newPassword length >= 8, has mix of types
// - confirmPassword === newPassword
// - newPassword !== currentPassword
```

**Server action (`src/app/admin/settings/security/actions.ts`):**
```typescript
export async function changePassword(formData: FormData): Promise<SettingsActionResult>
  // 1. requireAdmin()
  // 2. parse + validate
  // 3. supabase.auth.signInWithPassword({ email, password: currentPassword })
  //    → re-auth proves possession of current password
  // 4. supabase.auth.updateUser({ password: newPassword })
  // 5. emit auth.password.changed event
  // 6. return { ok: true }
```

**Security notes:**
- Never log passwords
- Rate limit consideration: Supabase Auth handles brute-force on `signInWithPassword`
- Confirmation email sent via notification system (not Supabase default)

### 3.3 Active sessions

**Display:** List of active sessions for current user using `supabase.auth.admin.listUserSessions(userId)` (requires `SUPABASE_SECRET_KEY` / service role).

Show per session: `created_at`, `not_after`, approximate device/browser from `user_agent` (parsed minimally).

### 3.4 Sign out all other sessions

**Server action:**
```typescript
export async function revokeOtherSessions(): Promise<SettingsActionResult>
  // 1. requireAdmin()
  // 2. supabase.auth.admin.signOut(userId, 'others')
  //    → revokes all sessions EXCEPT the current one
  // 3. emit auth.session.revoked_others event (audit only)
```

**DB:** No new tables. Uses Supabase Auth admin API only.

---

## 4. Notifications — `/admin/settings/notifications`

### 4.1 What it covers

Per-admin toggles for notification channels per event type, wired to the notification architecture defined in `2026-06-08-notification-architecture.md`.

### 4.2 Storage

Preferences stored in `profiles.metadata.notification_preferences` as a JSONB object:

```json
{
  "notification_preferences": {
    "business.booking.created":   { "in_app": true, "email": true },
    "business.appointment.confirmed": { "in_app": true, "email": true },
    "auth.login.unauthorized":    { "in_app": true, "email": true }
  }
}
```

Events not explicitly stored use the system defaults defined in the notification architecture matrix.

### 4.3 UI

Grouped table of toggles, one row per configurable event type, two toggle columns (In-app / Email):

```
Event                            In-app    Email
──────────────────────────────────────────────────
New Booking                        ●         ●
Lead Status Changed                ●         ○
Appointment Confirmed              ●         ●
Appointment Cancelled              ●         ●
Blog Post Published                ●         ○
Case Study Published               ●         ○
──────────── Security ─────────────────────────────
Unauthorized Login Attempt         ●         ●  (super_admin only)
Staff Invited                      ●         —  (fixed: always on)
Password Changed                   ●         —  (fixed: always on)
```

Fixed-always-on events show a lock icon, not a toggle.

### 4.4 Server action (`src/app/admin/settings/notifications/actions.ts`)

```typescript
type NotificationPreferencesInput = Record<
  string,
  { in_app: boolean; email: boolean }
>

export async function saveNotificationPreferences(
  formData: FormData
): Promise<SettingsActionResult>
  // 1. requireAdmin() → get user id
  // 2. parse toggles from formData
  // 3. validate against allowed event type set
  // 4. supabase.from('profiles').update({ metadata: { notification_preferences } })
  //    .eq('id', userId)
  // 5. revalidatePath('/admin/settings/notifications')
```

**No new DB tables.** Uses existing `profiles.metadata`.

---

## 5. Staff — `/admin/settings/staff`

### 5.1 Access

`super_admin` role only. `admin` and `staff` redirected to `/admin/settings/general` with an error.

### 5.2 What it covers

1. Staff list (all active profiles, excluding self)
2. Invite new staff member
3. Change staff role
4. Deactivate staff member

### 5.3 Staff list query (`src/lib/settings/staff-queries.ts`)

```typescript
type StaffMember = {
  id: string
  full_name: string
  role: string
  created_at: string
  deleted_at: string | null
}

export async function getAllStaffProfiles(): Promise<StaffMember[]>
  // supabase.from('profiles').select(...)
  // .is('deleted_at', null)
  // .order('created_at', { ascending: false })
```

### 5.4 Invite action

**Requires service role client** (`SUPABASE_SECRET_KEY`). Need a `createAdminClient()` utility that uses `SUPABASE_SECRET_KEY` instead of the publishable key — this must be server-only.

```typescript
// src/utils/supabase/admin-client.ts
// import { createClient as createSupabaseClient } from '@supabase/supabase-js'
// export function createAdminClient() → uses SUPABASE_SECRET_KEY
// MUST NOT be imported from any client component or 'use client' file
```

**Action:**
```typescript
export async function inviteStaffMember(
  email: string,
  fullName: string,
  role: 'admin' | 'staff'
): Promise<SettingsActionResult>
  // 1. requireAdmin() → assert role === 'super_admin'
  // 2. validate email, fullName, role
  // 3. const adminClient = createAdminClient()
  // 4. adminClient.auth.admin.inviteUserByEmail(email, {
  //      data: { full_name: fullName },
  //      options: { redirectTo: `${APP_URL}/auth/callback?next=/admin` }
  //    })
  //    NOTE: role goes into app_metadata via a step below, NOT user_metadata
  // 5. After invite, update app_metadata to set role:
  //    adminClient.auth.admin.updateUserById(invitedUser.id, {
  //      app_metadata: { role }
  //    })
  // 6. emit auth.staff.invited notification event
```

**Auth callback update** (`src/app/auth/callback/route.ts`):

After `exchangeCodeForSession` succeeds, upsert profiles row using `app_metadata.role` (safe — not user-editable):

```typescript
const { data: { user } } = await supabase.auth.getUser()
if (user) {
  const role = user.app_metadata?.role ?? 'staff'
  const fullName = user.app_metadata?.full_name
               ?? user.user_metadata?.full_name
               ?? 'Staff Member'
  await supabase.from('profiles').upsert(
    { id: user.id, full_name: fullName, role },
    { onConflict: 'id', ignoreDuplicates: false }
  )
  // emit auth.staff.invite_accepted if first login (profile.created_at = now)
}
```

### 5.5 Change role action

```typescript
export async function changeStaffRole(
  targetUserId: string,
  newRole: 'admin' | 'staff'
): Promise<SettingsActionResult>
  // 1. requireAdmin() → assert role === 'super_admin'
  // 2. assert targetUserId !== actorId (cannot change own role)
  // 3. supabase.from('profiles').update({ role: newRole }).eq('id', targetUserId)
  // 4. adminClient.auth.admin.updateUserById(targetUserId, {
  //      app_metadata: { role: newRole }
  //    })
  // 5. emit auth.staff.role_changed
```

### 5.6 Deactivate action

```typescript
export async function deactivateStaffMember(
  targetUserId: string
): Promise<SettingsActionResult>
  // 1. requireAdmin() → assert role === 'super_admin'
  // 2. assert targetUserId !== actorId (cannot deactivate self)
  // 3. adminClient.auth.admin.signOut(targetUserId, 'global') → revoke all sessions
  // 4. supabase.from('profiles').update({ deleted_at: NOW() }).eq('id', targetUserId)
  // 5. emit auth.staff.deactivated
```

**DB:** No new tables. `profiles.deleted_at` already exists for soft deletes.

---

## 6. Data Management — `/admin/settings/data`

### 6.1 Access

`super_admin` for audit log viewer.  
Both `admin` and `super_admin` for exports (export your own operational data).

### 6.2 Audit Log Viewer

Reads from `public.audit_logs` (RLS: `super_admin` only — already in schema).

Display: paginated table — `created_at`, `action`, `table_name`, `record_id`, `user_id` (resolved to `full_name`).

```typescript
// src/lib/settings/audit-queries.ts
export async function getAuditLogs(page: number, limit: number): Promise<{
  rows: AuditLogRow[]
  total: number
}>
```

No new DB tables required.

### 6.3 Data Exports

Server-rendered CSV downloads via Route Handlers:

| Export | Route | Data | Access |
|---|---|---|---|
| Leads | `GET /api/admin/export/leads` | leads + customer name/email/phone | admin+ |
| Appointments | `GET /api/admin/export/appointments` | appointments + lead title + status | admin+ |
| Customers | `GET /api/admin/export/customers` | customers table | admin+ |

**Route handler pattern:**

```typescript
// src/app/api/admin/export/leads/route.ts
export async function GET() {
  // 1. requireAdmin() (server-side, throws redirect)
  // 2. query full dataset (no pagination — export)
  // 3. build CSV string with header row
  // 4. return new Response(csv, {
  //      headers: {
  //        'Content-Type': 'text/csv',
  //        'Content-Disposition': 'attachment; filename="leads-YYYY-MM-DD.csv"'
  //      }
  //    })
}
```

**No new DB tables.**

---

## 7. DB Changes Required

| Migration | Required for | Priority |
|---|---|---|
| `business_settings` — already created | General | Done |
| None — staff/security use existing tables + Auth API | Staff, Security | — |
| None — notifications use `profiles.metadata` | Notifications | — |
| None — exports/audit use existing tables | Data | — |

The only pending DB work is in the **notification architecture** plan (Phase 1: `notification_events`, `admin_notifications`, `notification_deliveries`).

---

## 8. Admin Client Utility (required for Staff section)

```
src/utils/supabase/admin-client.ts   ← new file, server-only
```

This creates a Supabase client using `SUPABASE_SECRET_KEY` (service role). It must:

- Only be imported in server-side files (`'use server'` actions, Route Handlers)
- Never be imported in any `'use client'` component — enforced by `server-only` package import

```typescript
import 'server-only'
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  )
}
```

---

## 9. Settings Layout

`src/app/admin/settings/layout.tsx` — secondary tab navigation:

```typescript
// Server Component — reads user role to conditionally show Staff + Data tabs
export default async function SettingsLayout({ children }) {
  const { profile } = await requireAdmin()
  const isSuperAdmin = profile.role === 'super_admin'

  // render tab bar with role-gated tabs, then {children}
}
```

Tab items:
```typescript
const SETTINGS_TABS = [
  { label: 'General',       href: '/admin/settings/general' },
  { label: 'Security',      href: '/admin/settings/security' },
  { label: 'Notifications', href: '/admin/settings/notifications' },
  { label: 'Staff',         href: '/admin/settings/staff',      superAdminOnly: true },
  { label: 'Data',          href: '/admin/settings/data',       superAdminOnly: true },
]
```

---

## 10. File Structure After Implementation

```
src/app/admin/settings/
  layout.tsx                         ← NEW: secondary tab nav with role gate
  page.tsx                           ← redirect → ./general
  general/
    page.tsx                         ← Business Information (moved from settings/page.tsx)
  security/
    page.tsx                         ← Change password + sessions UI
    actions.ts                       ← NEW: changePassword, revokeOtherSessions
    components/
      change-password-form.tsx       ← NEW
      sessions-panel.tsx             ← NEW
  notifications/
    page.tsx                         ← Toggle grid UI
    actions.ts                       ← NEW: saveNotificationPreferences
    components/
      notification-preferences-form.tsx  ← NEW
  staff/
    page.tsx                         ← Staff list + invite form (super_admin only)
    actions.ts                       ← NEW: inviteStaffMember, changeStaffRole, deactivateStaffMember
    components/
      staff-list.tsx                 ← NEW
      invite-staff-form.tsx          ← NEW
  data/
    page.tsx                         ← Audit log + export buttons
    components/
      audit-log-table.tsx            ← NEW
      export-buttons.tsx             ← NEW
  actions.ts                         ← EXISTING: saveBusinessSettings (move to general/actions.ts)
  components/
    business-settings-form.tsx       ← EXISTING (move to general/components/)

src/lib/settings/
  queries.ts                         ← EXISTING: getBusinessSettings
  validation.ts                      ← EXISTING: parseBusinessSettingsForm
  errors.ts                          ← EXISTING: isBusinessSettingsTableUnavailable
  security-validation.ts             ← NEW: parseChangePasswordForm
  staff-queries.ts                   ← NEW: getAllStaffProfiles
  audit-queries.ts                   ← NEW: getAuditLogs

src/utils/supabase/
  server.ts                          ← EXISTING
  client.ts                          ← EXISTING
  admin-client.ts                    ← NEW: createAdminClient (server-only)

src/app/api/admin/export/
  leads/route.ts                     ← NEW
  appointments/route.ts              ← NEW
  customers/route.ts                 ← NEW
```

---

## 11. Implementation Sequence

### Step 1 — Settings layout + routing skeleton
- Create `settings/layout.tsx` with tab nav (role-gated)
- Add `settings/general/page.tsx` (move existing Business Info content)
- Update `settings/page.tsx` to redirect → `./general`
- Add stub pages for each other tab (empty sections with headings)

### Step 2 — Security tab
- `createAdminClient()` utility
- `security-validation.ts`
- `security/actions.ts` (changePassword, revokeOtherSessions)
- `change-password-form.tsx` + `sessions-panel.tsx`

### Step 3 — Staff tab
- `staff-queries.ts`
- `staff/actions.ts` (invite, role change, deactivate)
- `staff-list.tsx` + `invite-staff-form.tsx`
- Update `auth/callback/route.ts` for profile upsert from app_metadata

### Step 4 — Notifications tab
- `notifications/actions.ts` (saveNotificationPreferences)
- `notification-preferences-form.tsx`
- Wire to notification architecture preferences model

### Step 5 — Data tab
- `audit-queries.ts` + `audit-log-table.tsx`
- Three export route handlers
- `export-buttons.tsx`

---

## 12. Security Checklist

| Concern | Mitigation |
|---|---|
| Service role key exposure | `createAdminClient` uses `server-only` import guard |
| Admin client in browser | `server-only` + lint/TS will catch wrong import context |
| Staff invite role assignment | Role via `app_metadata` (not `user_metadata`, which is user-editable) |
| Self-deactivation / self-role-change | Assert `targetUserId !== actorId` in every staff action |
| Password change without re-auth | Re-authenticate with `signInWithPassword` before `updateUser` |
| Audit log access | `super_admin` only via existing RLS policy |
| Export access | `requireAdmin()` in every route handler |
| Deactivation without session revoke | `auth.admin.signOut(userId, 'global')` before soft delete |
