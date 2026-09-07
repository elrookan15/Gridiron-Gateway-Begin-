import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { Calculator, DollarSign, TrendingUp, Users } from "lucide-react";
import type {
  NilMarketDivision,
  NilPositionGroup,
  NilStarRating,
  NilValuationCents,
} from "../types";
import { Slider } from "./ui/slider";
import {
  DEFAULT_NIL_INPUT,
  engagementTenthsToPercent,
  estimateNilValuationCents,
  formatUsdFromCents,
} from "../lib/nilValuation";

const DIVISION_OPTIONS: readonly { value: NilMarketDivision; label: string }[] = [
  { value: "FBS_P4", label: "FBS - Power 4" },
  { value: "FBS_G5", label: "FBS - Group of 5" },
  { value: "FCS", label: "FCS" },
  { value: "D2", label: "Division II" },
  { value: "D3", label: "Division III" },
  { value: "NAIA", label: "NAIA" },
  { value: "JUCO", label: "JUCO" },
  { value: "PREP", label: "Prep / Post-Grad" },
] as const;

const POSITION_OPTIONS: readonly { value: NilPositionGroup; label: string }[] = [
  { value: "QB", label: "Quarterback" },
  { value: "SKILL", label: "Skill (WR, RB, TE)" },
  { value: "DEFENSE", label: "Defense (DB, LB, EDGE)" },
  { value: "LINEMAN", label: "Lineman (OL, DL)" },
  { value: "SPECIAL", label: "Special Teams (K, P, LS)" },
] as const;

const STAR_RATINGS: readonly NilStarRating[] = [1, 2, 3, 4, 5];

export interface NILCalculatorProps {
  onEstimateChange?: (payload: {
    followers: number;
    engagementRate: number;
    stars: NilStarRating;
    valuation: NilValuationCents;
  }) => void;
}

function isNilMarketDivision(value: string): value is NilMarketDivision {
  return DIVISION_OPTIONS.some((option) => option.value === value);
}

function isNilPositionGroup(value: string): value is NilPositionGroup {
  return POSITION_OPTIONS.some((option) => option.value === value);
}

export const NILCalculator: React.FC<NILCalculatorProps> = ({ onEstimateChange }) => {
  const [division, setDivision] = useState<NilMarketDivision>(DEFAULT_NIL_INPUT.division);
  const [position, setPosition] = useState<NilPositionGroup>(DEFAULT_NIL_INPUT.position);
  const [stars, setStars] = useState<NilStarRating>(DEFAULT_NIL_INPUT.stars);
  const [followers, setFollowers] = useState(DEFAULT_NIL_INPUT.followers);
  const [engagementTenths, setEngagementTenths] = useState(DEFAULT_NIL_INPUT.engagementTenths);

  const divisionId = useId();
  const positionId = useId();
  const followersId = useId();
  const engagementId = useId();

  const valuation = useMemo(
    () =>
      estimateNilValuationCents({
        division,
        position,
        stars,
        followers,
        engagementTenths,
      }),
    [division, position, stars, followers, engagementTenths],
  );

  const engagementRate = engagementTenthsToPercent(engagementTenths);

  const onEstimateChangeRef = useRef(onEstimateChange);
  onEstimateChangeRef.current = onEstimateChange;

  useEffect(() => {
    onEstimateChangeRef.current?.({
      followers,
      engagementRate,
      stars,
      valuation,
    });
  }, [followers, engagementRate, stars, valuation]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
      <div className="flex-1 p-6 space-y-8 bg-slate-950">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <Calculator className="w-5 h-5 shrink-0 text-emerald-500" />
          <h2 className="text-xl font-bold text-slate-100 uppercase tracking-tight truncate">
            NIL Valuation Engine
          </h2>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor={divisionId}
                className="text-xs font-bold text-slate-400 uppercase tracking-wider"
              >
                Division Tier
              </label>
              <select
                id={divisionId}
                value={division}
                onChange={(event) => {
                  const next = event.target.value;
                  if (isNilMarketDivision(next)) setDivision(next);
                }}
                className="w-full min-h-[44px] bg-slate-900 border border-slate-800 rounded-lg px-3 text-slate-200 font-mono text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors appearance-none"
              >
                {DIVISION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor={positionId}
                className="text-xs font-bold text-slate-400 uppercase tracking-wider"
              >
                Position Group
              </label>
              <select
                id={positionId}
                value={position}
                onChange={(event) => {
                  const next = event.target.value;
                  if (isNilPositionGroup(next)) setPosition(next);
                }}
                className="w-full min-h-[44px] bg-slate-900 border border-slate-800 rounded-lg px-3 text-slate-200 font-mono text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors appearance-none"
              >
                {POSITION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">
              Recruit Star Rating
            </p>
            <div className="flex gap-2">
              {STAR_RATINGS.map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setStars(star)}
                  aria-pressed={stars === star}
                  className={`flex-1 min-h-[44px] rounded-lg border font-bold text-lg transition-colors ${
                    stars === star
                      ? "bg-amber-500/10 border-amber-500/50 text-amber-400"
                      : "bg-slate-900 border-slate-800 text-slate-600 hover:border-slate-700"
                  }`}
                >
                  {star}★
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-5 pt-4 border-t border-slate-800">
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <label
                  htmlFor={followersId}
                  className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5 shrink-0" /> Total Followers
                </label>
                <span className="font-mono text-emerald-400 font-bold">
                  {followers.toLocaleString()}
                </span>
              </div>
              <Slider
                id={followersId}
                min={0}
                max={500000}
                step={1000}
                value={[followers]}
                onValueChange={(value) => setFollowers(value[0] ?? 0)}
                aria-label="Total followers"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <label
                  htmlFor={engagementId}
                  className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"
                >
                  <TrendingUp className="w-3.5 h-3.5 shrink-0" /> Engagement Rate
                </label>
                <span className="font-mono text-emerald-400 font-bold">
                  {engagementRate.toFixed(1)}%
                </span>
              </div>
              <Slider
                id={engagementId}
                min={1}
                max={150}
                step={1}
                value={[engagementTenths]}
                onValueChange={(value) => setEngagementTenths(value[0] ?? 1)}
                aria-label="Engagement rate"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="md:w-72 bg-gradient-to-b from-emerald-950/20 to-slate-900 border-t md:border-t-0 md:border-l border-slate-800 p-6 flex flex-col justify-center relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="relative z-10 space-y-6">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
              Estimated Annual Value
            </p>
            <div className="flex items-start text-emerald-400">
              <DollarSign className="w-8 h-8 mt-1 shrink-0" />
              <span className="text-5xl font-black tracking-tighter truncate">
                {formatUsdFromCents(valuation.totalCents).replace("$", "")}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-slate-800/50">
            <div className="flex justify-between items-center text-sm gap-2">
              <span className="text-slate-400 font-mono truncate">Athletic Premium</span>
              <span className="text-slate-200 font-bold shrink-0">
                {formatUsdFromCents(valuation.athleticCents)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm gap-2">
              <span className="text-slate-400 font-mono truncate">Social Brand</span>
              <span className="text-slate-200 font-bold shrink-0">
                {formatUsdFromCents(valuation.socialCents)}
              </span>
            </div>
          </div>

          <div className="mt-8 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <p className="text-[10px] text-emerald-400/80 uppercase font-bold tracking-widest leading-relaxed text-center">
              Based on 2026 collegiate market data & active revenue-sharing baselines. Estimator
              only — not an escrow authorization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
