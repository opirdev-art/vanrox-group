# Notification System — Architecture & Requirements

**Date:** 2026-06-08  
**Status:** Approved design — implementation pending  
**Principles:** Provider-agnostic, event-driven, auditable, idempotent, security-first

---

## 1. Purpose

Build one notification platform for VANROX that handles:

1. **Business operations** — bookings, leads, appointments, content publishing
2. **Authentication & access** — login, logout, invites, password lifecycle, unauthorized access
3. **Staff lifecycle** — invite, acceptance, role changes, deactivation

Email delivery uses a **swappable provider adapter** (Resend first). Domain logic must never import vendor SDKs.

---

## 2. Non-Negotiable Standards

| Standard | Requirement |
|---|---|
| Single pipeline | All notifications flow through `NotificationOrchestrator` |
| Typed events | Strict per-event payload schemas; no untyped `Record<string, unknown>` in core paths |
| Provider isolation | `EmailProvider` interface + factory; swap Resend without touching orchestrator |
| Idempotency | Deterministic keys; unique DB constraint; safe replays |
| Auditability | Immutable event log + per-channel delivery records |
| Security | No secrets/tokens/passwords in notification bodies; RLS on all tables |
| Failure handling | Transient retries with backoff; permanent failures surfaced in admin |
| Delivery mode | Queue-first async for external channels (`email`); no provider calls in request path |
| Testability | `NoopEmailProvider` for dev/tests; contract tests per adapter |
| Observability | Structured logs with `eventId`, `eventType`, `channel`, `provider`, `status` |

---

## 3. Event Taxonomy

Events are namespaced string literals. Every event shares a common envelope; payload is event-specific.

### 3.1 Envelope (all events)

```typescript
type DomainEventEnvelope<TType extends string, TPayload> = {
  eventId: string          // UUID v4
  eventType: TType
  occurredAt: string       // ISO 8601
  actorId: string | null   // profiles.id or 'system'
  aggregateId: string      // lead id, appointment id, user id, etc.
  source: 'server_action' | 'auth_webhook' | 'auth_callback' | 'db_trigger'
  payload: TPayload
}
```

### 3.2 Business events

| Event | Trigger | Aggregate |
|---|---|---|
| `business.booking.created` | `src/app/schedule/actions.ts` after booking | `lead_id` |
| `business.lead.created` | Contact/inquiry form (future) | `lead_id` |
| `business.lead.status_changed` | `src/app/admin/leads/actions.ts` | `lead_id` |
| `business.appointment.confirmed` | `src/app/admin/scheduler/actions.ts` | `appointment_id` |
| `business.appointment.rescheduled` | Scheduler (future) | `appointment_id` |
| `business.appointment.cancelled` | `src/app/admin/scheduler/actions.ts` | `appointment_id` |
| `business.referral.lead_attributed` | Referral system (deferred) | `lead_id` |

### 3.3 Content events

| Event | Trigger | Aggregate |
|---|---|---|
| `content.case_study.published` | Case study publish action | `case_study_id` |
| `content.blog_post.published` | Blog publish action | `blog_post_id` |

### 3.4 Auth events (full coverage)

#### Session & access

| Event | Trigger | Aggregate | Notes |
|---|---|---|---|
| `auth.login.succeeded` | `src/app/login/actions.ts` after role check passes | `user_id` | Optional super_admin security alert |
| `auth.login.failed` | `signInWithPassword` error | `email_hash` | Audit only; no admin email by default |
| `auth.login.unauthorized` | Valid auth, no admin role → signOut | `user_id` | In-app to super_admins; security-sensitive |
| `auth.logout` | `src/app/admin/actions.ts`, `signOutFromLogin` | `user_id` | Audit only |
| `auth.session.required` | Middleware redirect to `/login` | `session` | Audit only (no notification spam) |
| `auth.callback.succeeded` | `src/app/auth/callback/route.ts` code exchange OK | `user_id` | Drives invite-acceptance detection |
| `auth.callback.failed` | Callback exchange error | `session` | Audit + optional user-facing email |

#### Staff lifecycle

| Event | Trigger | Aggregate | Notes |
|---|---|---|---|
| `auth.staff.invited` | Settings staff invite action | `invited_user_id` | Transactional email to invitee via our provider |
| `auth.staff.invite_accepted` | Callback after first login from invite | `user_id` | In-app to all admins; welcome email to user |
| `auth.staff.role_changed` | Settings staff management | `user_id` | In-app + email to affected user |
| `auth.staff.deactivated` | Soft-delete profile + revoke sessions | `user_id` | In-app to super_admins; email to affected user |

