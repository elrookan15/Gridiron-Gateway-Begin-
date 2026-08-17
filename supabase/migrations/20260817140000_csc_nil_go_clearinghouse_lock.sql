-- CSC NIL Go ingress lock:
-- 1. clearinghouse_status may only change under service_role (Edge Function).
-- 2. compliance_audit_logs accepts NIL_CLEARANCE_SYNC rows from that webhook.

DO $$ BEGIN
  ALTER TYPE public.compliance_gate_action_type ADD VALUE 'NIL_CLEARANCE_SYNC';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE public.compliance_clearance_status ADD VALUE 'NIL_PENDING';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE public.compliance_clearance_status ADD VALUE 'NIL_FLAGGED';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE public.compliance_clearance_status ADD VALUE 'NIL_NOT_CLEARED';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION public.fn_lock_nil_clearinghouse_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.clearinghouse_status IS DISTINCT FROM 'PENDING' THEN
    IF auth.role() IS DISTINCT FROM 'service_role' THEN
      RAISE EXCEPTION 'clearinghouse_status may only be set by CSC NIL Go service_role ingress'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.clearinghouse_status IS DISTINCT FROM OLD.clearinghouse_status THEN
    IF auth.role() IS DISTINCT FROM 'service_role' THEN
      RAISE EXCEPTION 'clearinghouse_status is CSC NIL Go webhook ingress only'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_lock_nil_clearinghouse_status ON public.nil_transactions;
CREATE TRIGGER trg_lock_nil_clearinghouse_status
  BEFORE INSERT OR UPDATE ON public.nil_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_lock_nil_clearinghouse_status();

COMMENT ON FUNCTION public.fn_lock_nil_clearinghouse_status() IS
  'Fail-closed: SPA/JWT sessions cannot flip clearinghouse_status. CSC HMAC Edge Function (service_role) is the only writer.';
