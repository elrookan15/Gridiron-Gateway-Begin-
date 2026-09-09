-- Production directory RLS: public read for schools + college_coaches.
-- Writes remain service-role / ingest only (no anon INSERT/UPDATE/DELETE).
-- Aligns SPA `fetchSchools` / `fetchCoaches` with fail-open directory discovery.

ALTER TABLE IF EXISTS public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.college_coaches ENABLE ROW LEVEL SECURITY;

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

COMMENT ON POLICY "schools_public_read" ON public.schools IS
  'Directory is publicly readable; mutations via service role / ingest only.';
COMMENT ON POLICY "college_coaches_public_read" ON public.college_coaches IS
  'Verified staff directory readable; email may be NULL — never invent contacts.';