#### Password lifecycle

| Event | Trigger | Aggregate | Notes |
|---|---|---|---|
| `auth.password.changed` | Settings security form | `user_id` | Confirmation email to user; in-app security note |
| `auth.password.reset_requested` | Forgot-password flow (future) | `user_id` | Transactional email with reset link |
| `auth.password.reset_completed` | Reset callback / form submit | `user_id` | Confirmation email to user |

#### Auth orchestration (no Supabase Auth Hooks)

**Decision:** Do not use Supabase Auth Hooks or auth webhook ingest. They are excluded from v1 due to reliability issues.

All auth lifecycle events are emitted explicitly from trusted server paths using `createAdminClient()` (service role) and `notify()`:

| Concern | Approach |
|---|---|
| Staff invite | `auth.admin.generateLink({ type: 'invite' })` + our `EmailProvider` (not `inviteUserByEmail`) |
| Invite acceptance | `auth/callback` detects first profile creation → `auth.staff.invite_accepted` |
| Role change / deactivation | Super-admin staff settings actions emit events after admin API updates |
| Login / logout / unauthorized | `login/actions.ts` emits events directly |
| Password changed | Settings security action emits after successful update |
| Password reset (future) | `generateLink({ type: 'recovery' })` + our email (no send-email hook) |

Supabase Auth remains identity source. Our app owns event emission, templates, and delivery.

---

## 4. Channel & Recipient Model

### 4.1 Channels

| Channel | Interface | Purpose |
|---|---|---|
| `in_app` | `InAppNotificationChannel` | Bell feed, drawer, history page |
| `email` | `EmailNotificationChannel` | Transactional + alert emails via `EmailProvider` |

Future (not v1): `sms`, `push` — same orchestrator contract, new channel adapters.

### 4.2 Recipient rules

```typescript
type RecipientRule =
  | 'all_admins'           // admin + super_admin profiles
  | 'super_admins_only'    // security-sensitive auth events
  | 'actor'                // user who performed the action
  | 'subject'              // user affected by the event (invitee, deactivated user)
  | 'business_contact'     // business_settings.email
```

### 4.3 Event → channel → recipient matrix

| Event | In-app recipients | Email recipients | Default email |
|---|---|---|---|
| `business.booking.created` | all_admins | all_admins (pref) | on |
| `business.lead.created` | all_admins | all_admins (pref) | on |
| `business.lead.status_changed` | all_admins | off | off |
| `business.appointment.confirmed` | all_admins | all_admins (pref) | on |
| `business.appointment.cancelled` | all_admins | all_admins (pref) | on |
| `content.case_study.published` | all_admins | off | off |
| `content.blog_post.published` | all_admins | off | off |
| `auth.login.succeeded` | off | super_admins (pref) | off |
| `auth.login.failed` | off | off | off |
| `auth.login.unauthorized` | super_admins_only | super_admins_only | on |
| `auth.logout` | off | off | off |
| `auth.callback.failed` | off | subject (if known) | on |
| `auth.staff.invited` | all_admins | subject | on (required) |
| `auth.staff.invite_accepted` | all_admins | subject | on |
| `auth.staff.role_changed` | all_admins + subject | subject | on |
| `auth.staff.deactivated` | super_admins_only | subject | on |
| `auth.password.changed` | subject | subject | on (required) |
| `auth.password.reset_requested` | off | subject | on (required) |
| `auth.password.reset_completed` | subject | subject | on |

Preferences (stored in `profiles.metadata.notification_preferences`) can override defaults per event type and channel.

---

## 5. Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Triggers: server actions, auth callback (no auth hooks)    │
└──────────────────────────┬──────────────────────────────────┘
                           │ emit DomainEvent
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  NotificationOrchestrator                                   │
│  validate → resolve recipients → render templates → dispatch│
└──────┬──────────────────────────────┬───────────────────────┘
       │                              │
       ▼                              ▼
┌──────────────┐              ┌──────────────────┐
│ InAppChannel │              │ EmailChannel     │
└──────┬───────┘              └────────┬─────────┘
       │                               │
       ▼                               ▼
 admin_notifications          EmailProvider (interface)
                              ├── ResendEmailProvider
                              ├── NoopEmailProvider
                              └── (future adapters)
