import React, { useCallback, useEffect, useMemo, useState } from "react";
import { GradYear, Position } from "../types";
import {
  fetchLeaderboardRecruits,
  fetchSchools,
  type LeaderboardRecruit,
} from "../services/schoolsApi";
import { isSupabaseConfigured } from "../lib/supabaseClient";
import type { DatabaseSchool } from "../types";
import {
  Search,
  Trophy,
  Clock,
  Eye,
  ChevronRight,
  Calculator,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Gauge,
  Brain,
} from "lucide-react";
import { AthleteProfileModal } from "./AthleteProfileModal";

const POSITIONS: (Position | "ALL")[] = [
  "ALL",
  "QB",
  "WR",
  "OT",
  "EDGE",
  "DT",
  "LB",
  "CB",
  "S",
  "RB",
  "TE",
  "ATH",
];
const CLASSES: GradYear[] = [2025, 2026, 2027];

type LoadState = "idle" | "loading" | "success" | "error";

function daysUntilEarlySigningDay(now = new Date()): string {
  // Early Signing Period typically opens mid-December — display countdown only.
  const target = new Date(Date.UTC(now.getUTCFullYear(), 11, 15, 12, 0, 0));
  if (now.getTime() > target.getTime()) {
    target.setUTCFullYear(target.getUTCFullYear() + 1);
  }
  const diffMs = target.getTime() - now.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diffMs / (1000 * 60)) % 60);
  return `${days} Days • ${hours} Hours • ${mins} Mins`;
}

function formatPhysicals(rec: LeaderboardRecruit): { htWt: string; forty: string; gpa: string } {
  return {
    htWt: rec.height !== "—" && rec.weight > 0 ? `${rec.height} / ${rec.weight}` : "Pending verify",
    forty: rec.fortyTime > 0 ? `${rec.fortyTime.toFixed(2)}s` : "—",
    gpa: rec.gpa > 0 ? rec.gpa.toFixed(2) : "—",
  };
}

