-- CSC NIL Go webhooks are at-least-once and not strictly ordered.
-- Last-write-wins on clearinghouse_status let a delayed CLEARED retry
-- overwrite a newer NOT_CLEARED and unlock RallySafe payout.
--
-- 1. Persist the CSC event timestamp on the ledger row.
-- 2. Apply status + audit insert in one RPC so a 500 cannot retry a stale body
--    after a newer event already committed.

ALTER TABLE public.nil_transactions
  ADD COLUMN IF NOT EXISTS csc_event_at TIMESTAMPTZ;

COMMENT ON COLUMN public.nil_transactions.csc_event_at IS
  'CSC webhook payload timestamp of the last applied clearinghouse event. Stale events (event_at < csc_event_at) are ignored.';

CREATE OR REPLACE FUNCTION public.apply_csc_nil_go_sync(
  p_transaction_id uuid,
  p_clearinghouse_status public.clearinghouse_status_enum,
  p_vbp_notes text,
  p_event_at timestamptz
) RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  rec public.nil_transactions%ROWTYPE;
  audit_status public.compliance_clearance_status;
BEGIN
  SELECT *
  INTO rec
  FROM public.nil_transactions
  WHERE id = p_transaction_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'code', 'NOT_FOUND');
  END IF;

  IF rec.csc_event_at IS NOT NULL AND p_event_at < rec.csc_event_at THEN
    RETURN jsonb_build_object(
      'ok', true,
      'applied', false,
      'stale', true,
      'id', rec.id,
      'athlete_id', rec.athlete_id,
      'clearinghouse_status', rec.clearinghouse_status
    );
  END IF;

  IF rec.csc_event_at IS NOT NULL
     AND p_event_at = rec.csc_event_at
     AND rec.clearinghouse_status = p_clearinghouse_status THEN
    RETURN jsonb_build_object(
      'ok', true,
      'applied', false,
      'stale', false,
      'idempotent', true,
      'id', rec.id,
      'athlete_id', rec.athlete_id,
      'clearinghouse_status', rec.clearinghouse_status
    );
  END IF;

  UPDATE public.nil_transactions
  SET
    clearinghouse_status = p_clearinghouse_status,
    vbp_notes = CASE
      WHEN p_vbp_notes IS NULL OR btrim(p_vbp_notes) = '' THEN vbp_notes
      ELSE p_vbp_notes
    END,
    csc_event_at = p_event_at
  WHERE id = p_transaction_id
  RETURNING * INTO rec;

  audit_status := CASE p_clearinghouse_status
    WHEN 'CLEARED' THEN 'CLEARED'::public.compliance_clearance_status
    WHEN 'FLAGGED_FOR_REVIEW' THEN 'NIL_FLAGGED'::public.compliance_clearance_status
    WHEN 'NOT_CLEARED' THEN 'NIL_NOT_CLEARED'::public.compliance_clearance_status
    ELSE 'NIL_PENDING'::public.compliance_clearance_status
  END;

  INSERT INTO public.compliance_audit_logs (
    school_id,
    coach_id,
    athlete_id,
    action_type,
    clearance_status,
    notes,
    flagged_keywords
  ) VALUES (
    'SYSTEM_CSC',
    'SYSTEM_WEBHOOK',
    rec.athlete_id::text,
    'NIL_CLEARANCE_SYNC',
    audit_status,
    format(
      'CSC NIL Go webhook sync (%s): %s',
      p_clearinghouse_status,
      COALESCE(p_vbp_notes, '')
    ),
    '{}'::text[]
  );

  RETURN jsonb_build_object(
    'ok', true,
    'applied', true,
    'stale', false,
    'id', rec.id,
    'athlete_id', rec.athlete_id,
    'clearinghouse_status', rec.clearinghouse_status
  );
EXCEPTION
  WHEN check_violation THEN
    RETURN jsonb_build_object(
      'ok', false,
      'code', 'CHECK_ENFORCE_CLEARED_PAYOUT',
      'transaction_id', p_transaction_id
    );
END;
$$;

COMMENT ON FUNCTION public.apply_csc_nil_go_sync(uuid, public.clearinghouse_status_enum, text, timestamptz) IS
  'HMAC Edge Function (service_role) only. Monotonic CSC NIL Go status apply + audit insert in one transaction.';

REVOKE ALL ON FUNCTION public.apply_csc_nil_go_sync(uuid, public.clearinghouse_status_enum, text, timestamptz) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.apply_csc_nil_go_sync(uuid, public.clearinghouse_status_enum, text, timestamptz) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_csc_nil_go_sync(uuid, public.clearinghouse_status_enum, text, timestamptz) TO service_role;
