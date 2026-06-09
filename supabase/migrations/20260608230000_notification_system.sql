-- Notification system: event log, in-app fanout, delivery queue/audit

-- ── Helpers ───────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid())
      AND role = 'super_admin'
      AND deleted_at IS NULL
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- ── Tables ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.notification_events (
  id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_id         UUID NOT NULL UNIQUE,
  event_type       TEXT NOT NULL,
  aggregate_id     TEXT NOT NULL,
  actor_id         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  source           TEXT NOT NULL CHECK (source IN ('server_action', 'auth_webhook', 'auth_callback', 'db_trigger')),
  source_event_key TEXT,
  payload          JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at      TIMESTAMPTZ NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (source, source_event_key)
);

CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id                   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_id             UUID NOT NULL REFERENCES public.notification_events(event_id) ON DELETE CASCADE,
  recipient_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type                 TEXT NOT NULL,
  title                TEXT NOT NULL,
  body                 TEXT,
  href                 TEXT,
  metadata             JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_read              BOOLEAN NOT NULL DEFAULT FALSE,
  read_at              TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, recipient_profile_id, type)
);

CREATE TABLE IF NOT EXISTS public.notification_deliveries (
  id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  event_id            UUID NOT NULL REFERENCES public.notification_events(event_id) ON DELETE CASCADE,
  channel             TEXT NOT NULL CHECK (channel IN ('in_app', 'email')),
  recipient_key       TEXT NOT NULL,
  idempotency_key     TEXT NOT NULL UNIQUE,
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

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_notification_events_type_occurred
  ON public.notification_events (event_type, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_recipient_unread
  ON public.admin_notifications (recipient_profile_id, is_read, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notification_deliveries_worker
  ON public.notification_deliveries (status, next_retry_at)
  WHERE status IN ('queued', 'failed') AND retryable = TRUE;

-- ── RLS ───────────────────────────────────────────────────────────────────────

ALTER TABLE public.notification_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_deliveries ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.notification_events TO authenticated;
GRANT SELECT, UPDATE ON public.admin_notifications TO authenticated;
GRANT SELECT ON public.notification_deliveries TO authenticated;

CREATE POLICY "notification_events_admin_select"
  ON public.notification_events
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin()));

CREATE POLICY "admin_notifications_select_own"
  ON public.admin_notifications
  FOR SELECT
  TO authenticated
  USING (
    recipient_profile_id = (SELECT auth.uid())
    AND (SELECT public.is_admin())
  );

CREATE POLICY "admin_notifications_update_own_read_state"
  ON public.admin_notifications
  FOR UPDATE
  TO authenticated
  USING (
    recipient_profile_id = (SELECT auth.uid())
    AND (SELECT public.is_admin())
  )
  WITH CHECK (
    recipient_profile_id = (SELECT auth.uid())
    AND (SELECT public.is_admin())
  );

CREATE POLICY "notification_deliveries_super_admin_select"
  ON public.notification_deliveries
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_super_admin()));
