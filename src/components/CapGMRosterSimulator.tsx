import React, { useState, useMemo } from "react";
import { CapGMRosterModel, RosterPlayerCapItem, Position } from "../types";
import { MOCK_105_PLAYER_ROSTER } from "../data/mockData";
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Users,
  ShieldCheck,
  Plus,
  Trash2,
  PieChart,
  ArrowUpRight,
  Sliders,
  Sparkles,
  Zap,
  BarChart3,
  Award,
} from "lucide-react";

const INITIAL_ROSTER_MODEL: CapGMRosterModel = {
  schoolId: "fbs-sec-texas",
  schoolName: "University of Texas Longhorns",
  totalSalaryCap: 20500000,
  totalAllocated: 17850000,
  remainingCapSpace: 2650000,
  projectedTeamWins: 10.4,
  spNationalRank: 4,
  budgets: [
    {
      category: "QB",
      allocatedAmount: 4800000,
      targetPercentage: 23.4,
      activePlayerCount: 4,
      avgCostPerPlayer: 1200000,
    },
    {
      category: "Skill (WR/RB/TE)",
      allocatedAmount: 5600000,
      targetPercentage: 27.3,
      activePlayerCount: 18,
      avgCostPerPlayer: 311111,
    },
    {
      category: "Trench (OL/DL/LB)",
      allocatedAmount: 5200000,
      targetPercentage: 25.3,
      activePlayerCount: 26,
      avgCostPerPlayer: 200000,
    },
    {
      category: "Secondary (CB/S)",
      allocatedAmount: 1850000,
      targetPercentage: 9.0,
      activePlayerCount: 14,
      avgCostPerPlayer: 132142,
    },
    {
      category: "Specialists",
      allocatedAmount: 400000,
      targetPercentage: 1.9,
      activePlayerCount: 4,
      avgCostPerPlayer: 100000,
    },
  ],
  players: [
    {
      id: "cap-p1",
      athleteName: "Derrick Vance Jr.",
      position: "QB",
      yearClass: "SO",
      nilCapValue: 2400000,
      spWinImpactScore: 2.45,
      epaPerPlayContribution: 0.32,
      retentionRiskLevel: "Low Risk",
      retentionRiskFactors: ["Starting QB", "High NIL Payout", "Multi-Year Contract"],
    },
    {
      id: "cap-p2",
      athleteName: "Malik Sanders",
      position: "WR",
      yearClass: "FR",
      nilCapValue: 1350000,
      spWinImpactScore: 1.62,
      epaPerPlayContribution: 0.21,
      retentionRiskLevel: "Low Risk",
      retentionRiskFactors: ["Freshman Starter", "Active Collective Deal"],
    },
    {
      id: "cap-p3",
      athleteName: "Brandon 'Tank' Miller",
      position: "DT",
      yearClass: "JR",
      nilCapValue: 980000,
      spWinImpactScore: 1.15,
      epaPerPlayContribution: 0.14,
      retentionRiskLevel: "Moderate Risk",
      retentionRiskFactors: ["Underpaid relative to P4 Market", "SEC Rivals Tampering Interest"],
    },
    {
      id: "cap-p4",
      athleteName: "Jackson Miller",
      position: "OT",
      yearClass: "SR",
      nilCapValue: 1100000,
      spWinImpactScore: 1.38,
      epaPerPlayContribution: 0.16,
      retentionRiskLevel: "Low Risk",
      retentionRiskFactors: ["NFL Draft Bound", "All-SEC Anchor"],
    },
    {
      id: "cap-p5",
      athleteName: "Tariq Lawson",
      position: "CB",
      yearClass: "JR",
      nilCapValue: 720000,
      spWinImpactScore: 0.88,
      epaPerPlayContribution: 0.09,
      retentionRiskLevel: "High Flight Risk",
      retentionRiskFactors: ["Splitting Snap Reps", "Offer Outlets Active", "Target Portal Transfer"],
    },
  ],
};

const MOCK_PORTAL_TARGETS: RosterPlayerCapItem[] = [
  {
    id: "target-1",
    athleteName: "Marcus Thorne",
    position: "RB",
    yearClass: "JR",
    nilCapValue: 850000,
    spWinImpactScore: 0.94,
    epaPerPlayContribution: 0.18,
    retentionRiskLevel: "Low Risk",
    retentionRiskFactors: ["Immediate RB1 Starter Fit"],
    isPortalTarget: true,
  },
  {
    id: "target-2",
    athleteName: "Treyvon Harris",
    position: "EDGE",
    yearClass: "SO",
    nilCapValue: 1150000,
    spWinImpactScore: 1.25,
    epaPerPlayContribution: 0.22,
    retentionRiskLevel: "Low Risk",
    retentionRiskFactors: ["Elite Pass Rusher (+12 Sacks)"],
    isPortalTarget: true,
  },
];

