import React, { useMemo, useState } from "react";
import { AlertTriangle, DollarSign, Lock, PieChart, ShieldCheck, TrendingUp, Unlock } from "lucide-react";

import { Slider } from "./ui/slider";
import {
  CAP_ALLOCATION_STEP_DOLLARS,
  allocatedCentsToSliderDollars,
  computeCapGmState,
  dollarsToAllocatedCents,
  formatCapCents,
  formatCapUsagePercent,
  isPlayerCriticallyUnderfunded,
  maxAllocationDollars,
} from "../lib/capGmMath";
import { CAP_GM_HARD_CAP_CENTS, type CapGmPlayer, type RetentionRiskLevel } from "../types";

const SEED_ROSTER: CapGmPlayer[] = [
  {
    id: "p-1",
    name: "Elijah Woods",
    position: "QB",
    starRating: 5,
    marketValueCents: 250_000_000,
    allocatedCents: 250_000_000,
    baseEpa: 7.2,
    isRetained: true,
    notes: "Franchise anchor. Market rate required to prevent portal entry.",
  },
  {
    id: "p-2",
    name: "Marcus Johnson",
    position: "WR",
    starRating: 4,
    marketValueCents: 120_000_000,
    allocatedCents: 90_000_000,
    baseEpa: 4.8,
    isRetained: true,
    notes: "Elite X-Receiver. Lethal post-corner route execution commands high EPA.",
  },
  {
    id: "p-3",
    name: "David Chen",
    position: "EDGE",
    starRating: 4,
    marketValueCents: 150_000_000,
    allocatedCents: 150_000_000,
    baseEpa: 5.5,
    isRetained: true,
    notes: "Premium pass rusher. Fully funded.",
  },
  {
    id: "p-4",
    name: "Tyrell Davies",
    position: "LT",
    starRating: 3,
    marketValueCents: 80_000_000,
    allocatedCents: 40_000_000,
    baseEpa: 2.1,
    isRetained: true,
    notes: "Undervalued blindside protector. High flight risk at current allocation.",
  },
];

function getRiskBadge(risk: RetentionRiskLevel) {
  if (risk === "LOW") {
    return (
      <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded text-[10px] font-bold">
        Stable
      </span>
    );
  }
  if (risk === "MODERATE") {
    return (
      <span className="text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded text-[10px] font-bold">
        Monitor
      </span>
    );
  }
  if (risk === "HIGH") {
    return (
      <span className="text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded text-[10px] font-bold">
        High Risk
      </span>
    );
  }
  return (
    <span className="text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded text-[10px] font-bold animate-pulse">
      Critical Flight Risk
    </span>
  );
}

