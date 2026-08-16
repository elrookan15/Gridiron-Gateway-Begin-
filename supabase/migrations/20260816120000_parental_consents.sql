-- COPPA / NCAA minor contact lock.
-- athlete_profiles.contact_authorized defaults FALSE (minors stay locked).
-- parental_consents insert is the only legal flip to TRUE (trigger, SECURITY DEFINER).

ALTER TABLE public.athlete_profiles
  ADD COLUMN IF NOT EXISTS date_of_birth DATE;

ALTER TABLE public.athlete_profiles
  ADD COLUMN IF NOT EXISTS contact_authorized BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN public.athlete_profiles.contact_authorized IS
  'Fail-closed coach-contact flag. Minors remain FALSE until a parental_consents row is inserted.';

CREATE OR REPLACE FUNCTION public.fn_lock_minor_contact_authorized()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.date_of_birth IS NULL OR NEW.date_of_birth > (CURRENT_DATE - INTERVAL '18 years') THEN
    NEW.contact_authorized := FALSE;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_lock_minor_contact_authorized ON public.athlete_profiles;
CREATE TRIGGER trg_lock_minor_contact_authorized
  BEFORE INSERT ON public.athlete_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_lock_minor_contact_authorized();

CREATE TABLE IF NOT EXISTS public.parental_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  relationship TEXT NOT NULL CHECK (relationship IN ('MOTHER', 'FATHER', 'LEGAL_GUARDIAN')),
  coppa_consent BOOLEAN NOT NULL CHECK (coppa_consent = TRUE),
  messaging_consent BOOLEAN NOT NULL CHECK (messaging_consent = TRUE),
  biometric_consent BOOLEAN NOT NULL CHECK (biometric_consent = TRUE),
  digital_signature TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT parental_consents_signature_matches_name CHECK (
    lower(btrim(digital_signature)) = lower(btrim(parent_name))
  ),
  CONSTRAINT parental_consents_email_has_at CHECK (position('@' IN parent_email) > 1)
);

CREATE INDEX IF NOT EXISTS parental_consents_athlete_idx ON public.parental_consents (athlete_id);

ALTER TABLE public.parental_consents ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.fn_apply_parental_consent_authorization()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  has_id boolean;
  has_user_id boolean;
  has_athlete_pk boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'athlete_profiles' AND column_name = 'id'
  ) INTO has_id;
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'athlete_profiles' AND column_name = 'user_id'
  ) INTO has_user_id;
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'athlete_profiles' AND column_name = 'athlete_id'
  ) INTO has_athlete_pk;

  IF has_id THEN
    UPDATE public.athlete_profiles
    SET contact_authorized = TRUE
    WHERE id::text = NEW.athlete_id;
  END IF;
  IF has_user_id THEN
    UPDATE public.athlete_profiles
    SET contact_authorized = TRUE
    WHERE user_id::text = NEW.athlete_id;
  END IF;
  IF has_athlete_pk THEN
    UPDATE public.athlete_profiles
    SET contact_authorized = TRUE
    WHERE athlete_id::text = NEW.athlete_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_apply_parental_consent ON public.parental_consents;
CREATE TRIGGER trg_apply_parental_consent
  AFTER INSERT ON public.parental_consents
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_apply_parental_consent_authorization();

REVOKE UPDATE (contact_authorized) ON public.athlete_profiles FROM anon, authenticated;

DROP POLICY IF EXISTS "authenticated_insert_parental_consents" ON public.parental_consents;
CREATE POLICY "authenticated_insert_parental_consents"
  ON public.parental_consents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    coppa_consent = TRUE
    AND messaging_consent = TRUE
    AND biometric_consent = TRUE
    AND lower(btrim(digital_signature)) = lower(btrim(parent_name))
  );

DROP POLICY IF EXISTS "select_own_or_compliance_parental_consents" ON public.parental_consents;
CREATE POLICY "select_own_or_compliance_parental_consents"
  ON public.parental_consents
  FOR SELECT
  TO authenticated
  USING (
    athlete_id = auth.uid()::text
    OR EXISTS (
      SELECT 1
      FROM public.school_staff_roles ssr
      WHERE ssr.user_id = auth.uid()
        AND ssr.role_tier = 'COMPLIANCE_OFFICER'
    )
  );

DROP POLICY IF EXISTS "lock_parental_consents_update" ON public.parental_consents;
CREATE POLICY "lock_parental_consents_update"
  ON public.parental_consents
  FOR UPDATE
  USING (false);

DROP POLICY IF EXISTS "lock_parental_consents_delete" ON public.parental_consents;
CREATE POLICY "lock_parental_consents_delete"
  ON public.parental_consents
  FOR DELETE
  USING (false);
