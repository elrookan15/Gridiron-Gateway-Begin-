import React, { useState } from "react";
import { TrueSpeedAnalysis } from "../types";
import { Video, ShieldCheck, AlertTriangle, CheckCircle2, Zap, Eye, RefreshCw } from "lucide-react";

const MOCK_TRUESPEED_RECORDS: TrueSpeedAnalysis[] = [
  {
    id: "ts-1",
    athleteName: "Derrick Vance Jr.",
    videoTitle: "Senior Season Midseason Highlights (Games 1-5)",
    status: "Verified Authentic",
    detectedFps: 59.94,
    estimatedMaxMph: 22.4,
    yardLineCalibrationRatio: 1.0,
    framerateManipulationFound: false,
    trueSpeedConfidenceScore: 99.4,
  },
  {
    id: "ts-2",
    athleteName: "Malik Sanders",
    videoTitle: "State Championship 80-Yard TD Breakaway",
    status: "Verified Authentic",
    detectedFps: 60.0,
    estimatedMaxMph: 22.8,
    yardLineCalibrationRatio: 1.0,
    framerateManipulationFound: false,
    trueSpeedConfidenceScore: 98.8,
  },
  {
    id: "ts-3",
    athleteName: "Unverified Prospect Reel #44",
    videoTitle: "Unverified Hudl Highlight Clip",
    status: "Framerate Anomaly Detected",
    detectedFps: 42.15,
    estimatedMaxMph: 19.2,
    yardLineCalibrationRatio: 1.18,
    framerateManipulationFound: true,
    trueSpeedConfidenceScore: 45.0,
  },
];

export const TrueSpeedModule: React.FC = () => {
  const [records] = useState<TrueSpeedAnalysis[]>(MOCK_TRUESPEED_RECORDS);
  const [selectedRecord, setSelectedRecord] = useState<TrueSpeedAnalysis>(MOCK_TRUESPEED_RECORDS[0]);
  const [isScanning, setIsScanning] = useState(false);

  const handleScanVideo = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-white space-y-8">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-sky-950/60 border-2 border-sky-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Computer Vision Video Authenticator
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-2">
              Gateway TrueSpeed Engine
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Analyzes raw game film to detect AI video manipulation, framerate distortion, and yard-line scale anomalies while calculating objective on-field sprint velocity (MPH).
            </p>
          </div>

          <button
            onClick={handleScanVideo}
            disabled={isScanning}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-950 font-black text-xs transition-all shadow-xl shadow-sky-500/20 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? "animate-spin" : ""}`} />
            {isScanning ? "Scanning Frame Consistency..." : "Run Computer Vision Scanner"}
          </button>
        </div>
      </div>

      {/* VERIFICATION RECORDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {records.map((r) => (
          <div
            key={r.id}
            onClick={() => setSelectedRecord(r)}
            className={`bg-slate-900 border rounded-2xl p-5 shadow-xl cursor-pointer transition-all space-y-4 ${
              selectedRecord.id === r.id
                ? "border-sky-500 shadow-sky-500/10 scale-102"
                : "border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                  r.status === "Verified Authentic"
                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                    : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                }`}
              >
                {r.status === "Verified Authentic" ? <CheckCircle2 className="w-3 h-3 text-sky-400" /> : <AlertTriangle className="w-3 h-3 text-rose-400" />}
                {r.status}
              </span>

              <span className="font-mono text-xs text-slate-400 font-bold">{r.detectedFps} FPS</span>
            </div>

            <div>
              <h3 className="font-extrabold text-white text-base">{r.athleteName}</h3>
              <p className="text-xs text-slate-400 font-medium leading-snug mt-0.5">{r.videoTitle}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[9px] text-slate-500 uppercase font-bold block">TrueSpeed Velocity</span>
                <span className="text-sm font-black text-sky-300 font-mono">{r.estimatedMaxMph} MPH</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[9px] text-slate-500 uppercase font-bold block">Confidence</span>
                <span className="text-sm font-black text-emerald-400 font-mono">{r.trueSpeedConfidenceScore}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