export const CapGMRosterSimulator: React.FC = () => {
  const [roster, setRoster] = useState<CapGmPlayer[]>(SEED_ROSTER);

  const metrics = useMemo(() => computeCapGmState(roster, CAP_GM_HARD_CAP_CENTS), [roster]);

  const updateAllocation = (id: string, newDollars: number) => {
    const allocatedCents = dollarsToAllocatedCents(newDollars);
    setRoster((prev) => prev.map((player) => (player.id === id ? { ...player, allocatedCents } : player)));
  };

  const toggleRetention = (id: string) => {
    setRoster((prev) =>
      prev.map((player) => (player.id === id ? { ...player, isRetained: !player.isRetained } : player)),
    );
  };

  const overCap = metrics.remainingCents < 0;
  const usageBarTenths = Math.min(1000, Math.max(0, Math.floor((metrics.allocatedCents * 1000) / CAP_GM_HARD_CAP_CENTS)));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col xl:flex-row min-h-[700px]">
      <div className="xl:w-96 bg-slate-950 p-6 border-b xl:border-b-0 xl:border-r border-slate-800 flex flex-col gap-8">
        <div>
          <h2 className="text-xl font-black text-slate-100 uppercase tracking-tight flex items-center gap-2">
            <PieChart className="w-5 h-5 shrink-0 text-cyan-400" />
            CapGM Simulator
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">House v. NCAA $20.5M Revenue Share Engine</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cap Utilization</span>
              <span className={`font-mono font-bold ${overCap ? "text-rose-400" : "text-emerald-400"}`}>
                {formatCapUsagePercent(metrics.allocatedCents, CAP_GM_HARD_CAP_CENTS)}
              </span>
            </div>
            <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-500 ${overCap ? "bg-rose-500" : "bg-cyan-500"}`}
                style={{ width: `${usageBarTenths / 10}%` }}
              />
            </div>
            {overCap && (
              <p className="text-[10px] text-rose-400 font-mono flex items-center gap-1 mt-0.5">
                <AlertTriangle className="w-3 h-3 shrink-0" /> Over hard cap limit.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Allocated</span>
              <span className="text-lg font-black text-slate-100 tracking-tighter tabular-nums">
                {formatCapCents(metrics.allocatedCents)}
              </span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Remaining</span>
              <span
                className={`text-lg font-black tracking-tighter tabular-nums ${overCap ? "text-rose-500" : "text-emerald-500"}`}
              >
                {formatCapCents(metrics.remainingCents)}
              </span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 shrink-0 text-cyan-400" /> Projected EPA
              </span>
              <span className="text-xl font-black text-slate-100 tabular-nums">+{metrics.projectedEpa.toFixed(1)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" /> Roster Risk
              </span>
              {getRiskBadge(metrics.globalRetentionRisk)}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-slate-900 p-6 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 shrink-0" /> Active Allocation Ledger
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 max-h-[70vh]">
          {roster.map((player) => {
            const isCritical = isPlayerCriticallyUnderfunded(player);
            const maxDollars = maxAllocationDollars(player.marketValueCents);

            return (
              <div
                key={player.id}
                className={`bg-slate-950 border rounded-xl p-4 transition-colors ${
                  !player.isRetained
                    ? "border-slate-800 opacity-50"
                    : isCritical
                      ? "border-rose-500/30 hover:border-rose-500/50"
                      : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3 min-w-0 md:min-w-[200px]">
                    <button
                      type="button"
                      onClick={() => toggleRetention(player.id)}
                      aria-label={player.isRetained ? `Release ${player.name}` : `Retain ${player.name}`}
                      className={`min-h-[44px] min-w-[44px] shrink-0 flex items-center justify-center rounded-lg border transition-colors ${
                        player.isRetained
                          ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                          : "bg-slate-900 border-slate-700 text-slate-500"
                      }`}
                    >
                      {player.isRetained ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>
                    <div className="min-w-0">
                      <h4 className="text-sm font-black text-slate-100 uppercase tracking-tight flex items-center gap-2 min-w-0">
                        <span className="shrink-0">{player.position}</span>
                        <span className="text-slate-600">•</span>
                        <span className="truncate">{player.name}</span>
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-amber-400 tracking-widest shrink-0">
                          {"★".repeat(player.starRating)}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono truncate">
                          FMV: {formatCapCents(player.marketValueCents)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 max-w-md min-w-0">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cap Hit</span>
                      <span
                        className={`font-mono font-bold text-sm tabular-nums ${
                          !player.isRetained ? "text-slate-500" : isCritical ? "text-rose-400" : "text-emerald-400"
                        }`}
                      >
                        {formatCapCents(player.allocatedCents)}
                      </span>
                    </div>
                    <Slider
                      min={0}
                      max={maxDollars}
                      step={CAP_ALLOCATION_STEP_DOLLARS}
                      value={[allocatedCentsToSliderDollars(player.allocatedCents)]}
                      onValueChange={(values) => updateAllocation(player.id, values[0] ?? 0)}
                      disabled={!player.isRetained}
                      aria-label={`${player.name} allocation in dollars`}
                    />
                  </div>

                  <div className="shrink-0 text-right min-w-[60px] hidden sm:block">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">EPA</span>
                    <span className={`text-lg font-black tabular-nums ${player.isRetained ? "text-slate-200" : "text-slate-600"}`}>
                      {player.isRetained ? `+${player.baseEpa.toFixed(1)}` : "0.0"}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 font-mono leading-relaxed md:pl-[56px] border-t border-slate-800/50 pt-2">
                  {player.notes}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
