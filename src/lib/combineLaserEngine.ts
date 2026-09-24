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

/** Human 40-yard floor/ceiling. Below 4.10s is not a recorded laser time; above 6.00s is not a verified sprint. */
export const LASER_FORTY_MIN_SECONDS = 4.1;
export const LASER_FORTY_MAX_SECONDS = 6.0;

/**
 * Webhook + engine share this predicate so a positive-but-impossible 40
 * (3.50s, 9.90s) cannot be stamped Laser Verified.
 */
export function isPlausibleLaserFortyTime(forty: number): boolean {
  return (
    Number.isFinite(forty) &&
    forty >= LASER_FORTY_MIN_SECONDS &&
    forty <= LASER_FORTY_MAX_SECONDS
  );
}

export function validateAndIngestLaserPacket(payload: Partial<LaserIngestionPayload>): LaserIngestionResult {
  if (!payload.athleteId || !payload.athleteId.trim()) {
    return { success: false, errorCode: "MISSING_ATHLETE_ID", message: "Athlete ID is required for combine verification." };
  }
  if (!payload.athleteName || !payload.athleteName.trim()) {
    return { success: false, errorCode: "MISSING_ATHLETE_NAME", message: "Athlete name is required." };
  }
  if (!payload.combineEventName || !payload.combineEventName.trim()) {
    return { success: false, errorCode: "MISSING_EVENT_NAME", message: "Combine event name is required." };
  }

  const forty = Number(payload.laserFortyTime);
  if (!isPlausibleLaserFortyTime(forty)) {
    return { success: false, errorCode: "INVALID_40_YARD_DASH", message: "Laser 40-yard dash time must be between 4.10s and 6.00s." };
  }

  const shuttle = Number(payload.laserShuttleTime);
  if (isNaN(shuttle) || shuttle < 3.80 || shuttle > 5.20) {
    return { success: false, errorCode: "INVALID_SHUTTLE_TIME", message: "Laser 20-yard shuttle time must be between 3.80s and 5.20s." };
  }

  const threeCone = Number(payload.laserThreeConeTime);
  if (isNaN(threeCone) || threeCone < 6.40 || threeCone > 8.50) {
    return { success: false, errorCode: "INVALID_3CONE_TIME", message: "Laser 3-cone time must be between 6.40s and 8.50s." };
  }

  const vert = Number(payload.verticalJumpInches);
  if (isNaN(vert) || vert < 20.0 || vert > 50.0) {
    return { success: false, errorCode: "INVALID_VERTICAL_JUMP", message: "Vertical jump must be between 20.0 and 50.0 inches." };
  }

  const broad = Number(payload.broadJumpInches);
  if (isNaN(broad) || broad < 80.0 || broad > 150.0) {
    return { success: false, errorCode: "INVALID_BROAD_JUMP", message: "Broad jump must be between 80.0 and 150.0 inches." };
  }

  return {
    success: true,
    ingestedEntry: {
      id: `las-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      athleteName: payload.athleteName.trim(),
      athleteId: payload.athleteId.trim(),
      combineEventName: payload.combineEventName.trim(),
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
