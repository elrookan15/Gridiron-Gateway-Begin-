-- Immutable NCAA/COPPA gate ledger. Client INSERT is denied; service_role
-- (Express / Edge) is the only writer. UPDATE/DELETE are forbidden even for
-- service_role via trigger so the institution has a timestamped proof of every
-- evaluateMessagingClearance dispatch.

DO $$ BEGIN
  CREATE TYPE public.compliance_clearance_status AS ENUM (
    'CLEARED',
    'BLOCKED_CALENDAR',
    'BLOCKED_MINOR_CONSENT',
    'BLOCKED_INDUCEMENT',
    'BLOCKED_AUDIT_LEDGER'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.compliance_gate_action_type AS ENUM (
    'DIRECT_MESSAGE',
    'OFFER_EXTENSION',
    'CAMP_INVITE'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.compliance_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id TEXT NOT NULL,
  coach_id TEXT NOT NULL,
  athlete_id TEXT NOT NULL,
  action_type public.compliance_gate_action_type NOT NULL,
  clearance_status public.compliance_clearance_status NOT NULL,
  notes TEXT NOT NULL,
  flagged_keywords TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS compliance_audit_logs_coach_idx
  ON public.compliance_audit_logs (coach_id, created_at DESC);

CREATE INDEX IF NOT EXISTS compliance_audit_logs_athlete_idx
  ON public.compliance_audit_logs (athlete_id, created_at DESC);

COMMENT ON TABLE public.compliance_audit_logs IS
  'Append-only NCAA/COPPA/NIL-adjacent messaging gate ledger. Fail-closed: no clearance without a row.';

ALTER TABLE public.compliance_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.fn_forbid_compliance_audit_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'compliance_audit_logs is append-only';
END;
$$;

DROP TRIGGER IF EXISTS trg_compliance_audit_no_update ON public.compliance_audit_logs;
CREATE TRIGGER trg_compliance_audit_no_update
  BEFORE UPDATE ON public.compliance_audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_forbid_compliance_audit_mutation();

DROP TRIGGER IF EXISTS trg_compliance_audit_no_delete ON public.compliance_audit_logs;
CREATE TRIGGER trg_compliance_audit_no_delete
  BEFORE DELETE ON public.compliance_audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_forbid_compliance_audit_mutation();

DROP POLICY IF EXISTS "lock_client_insert_compliance_audit_logs" ON public.compliance_audit_logs;
CREATE POLICY "lock_client_insert_compliance_audit_logs"
  ON public.compliance_audit_logs
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (false);

DROP POLICY IF EXISTS "lock_client_update_compliance_audit_logs" ON public.compliance_audit_logs;
CREATE POLICY "lock_client_update_compliance_audit_logs"
  ON public.compliance_audit_logs
  FOR UPDATE
  TO authenticated, anon
  USING (false);

DROP POLICY IF EXISTS "lock_client_delete_compliance_audit_logs" ON public.compliance_audit_logs;
CREATE POLICY "lock_client_delete_compliance_audit_logs"
  ON public.compliance_audit_logs
  FOR DELETE
  TO authenticated, anon
  USING (false);

DROP POLICY IF EXISTS "select_own_or_compliance_audit_logs" ON public.compliance_audit_logs;
CREATE POLICY "select_own_or_compliance_audit_logs"
  ON public.compliance_audit_logs
  FOR SELECT
  TO authenticated
  USING (
    coach_id = auth.uid()::text
    OR athlete_id = auth.uid()::text
    OR EXISTS (
      SELECT 1
      FROM public.school_staff_roles
      WHERE school_staff_roles.user_id = auth.uid()
        AND school_staff_roles.role_tier = 'COMPLIANCE_OFFICER'
    )
  );
