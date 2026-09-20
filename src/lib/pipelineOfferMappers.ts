/**
 * Production Kanban adapters: scholarship_offers + lean athlete_profiles
 * (`schema.production.sql`) → `PipelineOffer`.
 *
 * Do not embed MVP `users` / `athlete_profiles.user_id` — Top 250 and the
 * live directory already key cards by `athlete_id`.
 */
import type { PipelineOffer, RecruitingPipelineStage } from "../types";

export const OFFICIAL_VISIT_TAG = "[pipeline:Official Visit]";

export interface PipelineOfferBaseRow {
  id: string;
  school_id: string;
  athlete_id: string;
  is_official: boolean;
  offer_date: string;
  commitment_status: string;
  notes: string | null;
}

export interface PipelineAthleteFactsRow {
  athlete_id: string;
  first_name: string;
  last_name: string;
  primary_position: string | null;
  star_rating: number | null;
}

/**
 * Derive Kanban stage from offer flags until a dedicated `pipeline_stage` column ships.
 * Official Visit is tagged in `notes` so it survives reload.
 */
export function derivePipelineStage(
  commitmentStatus: string,
  isOfficial: boolean,
  notes?: string | null,
): RecruitingPipelineStage {
  const status = commitmentStatus.trim().toLowerCase();
  if (status === "committed" || status === "signed") {
    return "Committed";
  }
  if (notes?.includes(OFFICIAL_VISIT_TAG)) {
    return "Official Visit";
  }
  if (isOfficial) {
    return "Offered";
  }
  return "Evaluating";
}

export function mapPipelineOffer(
  offer: PipelineOfferBaseRow,
  athlete: PipelineAthleteFactsRow | null,
): PipelineOffer {
  const first = athlete?.first_name?.trim() || "Unknown";
  const last = athlete?.last_name?.trim() || "Athlete";
  const position = athlete?.primary_position?.trim() || "ATH";
  const starRating = Math.min(Math.max(athlete?.star_rating ?? 0, 0), 5);

  return {
    id: offer.id,
    schoolId: offer.school_id,
    athleteId: offer.athlete_id,
    isOfficial: Boolean(offer.is_official),
    offerDate: offer.offer_date,
    commitmentStatus: offer.commitment_status,
    stage: derivePipelineStage(
      offer.commitment_status,
      Boolean(offer.is_official),
      offer.notes,
    ),
    athleteName: `${first} ${last}`.trim(),
    position,
    starRating,
  };
}
