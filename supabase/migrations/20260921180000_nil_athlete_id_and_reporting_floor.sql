-- Repair databases that already applied the UUID athlete_profiles(id) FK.
-- Production PK is athlete_profiles.athlete_id. NIL Go deals below $600
-- (60_000 cents) cannot be stored.

DO $$
BEGIN
  IF to_regclass('public.nil_transactions') IS NULL THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'nil_transactions'
      AND column_name = 'athlete_id'
      AND udt_name = 'uuid'
  ) THEN
    ALTER TABLE public.nil_transactions DROP CONSTRAINT IF EXISTS nil_transactions_athlete_id_fkey;
    ALTER TABLE public.nil_transactions
      ALTER COLUMN athlete_id TYPE TEXT USING athlete_id::text;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.nil_transactions WHERE deal_amount_cents < 60000
  ) THEN
    RAISE EXCEPTION 'nil_transactions has rows below the $600 NIL Go reporting floor';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'nil_go_reporting_floor'
  ) THEN
    ALTER TABLE public.nil_transactions
      ADD CONSTRAINT nil_go_reporting_floor CHECK (deal_amount_cents >= 60000);
  END IF;

  IF to_regclass('public.athlete_profiles') IS NOT NULL
     AND EXISTS (
       SELECT 1
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'athlete_profiles'
         AND column_name = 'athlete_id'
     )
     AND NOT EXISTS (
       SELECT 1 FROM pg_constraint WHERE conname = 'nil_transactions_athlete_id_fkey'
     ) THEN
    ALTER TABLE public.nil_transactions
      ADD CONSTRAINT nil_transactions_athlete_id_fkey
      FOREIGN KEY (athlete_id) REFERENCES public.athlete_profiles(athlete_id) ON DELETE CASCADE;
  END IF;
END $$;

DROP POLICY IF EXISTS "Athletes can view own nil transactions" ON public.nil_transactions;
CREATE POLICY "Athletes can view own nil transactions"
  ON public.nil_transactions
  FOR SELECT
  USING (athlete_id = auth.uid()::text);