export const CapGMRosterSimulator: React.FC = () => {
  const [model, setModel] = useState<CapGMRosterModel>(INITIAL_ROSTER_MODEL);
  const [portalTargets, setPortalTargets] = useState<RosterPlayerCapItem[]>(MOCK_PORTAL_TARGETS);
  const [activeTab, setActiveTab] = useState<"roster" | "analytics" | "retention">("roster");
  const [is105RosterMode, setIs105RosterMode] = useState(false);

  const handleToggle105RosterMode = () => {
    if (!is105RosterMode) {
      setModel((prev) => ({
        ...prev,
        players: MOCK_105_PLAYER_ROSTER,
      }));
      setIs105RosterMode(true);
    } else {
      setModel(INITIAL_ROSTER_MODEL);
      setIs105RosterMode(false);
    }
  };

  // Format currency helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);
  };

  // Recalculate totals dynamically
  const totalAllocatedCalculated = useMemo(() => {
    return model.players.reduce((sum, p) => sum + p.nilCapValue, 0);
  }, [model.players]);

  const remainingCapCalculated = useMemo(() => {
    return model.totalSalaryCap - totalAllocatedCalculated;
  }, [model.totalSalaryCap, totalAllocatedCalculated]);

  const projectedTeamWinsCalculated = useMemo(() => {
    const baseWins = 6.0;
    const totalSpImpact = model.players.reduce((sum, p) => sum + p.spWinImpactScore, 0);
    return Number((baseWins + totalSpImpact).toFixed(1));
  }, [model.players]);

  // Add Portal Target to Roster
  const handleSignPortalTarget = (target: RosterPlayerCapItem) => {
    if (remainingCapCalculated < target.nilCapValue) {
      alert(`Insufficient Salary Cap space to sign ${target.athleteName} (${formatCurrency(target.nilCapValue)} required).`);
      return;
    }

    setModel((prev) => ({
      ...prev,
      players: [...prev.players, { ...target, isPortalTarget: false }],
    }));

    setPortalTargets((prev) => prev.filter((p) => p.id !== target.id));
  };

  // Release player from roster model
  const handleReleasePlayer = (id: string) => {
    setModel((prev) => ({
      ...prev,
      players: prev.players.filter((p) => p.id !== id),
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-white space-y-8">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/60 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <DollarSign className="w-3.5 h-3.5" /> General Manager Cap & SP+ Analytics Engine
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-2">
              Gateway CapGM Command Center
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Simulates $20.5M revenue sharing cap compliance, position budget allocations, and SP+ expected team wins for roster construction.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggle105RosterMode}
              className={`px-4 py-2.5 rounded-xl border text-xs font-black transition-all flex items-center gap-2 ${
                is105RosterMode
                  ? "bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20"
                  : "bg-slate-900 text-slate-300 border-slate-700 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{is105RosterMode ? "⚡ 105-Player Roster Active" : "Stress-Test 105-Player Roster"}</span>
            </button>
          </div>

          {/* Quick Metrics Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Hard Salary Cap</span>
              <span className="text-base font-black text-white font-mono">{formatCurrency(model.totalSalaryCap)}</span>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Remaining Cap Space</span>
              <span className={`text-base font-black font-mono ${remainingCapCalculated >= 0 ? "text-lime-400" : "text-red-400"}`}>
                {formatCurrency(remainingCapCalculated)}
              </span>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Projected SP+ Wins</span>
              <span className="text-base font-black text-amber-400 font-mono flex items-center justify-center gap-1">
                <TrendingUp className="w-4 h-4 text-amber-400" /> {projectedTeamWinsCalculated} <span className="text-[10px] text-slate-400 font-normal">Wins</span>
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Salary Cap Progress Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-slate-300">Cap Allocation Progress</span>
            <span className="text-lime-400 font-mono">
              {formatCurrency(totalAllocatedCalculated)} / {formatCurrency(model.totalSalaryCap)} (
              {Math.round((totalAllocatedCalculated / model.totalSalaryCap) * 100)}% Committed)
            </span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-3.5 p-0.5 border border-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(132,204,22,0.4)] ${
                remainingCapCalculated >= 0
                  ? "bg-gradient-to-r from-lime-500 to-emerald-400"
                  : "bg-gradient-to-r from-red-600 to-rose-500"
              }`}
              style={{ width: `${Math.min(100, Math.round((totalAllocatedCalculated / model.totalSalaryCap) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* NAVIGATION SUB-TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab("roster")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === "roster"
              ? "bg-emerald-500 text-slate-950 shadow-lg"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <Users className="w-4 h-4 shrink-0" /> Roster Cap Allocation ({model.players.length} Roster Players)
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === "analytics"
              ? "bg-emerald-500 text-slate-950 shadow-lg"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <BarChart3 className="w-4 h-4 shrink-0" /> SP+ & EPA Win Impact Calculator
        </button>

        <button
          onClick={() => setActiveTab("retention")}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            activeTab === "retention"
              ? "bg-emerald-500 text-slate-950 shadow-lg"
              : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" /> Transfer Portal Retention Risk Engine
        </button>
      </div>

      {/* TAB 1: ROSTER CAP ALLOCATION & PORTAL SIGNING */}
      {activeTab === "roster" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2/3): Active Cap Roster */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-400" /> Active Roster Contract Ledger
                </h2>
                <span className="text-xs text-slate-400">Position NIL Salary Cap Ledger</span>
              </div>

              <div className="space-y-3">
                {model.players.map((player) => (
                  <div
                    key={player.id}
                    className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-slate-700 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          {player.position}
                        </span>
                        <h3 className="font-extrabold text-sm text-white group-hover:text-emerald-400 transition-colors">
                          {player.athleteName}
                        </h3>
                        <span className="text-xs text-slate-500">({player.yearClass})</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                        <span>
                          SP+ Win Impact: <strong className="text-amber-400 font-mono">+{player.spWinImpactScore} Wins</strong>
                        </span>
                        <span>•</span>
                        <span>
                          EPA Contribution: <strong className="text-cyan-400 font-mono">+{player.epaPerPlayContribution}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block font-semibold uppercase">NIL Contract</span>
                        <span className="text-base font-black text-lime-400 font-mono">
                          {formatCurrency(player.nilCapValue)}
                        </span>
                      </div>

                      <button
                        onClick={() => handleReleasePlayer(player.id)}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-800 transition-all"
                        title="Release Player to Free Up Cap Space"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (1/3): Transfer Portal Targets Available to Sign */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-md font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" /> Transfer Portal Targets Available
              </h2>
              <p className="text-xs text-slate-400">
                Model real-time win impact before extending cap offers to portal transfers.
              </p>

              <div className="space-y-3">
                {portalTargets.map((target) => (
                  <div key={target.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          {target.position}
                        </span>
                        <h3 className="font-extrabold text-sm text-white mt-1">{target.athleteName}</h3>
                        <span className="text-xs text-slate-400">Class: {target.yearClass}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Asking Price</span>
                        <span className="text-sm font-black text-lime-400 font-mono">
                          {formatCurrency(target.nilCapValue)}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1">
                      <div className="flex justify-between">
                        <span>Projected Win Impact:</span>
                        <strong className="text-amber-400 font-mono">+{target.spWinImpactScore} Wins</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>EPA Per Play:</span>
                        <strong className="text-cyan-400 font-mono">+{target.epaPerPlayContribution}</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSignPortalTarget(target)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Sign Target to Roster Cap
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SP+ & EPA WIN IMPACT ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" /> SP+ & EPA Win Impact Roster Analytics
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Advanced football data engine mapping player NIL investment return against expected wins added.
              </p>
            </div>

            <div className="bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">National SP+ Rank</span>
              <span className="text-lg font-black text-amber-400 font-mono">#{model.spNationalRank} Power Rank</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {model.players.map((p) => (
              <div key={p.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-white text-base">{p.athleteName}</h3>
                    <span className="text-xs text-slate-400">{p.position} • {p.yearClass}</span>
                  </div>
                  <span className="text-sm font-black text-lime-400 font-mono">{formatCurrency(p.nilCapValue)}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">SP+ Win Contribution</span>
                    <span className="text-lg font-black text-amber-400 font-mono">+{p.spWinImpactScore} Wins</span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">EPA / Play Added</span>
                    <span className="text-lg font-black text-cyan-400 font-mono">+{p.epaPerPlayContribution}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: RETENTION RISK ENGINE */}
      {activeTab === "retention" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" /> Transfer Portal Retention Risk Engine
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Automated risk tracking flagging players susceptible to portal entry based on NIL valuation disparity & playing time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {model.players.map((p) => (
              <div
                key={p.id}
                className={`p-5 rounded-2xl border ${
                  p.retentionRiskLevel === "High Flight Risk"
                    ? "bg-rose-950/40 border-rose-500/50"
                    : p.retentionRiskLevel === "Moderate Risk"
                    ? "bg-amber-950/40 border-amber-500/50"
                    : "bg-slate-950 border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-extrabold text-white text-base">{p.athleteName}</h3>
                    <span className="text-xs text-slate-400">{p.position} • {p.yearClass}</span>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      p.retentionRiskLevel === "High Flight Risk"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/50"
                        : p.retentionRiskLevel === "Moderate Risk"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"
                    }`}
                  >
                    {p.retentionRiskLevel}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Retention Risk Factors:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {p.retentionRiskFactors.map((rf, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
                        ⚠️ {rf}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
