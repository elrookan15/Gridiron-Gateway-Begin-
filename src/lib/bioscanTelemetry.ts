import type { BioScanTelemetry } from "../types";

export interface BioscanWsTelemetryPayload {
  athleteId: string;
  currentSpeedMph: number;
  cumulativeLoad: number;
}

export type BioscanBoardRow = Pick<
  BioScanTelemetry,
  "id" | "inGameMaxSprintMph" | "playerLoadScore" | "lastSyncTimestamp"
>;

/**
 * Catapult/WHOOP metrics may legitimately be 0 (stance, rest intervals).
 * `Number(x) || fallback` fabricated 22.8 MPH / 512 load on those packets.
 */
export function parseBioscanMetric(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

/**
 * Apply a live WS telemetry frame only to the athlete named in the packet.
 * Never fall through to a hardcoded demo card (e.g. `bio-1`).
 */
export function applyBioscanWsUpdate<T extends BioscanBoardRow>(
  rows: readonly T[],
  update: BioscanWsTelemetryPayload,
  timestampLabel: string,
): T[] {
  return rows.map((item) => {
    if (item.id !== update.athleteId) return item;
    return {
      ...item,
      inGameMaxSprintMph: update.currentSpeedMph,
      playerLoadScore: update.cumulativeLoad,
      lastSyncTimestamp: timestampLabel,
    };
  });
}