export const LeaderboardTop250: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<GradYear>(2026);
  const [selectedPos, setSelectedPos] = useState<Position | "ALL">("ALL");
  const [selectedState, setSelectedState] = useState<string>("ALL");
  const [selectedStars, setSelectedStars] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [showClassCalculator, setShowClassCalculator] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string>("");

  const [recruits, setRecruits] = useState<LeaderboardRecruit[]>([]);
  const [schools, setSchools] = useState<DatabaseSchool[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [signingClock, setSigningClock] = useState(() => daysUntilEarlySigningDay());

  const loadLiveData = useCallback(async () => {
    setLoadState("loading");
    setErrorMessage(null);

    if (!isSupabaseConfigured()) {
      setLoadState("error");
      setErrorMessage(
        "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable live Top 250 data.",
      );
      setRecruits([]);
      setSchools([]);
      return;
    }

    try {
      const [leaderboard, programDirectory] = await Promise.all([
        fetchLeaderboardRecruits({ limit: 250 }),
        fetchSchools({ limit: 500 }),
      ]);
      setRecruits(leaderboard);
      setSchools(programDirectory);

      const defaultTeam =
        programDirectory.find((s) => s.tier === "FBS_POWER_4")?.institutionName ||
        programDirectory[0]?.institutionName ||
        "";
      setSelectedTeam((prev) => prev || defaultTeam);
      setLoadState("success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load leaderboard.";
      setErrorMessage(message);
      setLoadState("error");
      setRecruits([]);
    }
  }, []);

  useEffect(() => {
    void loadLiveData();
  }, [loadLiveData]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSigningClock(daysUntilEarlySigningDay());
    }, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const openAthleteModal = (athleteId: string) => {
    setSelectedAthleteId(athleteId);
    setIsModalOpen(true);
  };

  const closeAthleteModal = () => {
    setIsModalOpen(false);
    setSelectedAthleteId(null);
  };

  const stateOptions = useMemo(() => {
    const states = new Set<string>();
    recruits.forEach((r) => {
      if (r.state && r.state !== "N/A") states.add(r.state);
    });
    return ["ALL", ...Array.from(states).sort((a, b) => a.localeCompare(b))];
  }, [recruits]);

  const filteredRecruits = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return recruits.filter((rec) => {
      if (rec.gradClass !== selectedClass) return false;
      if (selectedPos !== "ALL" && rec.position !== selectedPos) return false;
      if (selectedState !== "ALL" && rec.state !== selectedState) return false;
      if (selectedStars > 0 && rec.starRating !== selectedStars) return false;
      if (!q) return true;
      return (
        rec.fullName.toLowerCase().includes(q) ||
        rec.highSchool.toLowerCase().includes(q) ||
        rec.position.toLowerCase().includes(q) ||
        rec.state.toLowerCase().includes(q)
      );
    });
  }, [recruits, selectedClass, selectedPos, selectedState, selectedStars, searchQuery]);

  const teamCommits = useMemo(() => {
    if (!selectedTeam) return [];
    const needle = selectedTeam.toLowerCase();
    return recruits.filter(
      (r) =>
        r.committedTo?.toLowerCase().includes(needle) ||
        r.topOffers.some((o) => o.toLowerCase().includes(needle)) ||
        r.crystalBall.some((cb) => cb.school.toLowerCase().includes(needle)),
    );
  }, [recruits, selectedTeam]);

  const avgComposite = useMemo(() => {
    if (teamCommits.length === 0) return 0;
    const sum = teamCommits.reduce((acc, r) => acc + r.compositeScore, 0);
    return Number((sum / teamCommits.length).toFixed(4));
  }, [teamCommits]);

  const fbsPrograms = useMemo(
    () =>
      schools
        .filter((s) => s.tier === "FBS_POWER_4" || s.tier === "FBS_GROUP_OF_5")
        .slice(0, 120),
    [schools],
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-white space-y-8">
      {/* Page Title & Ticker */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/60 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Trophy className="w-3.5 h-3.5 shrink-0" /> Gateway Scout Top 250 National Leaderboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Top 250 National Football Recruits
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Live rankings from verified TrueSpeed, Cognition, and star ratings — CFBD program affinity for offer signals.
          </p>
        </div>

        <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-4 text-center shrink-0 w-full md:w-auto">
          <Clock className="w-6 h-6 text-amber-400 shrink-0" />
          <div className="text-left min-w-0">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Early Signing Day Clock
            </p>
            <p className="text-sm font-black text-amber-400 font-mono truncate">{signingClock}</p>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recruit, state, position..."
              className="w-full min-h-[44px] bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto overflow-x-auto">
            <span className="text-[11px] text-slate-400 font-bold px-2 shrink-0">Class:</span>
            {CLASSES.map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => setSelectedClass(yr)}
                className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  selectedClass === yr
                    ? "bg-emerald-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                '{yr.toString().slice(-2)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto overflow-x-auto">
            <button
              type="button"
              onClick={() => setSelectedStars(0)}
              className={`min-h-[40px] px-2.5 py-1.5 rounded-lg text-xs font-bold shrink-0 ${
                selectedStars === 0 ? "bg-slate-800 text-white" : "text-slate-400"
              }`}
            >
              All Stars
            </button>
            <button
              type="button"
              onClick={() => setSelectedStars(5)}
              className={`min-h-[40px] px-2.5 py-1.5 rounded-lg text-xs font-bold text-amber-300 shrink-0 ${
                selectedStars === 5 ? "bg-amber-500/20 border border-amber-500/40" : "text-slate-400"
              }`}
            >
              5★ Only
            </button>
            <button
              type="button"
              onClick={() => setSelectedStars(4)}
              className={`min-h-[40px] px-2.5 py-1.5 rounded-lg text-xs font-bold shrink-0 ${
                selectedStars === 4 ? "bg-slate-800 text-amber-400" : "text-slate-400"
              }`}
            >
              4★ Only
            </button>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => void loadLiveData()}
              disabled={loadState === "loading"}
              className="flex items-center justify-center gap-2 min-h-[44px] px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex-1 sm:flex-none disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 shrink-0 ${loadState === "loading" ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => setShowClassCalculator((v) => !v)}
              className="flex items-center justify-center gap-2 min-h-[44px] px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-amber-500/30 transition-all flex-1 sm:flex-none"
            >
              <Calculator className="w-4 h-4 text-amber-400 shrink-0" />
              {showClassCalculator ? "Hide Class Rankings" : "Team Class Rankings"}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-1 overflow-x-auto w-full no-scrollbar pb-1">
            <span className="text-slate-500 font-bold shrink-0 mr-1">Position:</span>
            {POSITIONS.map((pos) => (
              <button
                key={pos}
                type="button"
                onClick={() => setSelectedPos(pos)}
                className={`min-h-[40px] px-2.5 py-1.5 rounded-lg font-bold shrink-0 transition-all ${
                  selectedPos === pos
                    ? "bg-emerald-500 text-slate-950"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {pos}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <span className="text-slate-500 font-bold">State:</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="min-h-[40px] flex-1 sm:flex-none bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
            >
              {stateOptions.map((st) => (
                <option key={st} value={st}>
                  {st === "ALL" ? "All States" : st}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* LOAD / ERROR */}
      {loadState === "loading" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 flex flex-col items-center justify-center gap-3 text-slate-300">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin shrink-0" />
          <p className="text-sm font-bold">Syncing live Top 250 from Supabase…</p>
          <p className="text-xs text-slate-500">Pulling athlete_profiles + CFBD schools directory</p>
        </div>
      )}

      {loadState === "error" && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <AlertTriangle className="w-8 h-8 text-rose-400 shrink-0" />
          <div className="min-w-0 flex-1">
            <h3 className="text-rose-300 font-bold text-sm">Leaderboard sync failed</h3>
            <p className="text-xs text-slate-300 mt-0.5 break-words">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => void loadLiveData()}
            className="min-h-[44px] px-4 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-bold border border-rose-500/40 shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* TEAM CLASS RANKINGS */}
      {showClassCalculator && loadState === "success" && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 border border-amber-500/40 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 min-w-0">
              <Trophy className="w-5 h-5 text-amber-400 shrink-0" /> Team Recruiting Class Calculator
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0">
              <span className="text-xs text-slate-400 shrink-0">Select Program:</span>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="min-h-[44px] w-full sm:max-w-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-bold focus:outline-none truncate"
              >
                {fbsPrograms.length === 0 ? (
                  <option value="">No CFBD programs synced</option>
                ) : (
                  fbsPrograms.map((s) => (
                    <option key={s.schoolId} value={s.institutionName}>
                      {s.institutionName}
                      {s.mascot ? ` ${s.mascot}` : ""}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Affinity Board Size</p>
              <p className="text-2xl font-black text-amber-400 mt-0.5">{teamCommits.length}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Prospect Matches</p>
              <p className="text-2xl font-black text-white mt-0.5">{teamCommits.length} Linked</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Avg Verified Composite</p>
              <p className="text-2xl font-black text-emerald-400 mt-0.5 font-mono">
                {avgComposite > 0 ? avgComposite.toFixed(4) : "—"}
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-400">Top linked prospects for {selectedTeam || "selected program"}:</p>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
            {teamCommits.length === 0 ? (
              <span className="text-xs text-slate-500">No offer/crystal affinity matches yet.</span>
            ) : (
              teamCommits.slice(0, 24).map((c) => (
                <span
                  key={c.id}
                  className="px-3 py-1.5 min-h-[40px] bg-slate-950 border border-slate-800 rounded-full text-xs font-bold text-white inline-flex items-center gap-1.5 max-w-full"
                >
                  <span className="text-amber-400 shrink-0">{"★".repeat(c.starRating)}</span>
                  <span className="truncate">
                    {c.fullName} ({c.position})
                  </span>
                </span>
              ))
            )}
          </div>
        </div>
      )}

      {/* LEADERBOARD GRID */}
      {loadState === "success" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredRecruits.length === 0 ? (
            <div className="col-span-full bg-slate-900/60 border border-slate-800 rounded-2xl p-10 sm:p-12 text-center text-slate-400">
              <p className="text-sm font-bold text-slate-300">No recruits matched your filters.</p>
              <p className="text-xs mt-0.5">
                Seed `athlete_profiles` or widen class / position / state filters.
              </p>
            </div>
          ) : (
            filteredRecruits.map((rec) => {
              const physicals = formatPhysicals(rec);
              return (
                <div
                  key={rec.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openAthleteModal(rec.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openAthleteModal(rec.id);
                    }
                  }}
                  className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 sm:p-5 transition-all shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 flex flex-col justify-between group cursor-pointer text-left"
                >
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-black text-xs text-emerald-400 shrink-0">
                          #{rec.rank}
                        </div>
                        <img
                          src={rec.avatarUrl}
                          alt={rec.fullName}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0 bg-slate-950"
                        />
                        <div className="min-w-0">
                          <h2 className="font-extrabold text-base text-white group-hover:text-emerald-400 transition-colors truncate">
                            {rec.fullName}
                          </h2>
                          <p className="text-xs text-slate-400 mt-0.5 truncate">
                            <strong className="text-amber-400">{rec.position}</strong> • {rec.state}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="flex justify-end text-amber-400 text-xs">
                          {"★".repeat(rec.starRating)}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          Comp: <strong className="text-white">{rec.compositeScore.toFixed(4)}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-center text-xs mb-4">
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-500 block font-semibold">Ht / Wt</span>
                        <strong className="text-white text-[11px] line-clamp-1">{physicals.htWt}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-semibold flex items-center justify-center gap-0.5">
                          <Gauge className="w-3 h-3 text-cyan-400 shrink-0" /> TrueSpeed
                        </span>
                        <strong className="text-cyan-400 font-mono">
                          {rec.trueSpeedMph != null ? `${rec.trueSpeedMph.toFixed(1)}` : "—"}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-semibold flex items-center justify-center gap-0.5">
                          <Brain className="w-3 h-3 text-purple-400 shrink-0" /> Cognition
                        </span>
                        <strong className="text-purple-400 font-mono">
                          {rec.cognitionScore != null ? rec.cognitionScore : "—"}
                        </strong>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-slate-400 font-medium shrink-0">Commitment:</span>
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[11px] truncate max-w-[60%] ${
                            rec.commitmentStatus === "Committed"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          {rec.commitmentStatus === "Committed"
                            ? `Committed to ${rec.committedTo}`
                            : "Uncommitted"}
                        </span>
                      </div>

                      {rec.crystalBall.length > 0 && (
                        <div>
                          <div className="flex justify-between gap-2 text-[10px] text-slate-400 mb-1">
                            <span className="shrink-0">Program Affinity</span>
                            <span className="font-bold text-white truncate">
                              {rec.crystalBall[0].school} ({rec.crystalBall[0].percentage}%)
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden flex">
                            {rec.crystalBall.map((cb) => (
                              <div
                                key={`${rec.id}-${cb.school}`}
                                style={{ width: `${cb.percentage}%`, backgroundColor: cb.color }}
                                className="h-full"
                                title={`${cb.school}: ${cb.percentage}%`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
                        State Affinity Offers
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {rec.topOffers.slice(0, 4).map((off) => (
                          <span
                            key={off}
                            className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-semibold text-slate-300 truncate max-w-[140px]"
                          >
                            {off}
                          </span>
                        ))}
                        {rec.topOffers.length > 4 && (
                          <span className="px-1.5 py-0.5 bg-slate-950 text-[10px] text-slate-500 font-bold">
                            +{rec.topOffers.length - 4}
                          </span>
                        )}
                        {rec.topOffers.length === 0 && (
                          <span className="text-[10px] text-slate-500">No CFBD programs in state</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs gap-2">
                    <span className="flex items-center gap-1 text-[11px] text-slate-400 min-w-0">
                      <Eye className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">Verified metrics board</span>
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openAthleteModal(rec.id);
                      }}
                      className="flex items-center gap-1 min-h-[44px] px-2 text-emerald-400 hover:text-emerald-300 font-bold transition-colors shrink-0"
                    >
                      View Profile <ChevronRight className="w-4 h-4 shrink-0" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <AthleteProfileModal
        isOpen={isModalOpen}
        athleteId={selectedAthleteId}
        onClose={closeAthleteModal}
      />
    </div>
  );
};
