import React, { useEffect, useState } from "react";
import { SchemeFitScoutAlert } from "../types";
import { Bot, UserCheck, ChevronRight } from "lucide-react";

const SCHEMES: SchemeFitScoutAlert["matchedScheme"][] = [
  "Air Raid",
  "Spread Option",
  "West Coast",
  "3-4 Blitz",
  "Cover 3 Match",
];

const MOCK_ATHLETE_NAMES = [
  'DeAndre Jackson', 'Marcus Webb', 'Jaylen Booker',
  'Tyrese Hamilton', 'Darius Cole', 'Keon Marshall',
  'Jalen Pierce', 'Malik Thornton'
];

export const AutonomousScoutingAgent: React.FC = () => {
  const [alerts, setAlerts] = useState<SchemeFitScoutAlert[]>([
    {
      alertId: "alert-initial-01",
      athleteId: "rec_derrick_vance",
      athleteName: "Derrick Vance Jr.",
      confidenceScore: 98,
      matchedScheme: "Air Raid",
      keyMetrics: { trueSpeedMph: 22.4, cognitionScore: 98, laserShuttle: 4.12 },
      timestamp: new Date().toISOString(),
    },
    {
      alertId: "alert-initial-02",
      athleteId: "rec_malik_sanders",
      athleteName: "Malik Sanders",
      confidenceScore: 96,
      matchedScheme: "West Coast",
      keyMetrics: { trueSpeedMph: 22.8, cognitionScore: 94, laserShuttle: 4.05 },
      timestamp: new Date().toISOString(),
    },
  ]);
  const [dispatchedIds, setDispatchedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const toastTimerRef = React.useRef<number | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const matchedScheme = SCHEMES[Math.floor(Math.random() * SCHEMES.length)];
      const newAlert: SchemeFitScoutAlert = {
        alertId: `alert-${Date.now()}`,
        athleteId: `rec-2026-00${Math.floor(Math.random() * 90 + 10)}`,
        athleteName: MOCK_ATHLETE_NAMES[Math.floor(Math.random() * MOCK_ATHLETE_NAMES.length)],
        confidenceScore: Math.floor(Math.random() * 10 + 90),
        matchedScheme,
        keyMetrics: {
          trueSpeedMph: Number((Math.random() * 1.5 + 21.5).toFixed(1)),
          cognitionScore: Math.floor(Math.random() * 10 + 90),
          laserShuttle: Number((Math.random() * 0.3 + 3.9).toFixed(2)),
        },
        timestamp: new Date().toISOString(),
      };
      setAlerts((prev) => [newAlert, ...prev].slice(0, 5));
    }, 15000);
    return () => {
      window.clearInterval(timer);
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  const dispatchToPositionCoach = (alert: SchemeFitScoutAlert) => {
    setDispatchedIds((prev) => new Set(prev).add(alert.alertId));
    setToast(
      `Dossier dispatched to Position Coach workspace — ${alert.athleteName} × ${alert.matchedScheme} (${alert.confidenceScore}%).`
    );
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
              <Bot className="w-5 h-5 text-emerald-400" /> Autonomous Scouting Agent
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Continuously scans the Gateway Top 250 and Transfer Portal, matching TrueSpeed, S2 Cognition, and laser
              metrics against playbooks (Air Raid, Spread Option, West Coast, 3-4 Blitz, Cover 3 Match).
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-purple-400" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500" />
            </span>
            <span className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider">
              {isScanning ? "SCANNING PORTAL & LEADERBOARD" : "AGENT PAUSED"}
            </span>
          </div>
        </div>

        {toast && (
          <div className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 text-xs font-bold">
            {toast}
          </div>
        )}

        <div className="space-y-4 overflow-y-auto max-h-96 pr-2">
          {alerts.map((alert) => {
            const dispatched = dispatchedIds.has(alert.alertId);
            return (
              <div
                key={alert.alertId}
                className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col gap-4 hover:border-slate-700 transition-all"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-slate-100 truncate" title={alert.athleteName}>
                      {alert.athleteName}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2.5 py-1 text-xs font-mono font-bold bg-amber-400/10 text-amber-400 border border-amber-400/30 rounded-md uppercase">
                        {alert.matchedScheme} MATCH
                      </span>
                      <span className="px-2.5 py-1 text-xs font-mono font-bold bg-purple-400/10 text-purple-400 border border-purple-400/30 rounded-md uppercase">
                        {alert.confidenceScore}% CONFIDENCE
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full md:w-auto text-center">
                    <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                      <div className="text-[10px] text-slate-500 font-mono font-bold uppercase">TRUESPEED</div>
                      <div className="text-cyan-400 font-bold font-mono text-sm mt-0.5">
                        {alert.keyMetrics.trueSpeedMph} MPH
                      </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg">
                      <div className="text-[10px] text-slate-500 font-mono font-bold uppercase">COGNITION</div>
                      <div className="text-purple-400 font-bold font-mono text-sm mt-0.5">
                        {alert.keyMetrics.cognitionScore} S2
                      </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg col-span-2 md:col-span-1">
                      <div className="text-[10px] text-slate-500 font-mono font-bold uppercase">SHUTTLE</div>
                      <div className="text-emerald-400 font-bold font-mono text-sm mt-0.5">
                        {alert.keyMetrics.laserShuttle}s
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => dispatchToPositionCoach(alert)}
                  disabled={dispatched}
                  className="min-h-[44px] w-full md:w-auto md:self-end px-4 rounded-xl border border-slate-800 bg-slate-900 hover:border-emerald-500/50 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {dispatched ? (
                    <>
                      <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" /> Dispatched to Position Coach
                    </>
                  ) : (
                    <>
                      Drop Alert into Coach Workspace <ChevronRight className="w-4 h-4 shrink-0" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