```

### 5.1 Module layout

```
src/lib/notifications/
  events/
    envelope.ts          # shared envelope types
    business.ts          # business event payloads
    auth.ts              # auth event payloads
    content.ts           # content event payloads
    index.ts             # DomainEvent union + type guards
  orchestrator.ts        # single entry: notify(event)
  recipient-resolver.ts  # RecipientRule → profile ids / emails
  preferences.ts         # read/write per-admin toggles
  idempotency.ts         # key generation + dedup
  templates/
    registry.ts          # eventType → template renderer
    render.ts            # builds InAppPayload | EmailMessage
    business/
    auth/
    content/
  channels/
    types.ts             # ChannelResult, NotificationChannel interface
    in-app.ts
    email.ts
  providers/
    email/
      types.ts           # EmailProvider, EmailMessage, ProviderSendResult
      factory.ts         # env-driven: RESEND | noop
      resend.ts
      noop.ts
```

Auth hook ingest is intentionally omitted.

### 5.2 Public API (only surface feature code uses)

```typescript
// src/lib/notifications/index.ts
export async function notify(event: DomainEvent): Promise<NotifyResult>
```

Server actions and auth routes call `notify()` — never channels or providers directly.

### 5.3 Delivery execution model

- **Queue-first async:** `notify()` persists `notification_events` + recipient fanout rows, then enqueues delivery work.
- **Request path:** may write in-app rows in the same transaction; must not call external email providers inline.
- **Worker path:** resolves queued email deliveries, applies retry/backoff, and updates delivery audit rows.
- **Idempotent processing:** workers claim by `idempotency_key` + status transition (`queued` -> `processing` -> terminal status).

### 5.4 Email provider contract

```typescript
type EmailMessage = {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
  tags?: { name: string; value: string }[]  // provider metadata, not PII
}

type ProviderSendResult =
  | { ok: true; messageId: string }
  | { ok: false; errorCode: string; errorMessage: string; retryable: boolean }

interface EmailProvider {
  readonly name: string  // 'resend' | 'noop' | ...
  send(message: EmailMessage): Promise<ProviderSendResult>
}
```

Factory (`providers/email/factory.ts`):

```typescript
// EMAIL_PROVIDER=resend|noop  (default: noop in dev if no API key)
```

### 5.5 Auth email strategy (modular, not Supabase-locked)

| Email type | Sender | Rationale |
|---|---|---|
| Staff invite | Our `EmailProvider` | `generateLink({ type: 'invite' })` in staff action; never `inviteUserByEmail` |
| Password reset | Our `EmailProvider` | `generateLink({ type: 'recovery' })` + Resend; no send-email hook |
| Password changed confirmation | Our `EmailProvider` | Security confirmation via `notify()` |
| Supabase Auth Hooks | **Not used** | Avoid hook bugs; explicit admin-orchestrated emits only |
| Supabase default auth emails | **Disabled** in dashboard | Avoid dual systems; one provider path |

Supabase Auth remains the **identity source**. Our system owns **delivery and templates**.

---

## 6. Persistence

### 6.1 Tables

```sql
-- Immutable event log (append-only)
CREATE TABLE public.notification_events (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_id        UUID NOT NULL UNIQUE,
  event_type      TEXT NOT NULL,
  aggregate_id    TEXT NOT NULL,
  actor_id        UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  source          TEXT NOT NULL,
  source_event_key TEXT, -- callback code / action request id for replay dedupe
  payload         JSONB NOT NULL DEFAULT '{}',
  occurred_at     TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (source, source_event_key)
);

-- In-app feed (denormalized for fast UI reads)
CREATE TABLE public.admin_notifications (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_id        UUID NOT NULL REFERENCES public.notification_events(event_id),
  recipient_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,
  title           TEXT NOT NULL,
  body            TEXT,
  href            TEXT,
  metadata        JSONB NOT NULL DEFAULT '{}',
  is_read         BOOLEAN NOT NULL DEFAULT FALSE,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, recipient_profile_id, type)
);

