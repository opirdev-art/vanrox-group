-- audit_logs.record_id was UUID-only, but services.id is BIGINT.
-- Store polymorphic primary keys as text so all audited tables work.

ALTER TABLE public.audit_logs
  ALTER COLUMN record_id TYPE TEXT USING record_id::text;

CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_data, new_data)
  VALUES (
    (SELECT auth.uid()),
    TG_OP,
    TG_TABLE_NAME,
    (COALESCE(NEW.id, OLD.id))::text,
    CASE WHEN TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END
  );
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
