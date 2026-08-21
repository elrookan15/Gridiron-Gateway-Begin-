-- Fail-closed NCAA transfer-portal lock on RallySafe payouts.
-- enforce_cleared_payout only requires CLEARED; the SPA release path
-- (releaseNilEscrowPayout) could mark payout_released while the athlete
-- had an ACTIVE transfer_portal_entries row. Compliance officers have
-- UPDATE via RLS, so the lock must live in Postgres.

CREATE OR REPLACE FUNCTION public.fn_block_portal_nil_payout()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.payout_released IS TRUE AND OLD.payout_released IS DISTINCT FROM TRUE THEN
    IF EXISTS (
      SELECT 1
      FROM public.transfer_portal_entries t
      WHERE t.status = 'ACTIVE'
        AND t.athlete_id = NEW.athlete_id::text
    ) THEN
      RAISE EXCEPTION 'TRANSFER_PORTAL_LOCK: cannot release NIL escrow while athlete is in the transfer portal'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_block_portal_nil_payout ON public.nil_transactions;
CREATE TRIGGER trg_block_portal_nil_payout
  BEFORE UPDATE ON public.nil_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_block_portal_nil_payout();

COMMENT ON FUNCTION public.fn_block_portal_nil_payout() IS
  'Fail-closed: payout_released cannot flip true while transfer_portal_entries.status = ACTIVE for the same athlete_id.';
