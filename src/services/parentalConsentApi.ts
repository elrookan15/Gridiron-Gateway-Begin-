import type { GuardianRelationship, ParentConsentRecord } from "../types";
import { getSupabaseClient, isSupabaseConfigured } from "../lib/supabaseClient";

export interface ParentalConsentSubmitInput {
  athleteId: string;
  parentName: string;
  parentEmail: string;
  relationship: GuardianRelationship;
  coppaConsent: boolean;
  messagingConsent: boolean;
  biometricConsent: boolean;
  digitalSignature: string;
}

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

export function isParentalConsentPayloadValid(input: ParentalConsentSubmitInput): boolean {
  return (
    input.athleteId.trim() !== "" &&
    input.parentName.trim() !== "" &&
    input.parentEmail.includes("@") &&
    (input.relationship === "MOTHER" ||
      input.relationship === "FATHER" ||
      input.relationship === "LEGAL_GUARDIAN") &&
    input.coppaConsent &&
    input.messagingConsent &&
    input.biometricConsent &&
    input.digitalSignature.trim().toLowerCase() === input.parentName.trim().toLowerCase()
  );
}

function mapParentalConsent(row: ParentalConsentRow): ParentConsentRecord {
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

/**
 * Inserts an append-only parental_consents row. Postgres CHECKs reject partial
 * acknowledgments. Trigger sets athlete_profiles.contact_authorized = true.
 */
export async function submitParentalConsent(
  input: ParentalConsentSubmitInput,
): Promise<ParentConsentRecord> {
  if (!isSupabaseConfigured()) {
    throw new Error("Database connection missing. Cannot record legal consent.");
  }
  if (!isParentalConsentPayloadValid(input)) {
    throw new Error("Consent payload is incomplete. All legal acknowledgments are required.");
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("parental_consents")
    .insert({
      athlete_id: input.athleteId.trim(),
      parent_name: input.parentName.trim(),
      parent_email: input.parentEmail.trim().toLowerCase(),
      relationship: input.relationship,
      coppa_consent: true,
      messaging_consent: true,
      biometric_consent: true,
      digital_signature: input.digitalSignature.trim(),
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

  return mapParentalConsent(data as ParentalConsentRow);
}