-- Per-channel delivery audit
CREATE TABLE public.notification_deliveries (
  id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_id            UUID NOT NULL REFERENCES public.notification_events(event_id),
  channel             TEXT NOT NULL CHECK (channel IN ('in_app', 'email')),
  recipient_key       TEXT NOT NULL,  -- profile id or email
  idempotency_key     TEXT NOT NULL UNIQUE, -- {eventId}:{channel}:{recipientKey}
  status              TEXT NOT NULL CHECK (status IN ('queued', 'processing', 'sent', 'failed', 'skipped')),
  provider            TEXT,
  provider_message_id TEXT,
  attempt_count       INT NOT NULL DEFAULT 0,
  max_attempts        INT NOT NULL DEFAULT 5,
  retryable           BOOLEAN NOT NULL DEFAULT TRUE,
  next_retry_at       TIMESTAMPTZ,
  last_attempt_at     TIMESTAMPTZ,
  last_error          TEXT,
  sent_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, channel, recipient_key)
);
```

Preferences live in `profiles.metadata`:

```json
{
  "notification_preferences": {
    "business.booking.created": { "in_app": true, "email": true },
    "auth.login.unauthorized": { "in_app": true, "email": true }
  }
}
```

### 6.2 RLS

- `notification_events`: admin/super_admin SELECT; INSERT only via backend service role. If a DB function is required, place it in non-exposed schema, restrict EXECUTE, and keep API-facing reads under normal RLS.
- `admin_notifications`: admin/super_admin SELECT where `recipient_profile_id = auth.uid()`; UPDATE only own rows for read-state fields (`is_read`, `read_at`).
- `notification_deliveries`: super_admin SELECT only; INSERT/UPDATE by backend service role/worker only.

### 6.3 Idempotency key

```
{eventId}:{channel}:{recipientKey}
```

`notification_events` dedupes source replays by `(source, source_event_key)`. `notification_deliveries.idempotency_key` dedupes channel sends for each emitted event.

---

## 7. Auth-Specific Security Rules

1. **Never store or transmit** passwords, session tokens, magic links, or reset tokens in `notification_events`, `admin_notifications`, or logs.
2. **`auth.login.failed`** — always write to `audit_logs`; also write a **sanitized** `notification_events` record for centralized observability. No in-app/email delivery by default (noise). Optional future: rate-limited super_admin alert after N failures per IP/email in 15 minutes.
3. **`auth.login.unauthorized`** — always notify super_admins (potential privilege probe).
4. **Invite links** — single-use, time-limited; generated server-side only; embedded in email HTML, never in in-app notifications.
5. **Role assignment** — store role in `app_metadata` (not `user_metadata`) for RLS safety; invite flow sets `app_metadata.role`.
6. **Deactivation** — revoke all sessions via `auth.admin.signOut(userId, 'global')` before emitting `auth.staff.deactivated`.
7. **No auth hooks** — do not configure Supabase Auth Hooks; all auth events must originate from server actions or auth callback.
8. **Email content** — mask email in admin alerts where possible (`o***@gmail.com`); full address only in emails to the subject user.

---

## 8. UI Surfaces

| Surface | Path / component | Notes |
|---|---|---|
| Bell + badge | `src/components/admin/notification-bell.tsx` | Unread count; Supabase Realtime or 30s poll |
| Drawer | Same component, slide-in panel | Click → `href` navigation |
| History | `src/app/admin/notifications/page.tsx` | Paginated, filter by type |
| Preferences | `src/app/admin/settings` → Notifications tab | Per-event channel toggles |
| Delivery health | `src/app/admin/settings` → super_admin only (phase 2) | Failed deliveries, retry |

---

## 9. Environment Variables

```bash
# Email provider (factory selection)
EMAIL_PROVIDER=resend          # resend | noop
RESEND_API_KEY=re_...
# DNS verification in progress: keep EMAIL_FROM on the verified/sandbox sender
# until the domain is fully verified in Resend.
EMAIL_FROM=notifications@vanrox-group.com
EMAIL_REPLY_TO=info@vanrox-group.com

# Worker execution (queue processing)
NOTIFICATION_WORKER_SECRET=...
NOTIFICATION_WORKER_BATCH_SIZE=25

