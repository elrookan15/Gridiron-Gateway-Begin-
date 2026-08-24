export interface LaserIngestionPayload {
  athleteName: string;
  athleteId: string;
  combineEventName: string;
  laserFortyTime: number;
  laserShuttleTime: number;
  laserThreeConeTime: number;
  verticalJumpInches: number;
  broadJumpInches: number;
}

export interface LaserIngestionResult {
  success: boolean;
  errorCode?: string;
  message?: string;
  ingestedEntry?: {
    id: string;
    athleteName: string;
    athleteId: string;
    combineEventName: string;
    laserFortyTime: number;
    laserShuttleTime: number;
    laserThreeConeTime: number;
    verticalJumpInches: number;
    broadJumpInches: number;
    verifiedBy: string;
    timestamp: string;
  };
}

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Fail-closed laser-gate ingress. Impossible / incomplete packets must never
 * receive a Verified badge — the Express webhook is the live hardware path.
 */
export function validateAndIngestLaserPacket(
  payload: Partial<LaserIngestionPayload> | Record<string, unknown> | null | undefined,
): LaserIngestionResult {
  const record =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : {};

  const athleteId = asTrimmedString(record.athleteId);
  const athleteName = asTrimmedString(record.athleteName);
  const combineEventName = asTrimmedString(record.combineEventName);

  if (!athleteId) {
    return { success: false, errorCode: "MISSING_ATHLETE_ID", message: "Athlete ID is required for combine verification." };
  }
  if (!athleteName) {
    return { success: false, errorCode: "MISSING_ATHLETE_NAME", message: "Athlete name is required." };
  }
  if (!combineEventName) {
    return { success: false, errorCode: "MISSING_EVENT_NAME", message: "Combine event name is required." };
  }

  const forty = Number(record.laserFortyTime);
  if (isNaN(forty) || forty < 4.10 || forty > 6.00) {
    return { success: false, errorCode: "INVALID_40_YARD_DASH", message: "Laser 40-yard dash time must be between 4.10s and 6.00s." };
  }

  const shuttle = Number(record.laserShuttleTime);
  if (isNaN(shuttle) || shuttle < 3.80 || shuttle > 5.20) {
    return { success: false, errorCode: "INVALID_SHUTTLE_TIME", message: "Laser 20-yard shuttle time must be between 3.80s and 5.20s." };
  }

  const threeCone = Number(record.laserThreeConeTime);
  if (isNaN(threeCone) || threeCone < 6.40 || threeCone > 8.50) {
    return { success: false, errorCode: "INVALID_3CONE_TIME", message: "Laser 3-cone time must be between 6.40s and 8.50s." };
  }

  const vert = Number(record.verticalJumpInches);
  if (isNaN(vert) || vert < 20.0 || vert > 50.0) {
    return { success: false, errorCode: "INVALID_VERTICAL_JUMP", message: "Vertical jump must be between 20.0 and 50.0 inches." };
  }

  const broad = Number(record.broadJumpInches);
  if (isNaN(broad) || broad < 80.0 || broad > 150.0) {
    return { success: false, errorCode: "INVALID_BROAD_JUMP", message: "Broad jump must be between 80.0 and 150.0 inches." };
  }

  return {
    success: true,
    ingestedEntry: {
      id: `las-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      athleteName,
      athleteId,
      combineEventName,
      laserFortyTime: forty,
      laserShuttleTime: shuttle,
      laserThreeConeTime: threeCone,
      verticalJumpInches: vert,
      broadJumpInches: broad,
      verifiedBy: "⚡ Laser Hardware Verified Ingress",
      timestamp: new Date().toISOString(),
    },
  };
}
