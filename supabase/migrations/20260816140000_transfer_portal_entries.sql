-- NCAA transfer portal ticker (hour-scale roster volatility).
-- Snapshot origin/destination names + colors at entry; do not invent coach contacts.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'portal_status') THEN
    CREATE TYPE public.portal_status AS ENUM ('ACTIVE', 'WITHDRAWN', 'MATRICULATED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transfer_type') THEN
    CREATE TYPE public.transfer_type AS ENUM ('UNDERGRADUATE', 'GRADUATE');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.transfer_portal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id TEXT NOT NULL,
  athlete_name TEXT NOT NULL,
  position TEXT NOT NULL,
  star_rating INTEGER NOT NULL DEFAULT 0 CHECK (star_rating >= 0 AND star_rating <= 5),
  transfer_type public.transfer_type NOT NULL,
  eligibility_remaining INTEGER NOT NULL CHECK (eligibility_remaining >= 0 AND eligibility_remaining <= 5),
  origin_school_id TEXT NOT NULL,
  origin_school_name TEXT NOT NULL,
  origin_primary_color TEXT NOT NULL DEFAULT '#334155',
  destination_school_id TEXT,
  destination_school_name TEXT,
  destination_primary_color TEXT,
  entry_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status public.portal_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT transfer_portal_destination_complete CHECK (
    (destination_school_id IS NULL AND destination_school_name IS NULL AND destination_primary_color IS NULL)
    OR (destination_school_id IS NOT NULL AND destination_school_name IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS transfer_portal_entries_status_entry_idx
  ON public.transfer_portal_entries (status, entry_date DESC);

ALTER TABLE public.transfer_portal_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_transfer_portal_entries" ON public.transfer_portal_entries;
CREATE POLICY "public_read_transfer_portal_entries"
  ON public.transfer_portal_entries
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "lock_client_insert_transfer_portal" ON public.transfer_portal_entries;
CREATE POLICY "lock_client_insert_transfer_portal"
  ON public.transfer_portal_entries
  FOR INSERT
  WITH CHECK (false);

DROP POLICY IF EXISTS "lock_client_update_transfer_portal" ON public.transfer_portal_entries;
CREATE POLICY "lock_client_update_transfer_portal"
  ON public.transfer_portal_entries
  FOR UPDATE
  USING (false);

DROP POLICY IF EXISTS "lock_client_delete_transfer_portal" ON public.transfer_portal_entries;
CREATE POLICY "lock_client_delete_transfer_portal"
  ON public.transfer_portal_entries
  FOR DELETE
  USING (false);

COMMENT ON TABLE public.transfer_portal_entries IS
  'Live NCAA transfer portal tape. Writes are service_role / ingest only.';