# App URL (for links in emails)
NEXT_PUBLIC_APP_URL=https://...
```

---

## 10. Trigger Wiring Map

| File | Events emitted |
|---|---|
| `src/app/schedule/actions.ts` | `business.booking.created` |
| `src/app/admin/leads/actions.ts` | `business.lead.status_changed` |
| `src/app/admin/scheduler/actions.ts` | `business.appointment.confirmed`, `business.appointment.cancelled` |
| `src/app/admin/services/content-actions.ts` | `content.case_study.published` |
| `src/app/admin/blog/actions.ts` | `content.blog_post.published` |
| `src/app/login/actions.ts` | `auth.login.succeeded`, `auth.login.failed`, `auth.login.unauthorized` |
| `src/app/admin/actions.ts` | `auth.logout` |
| `src/app/login/actions.ts` (signOutFromLogin) | `auth.logout` |
| `src/app/auth/callback/route.ts` | `auth.callback.succeeded`, `auth.callback.failed`, `auth.staff.invite_accepted` |
| `src/app/admin/settings/staff/actions.ts` | `auth.staff.invited` (in-app), invite email inline; `auth.staff.role_changed`, `auth.staff.deactivated` |
| `src/app/admin/settings/security/actions.ts` | `auth.password.changed`, `auth.password.reset_requested` (future) |
| `src/lib/auth/staff-invite-email.ts` | Staff invite transactional email via `EmailProvider` |
| `src/app/api/notifications/worker/route.ts` | Processes queued email deliveries |

---

## 11. Implementation Phases

### Phase 1 — Foundation
- [x] DB migration: `notification_events`, `admin_notifications`, `notification_deliveries`
- [x] Event types + envelope + `notify()` orchestrator skeleton
- [x] `NoopEmailProvider` + factory
- [x] In-app channel + template registry
- [x] Queue table/worker scaffold for async email delivery
- [x] Unit tests: idempotency, recipient resolver, template rendering

### Phase 2 — Business notifications
- [x] Wire `business.booking.created` from schedule action
- [x] Bell component + drawer in admin layout
- [x] `ResendEmailProvider` adapter
- [x] Wire email for booking + unauthorized login
- [x] Notifications history page (`/admin/notifications`)

### Phase 3 — Auth notifications
- [x] Staff invite action + `auth.staff.invited` (generateLink + our email, no hooks)
- [x] Auth callback: profile upsert + `auth.staff.invite_accepted`
- [x] Login events from `login/actions.ts`
- [x] Password changed flow in settings security tab
- [x] Super_admin alerts for `auth.login.unauthorized` (via login action emit)
- [x] Staff invite UX: welcome page, resend invite, pending status (see `2026-06-08-staff-invite-flow.md`)

### Phase 4 — Preferences & polish
- [ ] Notification preferences UI in settings
- [ ] Remaining business/content events
- [ ] Notifications history page
- [ ] Delivery failure visibility for super_admin

### Phase 5 — Hardening
- [x] Auth hook path removed (admin-orchestrated emits only)
- [ ] Rate-limited failed-login alerting
- [x] Retry worker for `status = 'queued' | 'failed'` where `retryable = true` and `next_retry_at <= now()`
- [ ] Regenerate `database.types.ts`

---

## 12. Test Strategy

| Layer | What to test |
|---|---|
| Event payloads | ParseResult validation per event type; reject malformed payloads |
| Orchestrator | Recipient resolution, preference filtering, skip vs send decisions |
| Idempotency | Duplicate source event replay (`source + source_event_key`) → one event row |
| In-app channel | Creates per-recipient `admin_notifications` rows with correct `href` and unread state |
| Email channel | Delegates to provider; records `provider_message_id` |
| Queue worker | Claims queued deliveries safely, updates `attempt_count`, backoff, terminal status |
| Resend adapter | Maps `EmailMessage` → Resend API; maps errors → `retryable` flag |
| Noop adapter | Returns success without network |
| Auth integration | Login unauthorized → super_admin in-app notification created |
| Admin auth orchestration | Staff invite uses `generateLink` + inline email; no duplicate Supabase invite email |
| Security | Assert no token/password fields in persisted payload snapshots |

---

## 13. Definition of Done

- [ ] All business, content, and auth events in §3 flow through `notify()`
- [ ] Zero direct `resend` / vendor imports outside `providers/email/`
- [ ] Auth transactional emails (invite, reset, password changed) use `EmailProvider`
- [ ] Every delivery attempt recorded in `notification_deliveries`
- [ ] Idempotent under retry and double-submit
- [ ] RLS enforced; auth events emitted only from trusted server paths
- [ ] Tests pass for orchestrator, adapters, and first auth + business event
- [ ] No provider lock-in: switching `EMAIL_PROVIDER` env changes behavior with no code changes
