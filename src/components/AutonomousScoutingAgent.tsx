import React, { useState } from "react";
import { SchemeFitScoutAlert } from "../types";
import { Bot, Sparkles, Target, Zap, ShieldCheck, RefreshCw, Bell, UserCheck, ChevronRight } from "lucide-react";

const MOCK_SCOUT_ALERTS: SchemeFitScoutAlert[] = [
  {
    id: "alt-101",
    recruitId: "rec_derrick_vance",
    athleteName: "Derrick Vance Jr.",
    position: "QB",
    targetScheme: "Air Raid Pass Offense",
    matchPercentage: 99,
    keyMatchingFactors: ["TrueSpeed 22.4 MPH", "S2 Cognition 98/100", "42-Yd Post-Corner Release"],
    trueSpeedMph: 22.4,
    cognitionScore: 98,
    timestamp: "10 minutes ago",
  },
  {
    id: "alt-102",
    recruitId: "rec_malik_sanders",
    athleteName: "Malik Sanders",
    position: "WR",
    targetScheme: "West Coast Pro Offense",
    matchPercentage: 96,
    keyMatchingFactors: ["TrueSpeed 22.8 MPH", "S2 Cognition 94/100", "Instant Stem Break"],
    trueSpeedMph: 22.8,
    cognitionScore: 94,
    timestamp: "42 minutes ago",
  },
  {
    id: "alt-103",
    recruitId: "rec_tariq_lawson",
    athleteName: "Tariq Lawson",
    position: "CB",
    targetScheme: "Cover 3 Match Defense",
    matchPercentage: 98,
    keyMatchingFactors: ["TrueSpeed 22.1 MPH", "S2 Cognition 96/100", "0.08s First-Step Reaction"],
    trueSpeedMph: 22.1,
    cognitionScore: 96,
    timestamp: "2 hours ago",
  },
];

export const AutonomousScoutingAgent: React.FC = () => {
  const [alerts] = useState<SchemeFitScoutAlert[]>(MOCK_SCOUT_ALERTS);
  const [isScanning, setIsScanning] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleRunAgentScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setToastMessage("🤖 Autonomous Agent Scanned 250 Leaderboard Profiles & Portal Entries — 3 Matches Identified!");
      setTimeout(() => setToastMessage(null), 3500);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-white space-y-8">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/60 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Bot className="w-3.5 h-3.5 text-emerald-400" /> Background AI Scheme-Fit Agent
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-2">
              Autonomous Scheme-Fit Scouting Agent
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Background worker scanning Top 250 prospects and Transfer Portal entries, auto-matching biometrics, TrueSpeed velocity, and S2 Cognition processing scores with program playbooks.
            </p>
          </div>

          <button
            onClick={handleRunAgentScan}
            disabled={isScanning}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? "animate-spin" : ""}`} />
            {isScanning ? "Scanning Leaderboard & Portal..." : "Run Autonomous Agent Scan"}
          </button>
        </div>

        {toastMessage && (
          <div className="p-3.5 bg-slate-950/90 border border-emerald-500/50 rounded-2xl text-emerald-300 text-xs font-bold flex items-center justify-between animate-fade-in">
            <span>{toastMessage}</span>
          </div>
        )}
      </div>

      {/* MATCH ALERTS LIST */}
      <div className="space-y-4">
        <h2 className="text-sm font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Bell className="w-4 h-4 text-emerald-400" /> Proactive Scheme Match Alerts ({alerts.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {alerts.map((a) => (
            <div key={a.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase">
                    {a.position} Prospect
                  </span>
                  <h3 className="font-extrabold text-white text-lg mt-1">{a.athleteName}</h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{a.timestamp}</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Target Playbook Scheme</span>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-white">{a.targetScheme}</span>
                  <span className="text-sm font-black text-emerald-400 font-mono">{a.matchPercentage}% Fit</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Scouting Match Indicators:</span>
                {a.keyMatchingFactors.map((factor, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-slate-300 font-medium">
                    <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
