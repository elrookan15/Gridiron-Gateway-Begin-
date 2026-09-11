-- Dossier cleanup: point scholarship_offers at production schools; drop MVP UUID archive.
-- Safe when scholarship_offers is empty (no UUID school_id rows to remap).
-- Applied remotely as dossier_offers_production_schools on ujdgjaaioyfbvylzexts.

-- 1) Detach offers from schools_mvp_archive
DO $$
DECLARE
  fk_name text;
BEGIN
  IF to_regclass('public.scholarship_offers') IS NULL THEN
    RETURN;
  END IF;

  -- Archive absent (greenfield / already-production cutover skip): nothing to detach.
  IF to_regclass('public.schools_mvp_archive') IS NULL THEN
    RETURN;
  END IF;

  FOR fk_name IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE nsp.nspname = 'public'
      AND rel.relname = 'scholarship_offers'
      AND con.contype = 'f'
      AND con.confrelid = 'public.schools_mvp_archive'::regclass
  LOOP
    EXECUTE format('ALTER TABLE public.scholarship_offers DROP CONSTRAINT IF EXISTS %I', fk_name);
  END LOOP;
END $$;

-- 2) school_id: UUID → VARCHAR(100) production ingest ids (cfbd-*)
DO $$
BEGIN
  IF to_regclass('public.scholarship_offers') IS NULL THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'scholarship_offers'
      AND column_name = 'school_id'
      AND data_type = 'uuid'
  ) THEN
    -- Empty table expected; refuse if leftover UUID FKs would orphan.
    IF EXISTS (SELECT 1 FROM public.scholarship_offers LIMIT 1) THEN
      RAISE EXCEPTION
        'scholarship_offers has rows with UUID school_id — remap to cfbd-* before cutover';
    END IF;

    ALTER TABLE public.scholarship_offers
      ALTER COLUMN school_id TYPE VARCHAR(100)
      USING NULL;
  END IF;
END $$;

-- 3) Pipeline stage tag column (SPA tags Official Visit in notes)
DO $$
BEGIN
  IF to_regclass('public.scholarship_offers') IS NULL THEN
    RETURN;
  END IF;

  ALTER TABLE public.scholarship_offers
    ADD COLUMN IF NOT EXISTS notes TEXT;
END $$;

-- 4) FK → production schools
DO $$
BEGIN
  IF to_regclass('public.scholarship_offers') IS NULL
     OR to_regclass('public.schools') IS NULL THEN
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'schools'
      AND column_name = 'school_id'
  ) THEN
    RAISE EXCEPTION 'production schools.school_id missing — run directory cutover first';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'scholarship_offers_school_id_fkey'
  ) THEN
    ALTER TABLE public.scholarship_offers
      ADD CONSTRAINT scholarship_offers_school_id_fkey
      FOREIGN KEY (school_id) REFERENCES public.schools(school_id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.scholarship_offers') IS NULL THEN
    RETURN;
  END IF;

  CREATE INDEX IF NOT EXISTS idx_scholarship_offers_school_id
    ON public.scholarship_offers (school_id);

  COMMENT ON COLUMN public.scholarship_offers.school_id IS
    'Production schools.school_id (cfbd-* / csv-*). MVP UUID archive retired.';
  COMMENT ON COLUMN public.scholarship_offers.notes IS
    'Free-text + pipeline stage tags (e.g. [pipeline:Official Visit]).';
END $$;

-- 5) Drop MVP UUID archive (no remaining FKs)
DO $$
BEGIN
  IF to_regclass('public.schools_mvp_archive') IS NULL THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE contype = 'f'
      AND confrelid = 'public.schools_mvp_archive'::regclass
  ) THEN
    RAISE EXCEPTION
      'schools_mvp_archive still referenced by FKs — drop dependents before archive drop';
  END IF;

  DROP TABLE public.schools_mvp_archive;
END $$;
