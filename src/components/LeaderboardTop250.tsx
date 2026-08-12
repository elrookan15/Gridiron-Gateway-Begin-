import React, { useState } from "react";
import { TopRecruit, Position, GradYear } from "../types";
import { MOCK_TOP_RECRUITS } from "../data/mockData";
import { Search, Filter, Flame, Clock, Trophy, ExternalLink, Play, Eye, ShieldCheck, CheckCircle2, ChevronRight, Calculator } from "lucide-react";

const POSITIONS: (Position | "ALL")[] = ["ALL", "QB", "WR", "OT", "EDGE", "DT", "LB", "CB", "S", "RB", "TE"];
const STATES = ["ALL", "TX", "GA", "FL", "CA", "MI", "NC", "TN", "MD", "OH", "MO"];
const CLASSES: GradYear[] = [2025, 2026, 2027];

export const LeaderboardTop250: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<GradYear>(2025);
  const [selectedPos, setSelectedPos] = useState<Position | "ALL">("ALL");
  const [selectedState, setSelectedState] = useState<string>("ALL");
  const [selectedStars, setSelectedStars] = useState<number | 0>(0); // 0 = all
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecruitModal, setSelectedRecruitModal] = useState<TopRecruit | null>(null);

  // Team Class Rankings Tool State
  const [showClassCalculator, setShowClassCalculator] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string>("Georgia");

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedRecruitModal) {
        setSelectedRecruitModal(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedRecruitModal]);

  const filteredRecruits = MOCK_TOP_RECRUITS.filter((rec) => {
    if (rec.gradClass !== selectedClass) return false;
    if (selectedPos !== "ALL" && rec.position !== selectedPos) return false;
    if (selectedState !== "ALL" && rec.state !== selectedState) return false;
    if (selectedStars > 0 && rec.starRating !== selectedStars) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        rec.fullName.toLowerCase().includes(q) ||
        rec.highSchool.toLowerCase().includes(q) ||
        rec.position.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate Team Class Rank mock points
  const teamCommits = MOCK_TOP_RECRUITS.filter((r) => r.committedTo?.toLowerCase().includes(selectedTeam.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-white space-y-8">
      {/* Page Title & Ticker */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/60 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Trophy className="w-3.5 h-3.5" /> Gateway / Gateway Scout Style Top 250 National Leaderboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Top 250 National Football Recruits
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Verified composite rankings, predictor engine commitment predictions, and college offer lists.
          </p>
        </div>

        {/* Signing Day Countdown Clock */}
        <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-4 text-center shrink-0">
          <Clock className="w-6 h-6 text-amber-400" />
          <div className="text-left">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Early Signing Day Clock</p>
            <p className="text-sm font-black text-amber-400 font-mono">128 Days • 14 Hours • 22 Mins</p>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recruit, school, state..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Class Year Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
            <span className="text-[11px] text-slate-400 font-bold px-2">Class:</span>
            {CLASSES.map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedClass(yr)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedClass === yr
                    ? "bg-emerald-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                '{yr.toString().slice(-2)}
              </button>
            ))}
          </div>

          {/* Star Filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => setSelectedStars(0)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                selectedStars === 0 ? "bg-slate-800 text-white" : "text-slate-400"
              }`}
            >
              All Stars
            </button>
            <button
              onClick={() => setSelectedStars(5)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold text-amber-300 ${
                selectedStars === 5 ? "bg-amber-500/20 border border-amber-500/40 text-amber-300" : "text-slate-400"
              }`}
            >
              5★ Only
            </button>
            <button
              onClick={() => setSelectedStars(4)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                selectedStars === 4 ? "bg-slate-800 text-amber-400" : "text-slate-400"
              }`}
            >
              4★ Only
            </button>
          </div>

          {/* Class Team Rankings Calculator Toggle */}
          <button
            onClick={() => setShowClassCalculator(!showClassCalculator)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-amber-500/30 transition-all w-full sm:w-auto justify-center"
          >
            <Calculator className="w-4 h-4 text-amber-400" />
            {showClassCalculator ? "Hide Class Rankings" : "Team Class Rankings"}
          </button>
        </div>

        {/* Position & State Filter Pills */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-1 overflow-x-auto w-full no-scrollbar pb-1">
            <span className="text-slate-500 font-bold shrink-0 mr-1">Position:</span>
            {POSITIONS.map((pos) => (
              <button
                key={pos}
                onClick={() => setSelectedPos(pos)}
                className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all ${
                  selectedPos === pos
                    ? "bg-emerald-500 text-slate-950"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {pos}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span className="text-slate-500 font-bold">State:</span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
            >
              {STATES.map((st) => (
                <option key={st} value={st}>{st === "ALL" ? "All States" : st}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* TEAM CLASS RANKINGS CALCULATOR MODAL / WIDGET */}
      {showClassCalculator && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" /> 2025-2026 Team Recruiting Class Calculator
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Select Program:</span>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-bold focus:outline-none"
              >
                <option value="Georgia">Georgia Bulldogs</option>
                <option value="Michigan">Michigan Wolverines</option>
                <option value="Oregon">Oregon Ducks</option>
                <option value="Ohio State">Ohio State Buckeyes</option>
                <option value="Colorado">Colorado Buffaloes</option>
                <option value="Alabama">Alabama Crimson Tide</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">National Class Rank</p>
              <p className="text-2xl font-black text-amber-400 mt-1">#2 Nationally</p>
            </div>

            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Total Commits</p>
              <p className="text-2xl font-black text-white mt-1">{teamCommits.length + 18} Commits</p>
            </div>

            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Avg Recruit Score</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">94.85 Composite</p>
            </div>
          </div>

          <p className="text-xs text-slate-400">Top Committed Prospects for {selectedTeam}:</p>
          <div className="flex flex-wrap gap-2">
            {teamCommits.map((c) => (
              <span key={c.id} className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-full text-xs font-bold text-white flex items-center gap-1.5">
                <span className="text-amber-400">{"★".repeat(c.starRating)}</span> {c.fullName} ({c.position})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* LEADERBOARD RECRUITS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecruits.length === 0 ? (
          <div className="col-span-full bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            No recruits matched your current filter criteria. Try resetting position or state filters.
          </div>
        ) : (
          filteredRecruits.map((rec) => (
            <div
              key={rec.id}
              className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 transition-all shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 flex flex-col justify-between group"
            >
              <div>
                {/* Header Row: Rank, Avatar & Composite */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-black text-xs text-emerald-400">
                      #{rec.rank}
                    </div>
                    <img
                      src={rec.avatarUrl}
                      alt={rec.fullName}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                    />
                    <div>
                      <h2 className="font-extrabold text-base text-white group-hover:text-emerald-400 transition-colors">
                        {rec.fullName}
                      </h2>
                      <p className="text-xs text-slate-400">
                        <strong className="text-amber-400">{rec.position}</strong> • {rec.highSchool} ({rec.state})
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex text-amber-400 text-xs">
                      {"★".repeat(rec.starRating)}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      Comp: <strong className="text-white">{rec.compositeScore}</strong>
                    </span>
                  </div>
                </div>

                {/* Physicals & Verified Coach Views Row */}
                <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-center text-xs mb-4">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-semibold">Ht / Wt</span>
                    <strong className="text-white">{rec.height} / {rec.weight}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-semibold">40-Dash</span>
                    <strong className="text-amber-400">{rec.fortyTime}s</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-semibold">GPA</span>
                    <strong className="text-emerald-400">{rec.gpa}</strong>
                  </div>
                </div>

                {/* Commitment Status & Crystal Ball Prediction Bar */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Commitment Status:</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      rec.commitmentStatus === "Committed"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-slate-800 text-slate-300"
                    }`}>
                      {rec.commitmentStatus === "Committed" ? `Committed to ${rec.committedTo}` : "Uncommitted"}
                    </span>
                  </div>

                  {/* Predictor Engine Predictions Visual */}
                  {rec.crystalBall && rec.crystalBall.length > 0 && (
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Predictor Engine Prediction</span>
                        <span className="font-bold text-white">{rec.crystalBall[0].school} ({rec.crystalBall[0].percentage}%)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden flex">
                        {rec.crystalBall.map((cb, idx) => (
                          <div
                            key={idx}
                            style={{ width: `${cb.percentage}%`, backgroundColor: cb.color }}
                            className="h-full"
                            title={`${cb.school}: ${cb.percentage}%`}
                          ></div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Top Offers Pills */}
                <div className="mb-4">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Recent Offers</span>
                  <div className="flex flex-wrap gap-1">
                    {rec.topOffers.slice(0, 4).map((off) => (
                      <span key={off} className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-semibold text-slate-300">
                        {off}
                      </span>
                    ))}
                    {rec.topOffers.length > 4 && (
                      <span className="px-1.5 py-0.5 bg-slate-950 text-[10px] text-slate-500 font-bold">
                        +{rec.topOffers.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" /> {rec.verifiedCoachViews} Coach Views
                </span>

                <button
                  onClick={() => setSelectedRecruitModal(rec)}
                  className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
                >
                  View Profile <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PLAYER DETAIL DRAWER MODAL */}
      {selectedRecruitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setSelectedRecruitModal(null)}>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedRecruitModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
            >
              ✕
            </button>

            <div className="flex items-center gap-4">
              <img
                src={selectedRecruitModal.avatarUrl}
                alt={selectedRecruitModal.fullName}
                className="w-16 h-16 rounded-2xl object-cover border border-slate-700"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-white">{selectedRecruitModal.fullName}</h2>
                  <span className="text-amber-400 text-sm">{"★".repeat(selectedRecruitModal.starRating)}</span>
                </div>
                <p className="text-xs text-slate-300">
                  #{selectedRecruitModal.rank} Ranked National Prospect • {selectedRecruitModal.position} • {selectedRecruitModal.highSchool} ({selectedRecruitModal.state})
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-center text-xs">
              <div>
                <span className="text-slate-500 block font-semibold">Height / Weight</span>
                <strong className="text-white text-sm">{selectedRecruitModal.height} / {selectedRecruitModal.weight} lbs</strong>
              </div>
              <div>
                <span className="text-slate-500 block font-semibold">40-Yard Dash</span>
                <strong className="text-amber-400 text-sm">{selectedRecruitModal.fortyTime}s</strong>
              </div>
              <div>
                <span className="text-slate-500 block font-semibold">Core GPA</span>
                <strong className="text-emerald-400 text-sm">{selectedRecruitModal.gpa}</strong>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Offers List</h3>
              <div className="flex flex-wrap gap-2">
                {selectedRecruitModal.topOffers.map((school) => (
                  <span key={school} className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-white">
                    {school}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <a
                href={selectedRecruitModal.hudlUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-slate-950 font-black text-xs rounded-xl"
              >
                <Play className="w-4 h-4 fill-slate-950" /> Watch Hudl Reel
              </a>

              <button
                onClick={() => setSelectedRecruitModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
