import React, { useState } from "react";
import { VerifiedLaserCombineEntry } from "../types";
import { Zap, ShieldCheck, Award, RefreshCw, CheckCircle2, Flame } from "lucide-react";

const MOCK_LASER_ENTRIES: VerifiedLaserCombineEntry[] = [
  {
    id: "las-1",
    athleteName: "Derrick Vance Jr.",
    combineEventName: "Under Armour Next Regional Combine (Dallas, TX)",
    laserFortyTime: 4.52,
    laserShuttleTime: 4.12,
    laserThreeConeTime: 6.85,
    verticalJumpInches: 36.5,
    broadJumpInches: 124.0,
    verificationStatus: "⚡ Laser Verified",
    timestamp: "June 14, 2026",
  },
  {
    id: "las-2",
    athleteName: "Malik Sanders",
    combineEventName: "Nike EYBL Showcase (Buford, GA)",
    laserFortyTime: 4.44,
    laserShuttleTime: 4.05,
    laserThreeConeTime: 6.72,
    verticalJumpInches: 38.0,
    broadJumpInches: 128.5,
    verificationStatus: "⚡ Laser Verified",
    timestamp: "June 18, 2026",
  },
];

export const CombineLaserApiModule: React.FC = () => {
  const [entries] = useState<VerifiedLaserCombineEntry[]>(MOCK_LASER_ENTRIES);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncLaserApi = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-white space-y-8">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/60 border-2 border-sky-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Zap className="w-3.5 h-3.5 text-sky-400" /> Regional Combine Laser Timing Ingestion API
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-2">
              Verified Combine Laser API Hub
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Pulls laser-gate timing telemetry (40-yard dash, 20-yard shuttle, 3-cone drill) directly from regional showcases and combine events to replace self-reported metrics.
            </p>
          </div>

          <button
            onClick={handleSyncLaserApi}
            disabled={isSyncing}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-950 font-black text-xs transition-all shadow-xl shadow-sky-500/20 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing Laser Hardware API..." : "Sync Regional Combine API"}
          </button>
        </div>
      </div>

      {/* VERIFIED LASER LEADERBOARD CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {entries.map((entry) => (
          <div key={entry.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-sky-400" /> {entry.verificationStatus}
                </span>
                <h3 className="font-extrabold text-white text-lg mt-1">{entry.athleteName}</h3>
                <p className="text-xs text-slate-400">{entry.combineEventName}</p>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">{entry.timestamp}</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                <span className="text-[9px] text-slate-500 uppercase font-bold block">Laser 40-Dash</span>
                <span className="text-base font-black text-sky-300 font-mono mt-0.5 block">{entry.laserFortyTime}s</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                <span className="text-[9px] text-slate-500 uppercase font-bold block">20-Yd Shuttle</span>
                <span className="text-base font-black text-emerald-400 font-mono mt-0.5 block">{entry.laserShuttleTime}s</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                <span className="text-[9px] text-slate-500 uppercase font-bold block">3-Cone Drill</span>
                <span className="text-base font-black text-amber-400 font-mono mt-0.5 block">{entry.laserThreeConeTime}s</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
