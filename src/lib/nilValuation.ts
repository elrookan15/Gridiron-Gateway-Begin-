import type {
  NilMarketDivision,
  NilPositionGroup,
  NilStarRating,
  NilValuationCents,
  NilValuationInput,
} from "../types";

/** Basis points / 100 = multiplier (500 → 5.00x). House v. NCAA P4 revenue-share tier. */
export const NIL_DIVISION_BPS: Record<NilMarketDivision, number> = {
  FBS_P4: 500,
  FBS_G5: 150,
  FCS: 80,
  D2: 30,
  D3: 10,
  NAIA: 10,
  JUCO: 20,
  PREP: 10,
};

export const NIL_POSITION_BPS: Record<NilPositionGroup, number> = {
  QB: 250,
  SKILL: 150,
  DEFENSE: 120,
  LINEMAN: 100,
  SPECIAL: 50,
};

/** Star baseline in integer cents. */
export const NIL_STAR_BASE_CENTS: Record<NilStarRating, number> = {
  5: 7_500_000,
  4: 2_000_000,
  3: 500_000,
  2: 100_000,
  1: 50_000,
};

/** $0.85 per engaged follower / year → 85 cents. */
const SOCIAL_CENTS_PER_ENGAGED_FOLLOWER = 85;

const FOLLOWERS_MIN = 0;
const FOLLOWERS_MAX = 500_000;
const ENGAGEMENT_TENTHS_MIN = 1;
const ENGAGEMENT_TENTHS_MAX = 150;

export const DEFAULT_NIL_INPUT: NilValuationInput = {
  division: "FBS_P4",
  position: "QB",
  stars: 4,
  followers: 15_000,
  engagementTenths: 45,
};

function clampInt(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.trunc(value)));
}

function roundToDollarCents(cents: number): number {
  return Math.round(cents / 100) * 100;
}

/**
 * Deterministic 2026 NIL estimator. All money in integer cents.
 * athleticCents = starBaseCents × divisionBps × positionBps / 10_000
 * socialCents   = round(followers × engagementTenths × 85 / 1_000) then dollar-round
 */
export function estimateNilValuationCents(input: NilValuationInput): NilValuationCents {
  const stars = input.stars;
  const division = input.division;
  const position = input.position;

  const followers = clampInt(input.followers, FOLLOWERS_MIN, FOLLOWERS_MAX);
  const engagementTenths = clampInt(
    input.engagementTenths,
    ENGAGEMENT_TENTHS_MIN,
    ENGAGEMENT_TENTHS_MAX,
  );

  const baseCents = NIL_STAR_BASE_CENTS[stars];
  const divBps = NIL_DIVISION_BPS[division];
  const posBps = NIL_POSITION_BPS[position];

  const athleticCents = Math.round((baseCents * divBps * posBps) / 10_000);

  const socialRawCents = Math.round(
    (followers * engagementTenths * SOCIAL_CENTS_PER_ENGAGED_FOLLOWER) / 1_000,
  );
  const socialCents = roundToDollarCents(socialRawCents);

  return {
    athleticCents,
    socialCents,
    totalCents: athleticCents + socialCents,
  };
}

export function formatUsdFromCents(cents: number): string {
  const dollars = Math.trunc(cents / 100);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(dollars);
}

export function engagementPercentToTenths(percent: number): number {
  return clampInt(Math.round(percent * 10), ENGAGEMENT_TENTHS_MIN, ENGAGEMENT_TENTHS_MAX);
}

export function engagementTenthsToPercent(tenths: number): number {
  return tenths / 10;
}
