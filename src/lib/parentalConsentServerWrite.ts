/**
 * Express mirror of the SPA parental-consent insert.
 * The athlete id is bound to the Supabase user before the write.
 * The insert uses that user's JWT so RLS `athlete_id = auth.uid()` still applies.
 */
import { createClient } from "@supabase/supabase-js";
import type { GuardianRelationship, ParentConsentRecord } from "../types";
import { bindConsentAthleteIdToSession } from "./parentalConsentBind";
import { verifySupabaseAccessToken } from "./supabaseUserAuth";
import {
  isParentalConsentPayloadValid,
  type ParentalConsentSubmitInput,
} from "../services/parentalConsentApi";

interface ParentalConsentRow {
  id: string;
  athlete_id: string;
  parent_name: string;
  parent_email: string;
  relationship: GuardianRelationship;
  coppa_consent: boolean;
  messaging_consent: boolean;
  biometric_consent: boolean;
  digital_signature: string;
  created_at: string;
}

function mapRow(row: ParentalConsentRow): ParentConsentRecord {
  return {
    consentId: row.id,
    athleteId: row.athlete_id,
    guardianName: row.parent_name,
    guardianEmail: row.parent_email,
    relationship: row.relationship,
    coppaConsent: row.coppa_consent,
    messagingConsent: row.messaging_consent,
    biometricConsent: row.biometric_consent,
    digitalSignature: row.digital_signature,
    safetyStatus: "CONSENT_GRANTED",
    milestoneDisclosuresAgreed: row.biometric_consent,
    coppaFerpaWaived: row.coppa_consent && row.messaging_consent,
    signatureTimestamp: row.created_at,
  };
}

function userScopedClient(accessToken: string) {
  const url = (process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL)?.trim();
  const anon = (process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY)?.trim();
  if (!url || !anon) {
    throw new Error("Database connection missing. Cannot record legal consent.");
  }
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

export async function insertParentalConsentForSession(
  accessToken: string,
  input: ParentalConsentSubmitInput,
): Promise<ParentConsentRecord> {
  const user = await verifySupabaseAccessToken(accessToken);
  const boundAthleteId = bindConsentAthleteIdToSession(input.athleteId, user?.id);
  const payload: ParentalConsentSubmitInput = { ...input, athleteId: boundAthleteId };
  if (!isParentalConsentPayloadValid(payload)) {
    throw new Error("Consent payload is incomplete. All legal acknowledgments are required.");
  }

  const client = userScopedClient(accessToken);
  const { data, error } = await client
    .from("parental_consents")
    .insert({
      athlete_id: boundAthleteId,
      parent_name: payload.parentName.trim(),
      parent_email: payload.parentEmail.trim().toLowerCase(),
      relationship: payload.relationship,
      coppa_consent: true,
      messaging_consent: true,
      biometric_consent: true,
      digital_signature: payload.digitalSignature.trim(),
    })
    .select(
      "id, athlete_id, parent_name, parent_email, relationship, coppa_consent, messaging_consent, biometric_consent, digital_signature, created_at",
    )
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error("Consent insert returned no row. Fail-closed.");
  }
  return mapRow(data as ParentalConsentRow);
}

export async function listParentalConsentsForSession(
  accessToken: string,
): Promise<ParentConsentRecord[]> {
  const user = await verifySupabaseAccessToken(accessToken);
  if (!user?.id) {
    throw new Error("Authentication required to record legal consent.");
  }
  const client = userScopedClient(accessToken);
  const { data, error } = await client
    .from("parental_consents")
    .select(
      "id, athlete_id, parent_name, parent_email, relationship, coppa_consent, messaging_consent, biometric_consent, digital_signature, created_at",
    )
    .eq("athlete_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }
  return ((data ?? []) as ParentalConsentRow[]).map(mapRow);
}
