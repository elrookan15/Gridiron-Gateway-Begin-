import type { TrueSpeedTelemetry } from "../types";

export const LEFT_HIP = 23;
export const RIGHT_HIP = 24;
export const LEFT_ANKLE = 27;
export const RIGHT_ANKLE = 28;

const FORTY_YARDS = 40;
const INCHES_PER_YARD = 36;
const YARDS_PER_SEC_TO_MPH = 3600 / 1760;
const MIN_HIP_TRAVEL = 0.12;
const MIN_SAMPLES = 8;

export interface HipSample {
  tSec: number;
  hipX: number;
  visibility: number;
  leftAnkleX: number;
  rightAnkleX: number;
}

export function hipCenterX(leftHipX: number, rightHipX: number): number {
  return (leftHipX + rightHipX) / 2;
}

export function computeTrueSpeedFromHipTrack(
  athleteId: string,
  samples: HipSample[],
): TrueSpeedTelemetry {
  const analyzedAt = new Date().toISOString();
  const rejected = (reasonConfidence: number): TrueSpeedTelemetry => ({
    athleteId,
    verifiedFortyTime: null,
    peakVelocityMph: null,
    averageStrideLengthInches: null,
    confidenceScore: reasonConfidence,
    verificationStatus: "REJECTED",
    analyzedAt,
  });

  const usable = samples.filter((sample) => sample.visibility >= 0.5);
  if (usable.length < MIN_SAMPLES) {
    return rejected(usable.length === 0 ? 0 : usable.reduce((sum, s) => sum + s.visibility, 0) / usable.length);
  }

  const startX = usable[0].hipX;
  const endX = usable[usable.length - 1].hipX;
  const travel = Math.abs(endX - startX);
  const meanVis = usable.reduce((sum, s) => sum + s.visibility, 0) / usable.length;

  if (travel < MIN_HIP_TRAVEL) {
    return rejected(meanVis);
  }

  let motionStart = usable[0];
  for (const sample of usable) {
    if (Math.abs(sample.hipX - startX) >= 0.02) {
      motionStart = sample;
      break;
    }
  }

  let motionEnd = usable[usable.length - 1];
  for (let i = usable.length - 1; i >= 0; i -= 1) {
    if (Math.abs(usable[i].hipX - startX) >= travel * 0.9) {
      motionEnd = usable[i];
      break;
    }
  }

  const fortyTime = motionEnd.tSec - motionStart.tSec;
  if (!(fortyTime > 3.2 && fortyTime < 9.5)) {
    return rejected(meanVis);
  }

  const yardsPerNorm = FORTY_YARDS / travel;
  let peakYardsPerSec = 0;
  for (let i = 1; i < usable.length; i += 1) {
    const dt = usable[i].tSec - usable[i - 1].tSec;
    if (dt <= 0) continue;
    const dy = Math.abs(usable[i].hipX - usable[i - 1].hipX) * yardsPerNorm;
    peakYardsPerSec = Math.max(peakYardsPerSec, dy / dt);
  }

  let steps = 0;
  for (let i = 1; i < usable.length; i += 1) {
    const prev = usable[i - 1].leftAnkleX - usable[i - 1].rightAnkleX;
    const next = usable[i].leftAnkleX - usable[i].rightAnkleX;
    if (prev === 0 || next === 0) continue;
    if (Math.sign(prev) !== Math.sign(next)) steps += 1;
  }

  return {
    athleteId,
    verifiedFortyTime: Math.round(fortyTime * 100) / 100,
    peakVelocityMph: Math.round(peakYardsPerSec * YARDS_PER_SEC_TO_MPH * 10) / 10,
    averageStrideLengthInches:
      steps >= 4 ? Math.round(((FORTY_YARDS * INCHES_PER_YARD) / steps) * 10) / 10 : null,
    confidenceScore: Math.round(meanVis * 100) / 100,
    verificationStatus: "AUTHENTICATED",
    analyzedAt,
  };
}
