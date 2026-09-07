import type { CapGmPlayer, CapGmState, RetentionRiskLevel } from "../types";
import { CAP_GM_HARD_CAP_CENTS } from "../types";

export const CAP_ALLOCATION_STEP_CENTS = 2_500_000;
export const CAP_ALLOCATION_STEP_DOLLARS = 25_000;

export function maxAllocationCents(marketValueCents: number): number {
  return Math.floor((Math.max(0, marketValueCents) * 3) / 2);
}

export function maxAllocationDollars(marketValueCents: number): number {
  return Math.trunc(maxAllocationCents(marketValueCents) / 100);
}

/** Slider emits dollars. Convert at the state boundary so roster never stores floats. */
export function dollarsToAllocatedCents(newDollars: number): number {
  return Math.max(0, Math.floor(newDollars * 100));
}

export function allocatedCentsToSliderDollars(cents: number): number {
  return Math.trunc(cents / 100);
}

export function formatCapCents(cents: number): string {
  const dollars = Math.trunc(cents / 100);
  const sign = dollars < 0 ? "-" : "";
  return `${sign}$${Math.abs(dollars).toLocaleString("en-US")}`;
}

/** Integer tenths of a percent: 234 → 23.4% */
export function capUsageTenths(allocatedCents: number, totalCapCents: number): number {
  if (totalCapCents <= 0) return 0;
  return Math.floor((allocatedCents * 1000) / totalCapCents);
}

export function formatCapUsagePercent(allocatedCents: number, totalCapCents: number): string {
  const tenths = capUsageTenths(allocatedCents, totalCapCents);
  const whole = Math.trunc(tenths / 10);
  const frac = Math.abs(tenths % 10);
  return `${whole}.${frac}%`;
}

function playerFundingBucket(player: CapGmPlayer): "ok" | "underfunded" | "critical" {
  if (player.marketValueCents <= 0) return "critical";
  if (player.allocatedCents * 100 < player.marketValueCents * 70) return "critical";
  if (player.allocatedCents * 100 < player.marketValueCents * 95) return "underfunded";
  return "ok";
}

export function isPlayerCriticallyUnderfunded(player: CapGmPlayer): boolean {
  return playerFundingBucket(player) === "critical";
}

export function computeCapGmState(
  roster: readonly CapGmPlayer[],
  totalCapCents: number = CAP_GM_HARD_CAP_CENTS,
): CapGmState {
  const retained = roster.filter((player) => player.isRetained);

  const allocatedCents = retained.reduce((sum, player) => sum + player.allocatedCents, 0);
  const projectedEpa = retained.reduce((sum, player) => sum + player.baseEpa, 0);

  const criticalCount = retained.filter((player) => playerFundingBucket(player) === "critical").length;
  const underfundedCount = retained.filter((player) => playerFundingBucket(player) === "underfunded").length;

  let globalRetentionRisk: RetentionRiskLevel = "LOW";
  if (criticalCount >= 2) globalRetentionRisk = "CRITICAL";
  else if (criticalCount === 1 || underfundedCount >= 2) globalRetentionRisk = "HIGH";
  else if (underfundedCount === 1) globalRetentionRisk = "MODERATE";

  return {
    totalCapCents,
    allocatedCents,
    remainingCents: totalCapCents - allocatedCents,
    projectedEpa,
    globalRetentionRisk,
  };
}
