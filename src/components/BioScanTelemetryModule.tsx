import React, { useState, useEffect } from "react";
import { BioScanTelemetry } from "../types";
import { Activity, Zap, ShieldCheck, Heart, RefreshCw, Smartphone, Radio } from "lucide-react";

const MOCK_TELEMETRY: BioScanTelemetry[] = [
  {
    id: "bio-1",
    athleteName: "Derrick Vance Jr.",
    inGameMaxSprintMph: 22.8,
    accelerationRateMs2: 5.6,
    decelerationRateMs2: -6.4,
    playerLoadScore: 492.5,
    recoveryScorePercentage: 94,
    hardwareProvider: "Catapult Vector",
    lastSyncTimestamp: "Today at 2:15 PM (Post-Practice)",
  },
  {
    id: "bio-2",
    athleteName: "Malik Sanders",
    inGameMaxSprintMph: 23.1,
    accelerationRateMs2: 5.8,
    decelerationRateMs2: -6.8,
    playerLoadScore: 512.0,
    recoveryScorePercentage: 91,
    hardwareProvider: "WHOOP 4.0",
    lastSyncTimestamp: "Today at 1:45 PM",
  },
];

export const BioScanTelemetryModule: React.FC = () => {
  const [telemetryList, setTelemetryList] = useState<BioScanTelemetry[]>(MOCK_TELEMETRY);
  const [isSyncing, setIsSyncing] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    // Establish WebSocket egress stream
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/api/v1/bioscan/stream/bio-1`;
    let ws: WebSocket | null = null;

    try {
      ws = new WebSocket(wsUrl);
      ws.onopen = () => setWsConnected(true);
      ws.onclose = () => setWsConnected(false);
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.event === "TELEMETRY_UPDATE" && payload.data) {
            setTelemetryList((prev) =>
              prev.map((item) =>
                item.id === payload.data.athleteId || item.id === "bio-1"
                  ? {
                      ...item,
                      inGameMaxSprintMph: payload.data.currentSpeedMph || item.inGameMaxSprintMph,
                      playerLoadScore: payload.data.cumulativeLoad || item.playerLoadScore,
                      lastSyncTimestamp: "Just now (Live WS Stream)",
                    }
                  : item
              )
            );
          }
        } catch (e) {
          // JSON parse fallback
        }
      };
    } catch (err) {
      // WS connection fallback
    }

    return () => {
      ws?.close();
    };
  }, []);

  const handleSyncHardware = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-white space-y-8">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/60 border-2 border-teal-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Activity className="w-3.5 h-3.5" /> Wearable GPS & Telemetry Sync Hub
              {wsConnected && (
                <span className="ml-2 inline-flex items-center gap-1 text-emerald-400 font-mono text-[10px]">
                  <Radio className="w-3 h-3 animate-pulse" /> WS STREAM CONNECTED
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-2">
              Gateway BioScan Live Telemetry
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Syncs continuous in-game physical outputs, Catapult Vector GPS sprint velocities, acceleration rates, and physiological recovery scores.
            </p>
          </div>

          <button
            onClick={handleSyncHardware}
            disabled={isSyncing}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 font-black text-xs transition-all shadow-xl shadow-teal-500/20 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing Catapult / WHOOP API..." : "Sync Live Wearable Hardware"}
          </button>
        </div>
      </div>

      {/* TELEMETRY CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {telemetryList.map((item) => (
          <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 text-[10px] font-black uppercase">
                  {item.hardwareProvider}
                </span>
                <h3 className="font-extrabold text-white text-lg mt-1">{item.athleteName}</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">{item.lastSyncTimestamp}</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">In-Game Top Velocity</span>
                <span className="text-xl font-black text-cyan-300 font-mono mt-0.5 block">{item.inGameMaxSprintMph} MPH</span>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Acceleration Rate</span>
                <span className="text-xl font-black text-emerald-400 font-mono mt-0.5 block">{item.accelerationRateMs2} m/s²</span>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Total Player Load</span>
                <span className="text-xl font-black text-amber-400 font-mono mt-0.5 block">{item.playerLoadScore}</span>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Recovery Score</span>
                <span className="text-xl font-black text-lime-400 font-mono mt-0.5 block">{item.recoveryScorePercentage}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
