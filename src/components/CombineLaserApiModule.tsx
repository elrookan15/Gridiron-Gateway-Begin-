import React, { useCallback, useState } from "react";
import { VerifiedLaserCombineEntry } from "../types";
import { Zap, ShieldCheck, RefreshCw } from "lucide-react";

const SEED_ENTRIES: VerifiedLaserCombineEntry[] = [
  {
    eventId: "las-1",
    athleteId: "rec_derrick_vance",
    combineLocation: "Under Armour Next Regional Combine (Dallas, TX)",
    date: "June 14, 2026",
    laser40YardDash: 4.52,
    laser20YardShuttle: 4.12,
    laser3ConeDrill: 6.85,
    verticalJumpInches: 36.5,
    broadJumpInches: 124.0,
    verifiedBy: "Zybek Sports Laser Gate System",
  },
  {
    eventId: "las-2",
    athleteId: "rec_malik_sanders",
    combineLocation: "Nike EYBL Showcase (Buford, GA)",
    date: "June 18, 2026",
    laser40YardDash: 4.44,
    laser20YardShuttle: 4.05,
    laser3ConeDrill: 6.72,
    verticalJumpInches: 38.0,
    broadJumpInches: 128.5,
    verifiedBy: "Valdosta State Laser Hardware",
  },
];

export const CombineLaserApiModule: React.FC = () => {
  const [entries, setEntries] = useState<VerifiedLaserCombineEntry[]>(SEED_ENTRIES);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSyncLaserApi = useCallback(async () => {
    setIsSyncing(true);
    setError(null);
    try {
      const response = await fetch("/api/v1/combines/webhooks/laser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          athleteName: "Tariq Lawson",
          athleteId: "rec_tariq_lawson",
          combineEventName: "Rivals Combine Series (Atlanta, GA)",
          laserFortyTime: 4.48,
          laserShuttleTime: 4.09,
          laserThreeConeTime: 6.79,
          verticalJumpInches: 37.0,
          broadJumpInches: 126.0,
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        message?: string;
        id?: string;
        athleteName?: string;
        combineEventName?: string;
        laserFortyTime?: number;
        laserShuttleTime?: number;
        laserThreeConeTime?: number;
        verticalJumpInches?: number;
        broadJumpInches?: number;
        timestamp?: string;
      };
      if (!response.ok) {
        throw new Error(data.message || data.error || "Laser webhook ingestion failed.");
      }

      const ingested: VerifiedLaserCombineEntry = {
        eventId: data.id || `las-${Date.now()}`,
        athleteId: "rec_tariq_lawson",
        combineLocation: data.combineEventName || "Rivals Combine Series (Atlanta, GA)",
        date: data.timestamp || new Date().toISOString(),
        laser40YardDash: Number(data.laserFortyTime ?? 4.48),
        laser20YardShuttle: Number(data.laserShuttleTime ?? 4.09),
        laser3ConeDrill: Number(data.laserThreeConeTime ?? 6.79),
        verticalJumpInches: Number(data.verticalJumpInches ?? 37),
        broadJumpInches: Number(data.broadJumpInches ?? 126),
        verifiedBy: "⚡ Laser Verified Hardware Ingress",
      };
      setEntries((prev) => [ingested, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sync laser API.");
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-white space-y-8">
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/60 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Zap className="w-3.5 h-3.5 text-cyan-400" /> POST /api/v1/combines/webhooks/laser
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Verified Combine Laser API Hub
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Ingests laser-gate timings and attaches a ⚡ Laser Verified badge — replacing self-reported 40s, shuttles,
              and 3-cones.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSyncLaserApi}
            disabled={isSyncing}
            className="min-h-[44px] px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing Laser Hardware API..." : "Ingest Regional Combine Packet"}
          </button>
        </div>
        {error && (
          <div className="p-3 rounded-2xl border border-rose-500/40 text-rose-300 text-xs font-bold">{error}</div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {entries.map((entry) => (
          <div key={entry.eventId} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="min-w-0">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" /> ⚡ Laser Verified — {entry.verifiedBy}
                </span>
                <h3 className="font-extrabold text-white text-lg mt-1 truncate">{entry.athleteId}</h3>
                <p className="text-xs text-slate-400 truncate">{entry.combineLocation}</p>
              </div>
              <span className="text-[10px] text-slate-400 font-mono shrink-0">{entry.date}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Metric label="Laser 40-Dash" value={`${entry.laser40YardDash}s`} accent="text-cyan-300" />
              <Metric label="20-Yd Shuttle" value={`${entry.laser20YardShuttle}s`} accent="text-emerald-400" />
              <Metric label="3-Cone Drill" value={`${entry.laser3ConeDrill}s`} accent="text-amber-400" />
              <Metric label="Vertical" value={`${entry.verticalJumpInches}"`} accent="text-purple-300" />
              <Metric label="Broad Jump" value={`${entry.broadJumpInches}"`} accent="text-cyan-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function Metric({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
      <span className="text-[9px] text-slate-500 uppercase font-bold block">{label}</span>
      <span className={`text-base font-black font-mono mt-0.5 block ${accent}`}>{value}</span>
    </div>
  );
}
