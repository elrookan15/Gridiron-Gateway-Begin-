-- Align college_coaches PK column with schema.production.sql + SPA fetchCoaches.
-- Remote apply name: college_coaches_coach_id_align

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'college_coaches' AND column_name = 'id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'college_coaches' AND column_name = 'coach_id'
  ) THEN
    ALTER TABLE public.college_coaches RENAME COLUMN id TO coach_id;
  END IF;
END $$;

COMMENT ON COLUMN public.college_coaches.coach_id IS
  'Stable staff UUID; maps to DatabaseCoach.coachId / SPA fetchCoaches.';
