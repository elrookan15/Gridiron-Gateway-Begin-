/**
 * Server-only Postgres writer for public.compliance_audit_logs.
 * Never import this from the Vite SPA — service role must stay off the bundle.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ComplianceAuditPersistInput, ComplianceAuditPersistResult } from "../types";

let adminClient: SupabaseClient | null | undefined;

function getServiceRoleClient(): SupabaseClient | null {
  if (adminClient !== undefined) return adminClient;

  const url = (process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL)?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) {
    adminClient = null;
    return null;
  }

  adminClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return adminClient;
}

export function isComplianceAuditPostgresConfigured(): boolean {
  return getServiceRoleClient() !== null;
}

export async function persistComplianceAuditToPostgres(
  input: ComplianceAuditPersistInput,
): Promise<ComplianceAuditPersistResult> {
  const client = getServiceRoleClient();
  if (!client) {
    return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY unset — cannot record compliance_audit_logs." };
  }

  const { data, error } = await client
    .from("compliance_audit_logs")
    .insert({
      school_id: input.schoolId,
      coach_id: input.coachId,
      athlete_id: input.athleteId,
      action_type: input.actionType,
      clearance_status: input.evaluation.status,
      notes: input.evaluation.reason,
      flagged_keywords: input.evaluation.flaggedKeywords,
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    return { ok: false, error: error?.message ?? "compliance_audit_logs insert returned no id." };
  }

  return { ok: true, id: String(data.id) };
}
