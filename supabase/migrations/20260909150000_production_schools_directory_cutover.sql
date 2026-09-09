-- Production directory cutover: MVP UUID `schools` → archive; CFBD-shaped `schools` + coaches FK.
-- Applied remotely as `production_schools_directory_cutover` on project ujdgjaaioyfbvylzexts.
-- Safe only when product directory tables are empty / unused by SPA dossier joins.
-- Idempotent guards: skip rename if production PK already present.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'schools' AND column_name = 'school_id'
  ) THEN
    RAISE NOTICE 'production schools already present — skip MVP rename';
    RETURN;
  END IF;

  IF to_regclass('public.schools') IS NOT NULL
     AND to_regclass('public.schools_mvp_archive') IS NULL THEN
    ALTER TABLE public.schools RENAME TO schools_mvp_archive;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'division_tier_enum') THEN
    CREATE TYPE public.division_tier_enum AS ENUM (
      'FBS_POWER_4',
      'FBS_GROUP_5',
      'FCS',
      'DII',
      'DIII',
      'JUCO',
      'NAIA',
      'PREP'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.schools (
  school_id VARCHAR(100) PRIMARY KEY,
  institution_name VARCHAR(255) NOT NULL,
  mascot VARCHAR(100),
  abbreviation VARCHAR(50),
  tier public.division_tier_enum NOT NULL,
  conference VARCHAR(100),
  city VARCHAR(100),
  state VARCHAR(50),
  primary_color VARCHAR(7),
  secondary_color VARCHAR(7),
  stadium_capacity INTEGER,
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_schools_tier ON public.schools (tier);

-- college_coaches: ensure production shape (school_id VARCHAR → schools.school_id)
DO $$
BEGIN
  IF to_regclass('public.college_coaches') IS NULL THEN
    CREATE TABLE public.college_coaches (
      coach_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      school_id VARCHAR(100) NOT NULL REFERENCES public.schools(school_id) ON DELETE CASCADE,
      full_name VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      office_phone VARCHAR(50),
      twitter_handle VARCHAR(100),
      source_url VARCHAR(500),
      last_verified_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  END IF;
END $$;

-- Rewire FK / column types when table existed against MVP UUID schools
DO $$
DECLARE
  fk_name text;
BEGIN
  FOR fk_name IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    WHERE rel.relname = 'college_coaches' AND con.contype = 'f'
  LOOP
    EXECUTE format('ALTER TABLE public.college_coaches DROP CONSTRAINT IF EXISTS %I', fk_name);
  END LOOP;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'college_coaches' AND column_name = 'school_id'
      AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.college_coaches
      ALTER COLUMN school_id TYPE VARCHAR(100) USING school_id::text;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'college_coaches' AND column_name = 'id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'college_coaches' AND column_name = 'coach_id'
  ) THEN
    ALTER TABLE public.college_coaches RENAME COLUMN id TO coach_id;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'college_coaches_school_id_fkey'
  ) THEN
    ALTER TABLE public.college_coaches
      ADD CONSTRAINT college_coaches_school_id_fkey
      FOREIGN KEY (school_id) REFERENCES public.schools(school_id) ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_coaches_school ON public.college_coaches (school_id);
CREATE INDEX IF NOT EXISTS idx_coaches_email ON public.college_coaches (email) WHERE email IS NOT NULL;

-- scholarship_offers (if present) stays on MVP archive UUID schools
DO $$
DECLARE
  fk_name text;
BEGIN
  IF to_regclass('public.scholarship_offers') IS NULL THEN
    RETURN;
  END IF;
  IF to_regclass('public.schools_mvp_archive') IS NULL THEN
    RETURN;
  END IF;

  FOR fk_name IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    WHERE rel.relname = 'scholarship_offers' AND con.contype = 'f'
  LOOP
    EXECUTE format('ALTER TABLE public.scholarship_offers DROP CONSTRAINT IF EXISTS %I', fk_name);
  END LOOP;

  ALTER TABLE public.scholarship_offers
    ADD CONSTRAINT scholarship_offers_school_id_fkey
    FOREIGN KEY (school_id) REFERENCES public.schools_mvp_archive(id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN undefined_column THEN NULL;
END $$;

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.college_coaches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "schools_public_read" ON public.schools;
CREATE POLICY "schools_public_read"
  ON public.schools
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "college_coaches_public_read" ON public.college_coaches;
CREATE POLICY "college_coaches_public_read"
  ON public.college_coaches
  FOR SELECT
  TO anon, authenticated
  USING (true);

COMMENT ON TABLE public.schools IS 'CFBD/CSV production directory. PK = school_id (cfbd-{id}).';
COMMENT ON TABLE public.college_coaches IS 'Verified staff; email may be NULL — never invent contacts.';
COMMENT ON TABLE public.schools_mvp_archive IS 'Pre-cutover UUID schools retained for dossier / scholarship_offers joins.';
