-- Bind parental_consents INSERT to the authenticated athlete session.
-- Prior WITH CHECK only validated consent flags, so any JWT could insert a
-- row for an arbitrary athlete_id and the SECURITY DEFINER trigger would
-- flip athlete_profiles.contact_authorized (COPPA contact bypass).

DROP POLICY IF EXISTS "authenticated_insert_parental_consents" ON public.parental_consents;
CREATE POLICY "authenticated_insert_parental_consents"
  ON public.parental_consents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    athlete_id = auth.uid()::text
    AND coppa_consent = TRUE
    AND messaging_consent = TRUE
    AND biometric_consent = TRUE
    AND lower(btrim(digital_signature)) = lower(btrim(parent_name))
  );

COMMENT ON POLICY "authenticated_insert_parental_consents" ON public.parental_consents IS
  'Fail-closed COPPA insert: consent rows must target the signed-in athlete (auth.uid).';
