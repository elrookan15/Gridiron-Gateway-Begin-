import type { SchemeFitScoutAlert } from "../types";

export interface SchemeScoutMetrics {
  trueSpeedMph: number;
  cognitionScore: number;
  laserShuttle: number;
}

export function calculateSchemeConfidence(
  scheme: SchemeFitScoutAlert["matchedScheme"],
  metrics: SchemeScoutMetrics,
): number {
  const { trueSpeedMph, cognitionScore, laserShuttle } = metrics;
  let score = 70;

  if (scheme === "Air Raid") {
    if (trueSpeedMph >= 22.0) score += 15;
    else if (trueSpeedMph >= 21.0) score += 10;

    if (laserShuttle <= 4.1) score += 15;
    else if (laserShuttle <= 4.2) score += 10;
  } else if (scheme === "Spread Option") {
    if (trueSpeedMph >= 22.5) score += 15;
    else if (trueSpeedMph >= 21.5) score += 10;

    if (cognitionScore >= 92) score += 15;
    else if (cognitionScore >= 85) score += 10;
  } else if (scheme === "West Coast") {
    if (cognitionScore >= 95) score += 15;
    else if (cognitionScore >= 90) score += 10;

    if (laserShuttle <= 4.05) score += 15;
    else if (laserShuttle <= 4.15) score += 10;
  } else if (scheme === "3-4 Blitz") {
    if (trueSpeedMph >= 21.5) score += 15;
    else if (trueSpeedMph >= 20.5) score += 10;

    if (cognitionScore >= 90) score += 15;
    else if (cognitionScore >= 82) score += 10;
  } else if (scheme === "Cover 3 Match") {
    if (trueSpeedMph >= 22.2) score += 15;
    else if (trueSpeedMph >= 21.5) score += 10;

    if (cognitionScore >= 93) score += 15;
    else if (cognitionScore >= 88) score += 10;
  }

  return Math.min(100, Math.max(0, Math.round(score)));
}

export function isAlertDispatchValid(alert: Partial<SchemeFitScoutAlert>): boolean {
  if (!alert.athleteId || !alert.athleteId.trim()) return false;
  if (!alert.athleteName || !alert.athleteName.trim()) return false;
  if (!alert.matchedScheme) return false;
  if (typeof alert.confidenceScore !== "number" || alert.confidenceScore < 0 || alert.confidenceScore > 100) return false;
  if (!alert.keyMetrics) return false;
  if (typeof alert.keyMetrics.trueSpeedMph !== "number" || alert.keyMetrics.trueSpeedMph <= 0) return false;
  if (typeof alert.keyMetrics.cognitionScore !== "number" || alert.keyMetrics.cognitionScore <= 0) return false;
  if (typeof alert.keyMetrics.laserShuttle !== "number" || alert.keyMetrics.laserShuttle <= 0) return false;
  return true;
}
