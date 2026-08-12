import React, { useState } from "react";
import { FilmBreakdownSession, FilmTagItem } from "../types";
import { Film, Video, Sparkles, Filter, Play, ShieldCheck, CheckCircle2, Search, Download, Scissors } from "lucide-react";

const MOCK_FILM_SESSIONS: FilmBreakdownSession[] = [
  {
    sessionId: "film-101",
    athleteName: "Derrick Vance Jr.",
    reelTitle: "Senior Season State Championship & Midseason Tape",
    totalPlaysTagged: 14,
    coveragesDetected: ["Cover 3 Match", "Cover 2 Man", "Cover 4 Quarters"],
    routesDetected: ["Post-Corner", "Dig / In", "Go / Fly", "Slant"],
    tags: [
      {
        id: "tag-1",
        playNumber: 1,
        quarter: 1,
        downAndDistance: "1st & 10",
        playType: "Play Action Pass",
        coverageShell: "Cover 3 Match",
        routeRun: "Post-Corner",
        resultYardage: 42,
        videoTimestamp: "0:14",
        confidenceScore: 99.1,
      },
      {
        id: "tag-2",
        playNumber: 4,
        quarter: 2,
        downAndDistance: "3rd & 8 (Red Zone)",
        playType: "Scramble Drill",
        coverageShell: "Cover 2 Man",
        routeRun: "Slant",
        resultYardage: 18,
        videoTimestamp: "1:02",
        confidenceScore: 97.8,
      },
      {
        id: "tag-3",
        playNumber: 9,
        quarter: 3,
        downAndDistance: "2nd & 4",
        playType: "Zone Read",
        coverageShell: "Cover 4 Quarters",
        routeRun: "Out Stem",
        resultYardage: 26,
        videoTimestamp: "2:15",
        confidenceScore: 98.4,
      },
      {
        id: "tag-4",
        playNumber: 12,
        quarter: 4,
        downAndDistance: "3rd & 12",
        playType: "Play Action Pass",
        coverageShell: "Cover 1 Single High",
        routeRun: "Go / Fly",
        resultYardage: 54,
        videoTimestamp: "3:10",
        confidenceScore: 99.4,
      },
    ],
  },
];

export const AiFilmTaggingStudio: React.FC = () => {
  const [sessions] = useState<FilmBreakdownSession[]>(MOCK_FILM_SESSIONS);
  const [selectedSession] = useState<FilmBreakdownSession>(MOCK_FILM_SESSIONS[0]);
  const [selectedTag, setSelectedTag] = useState<FilmTagItem>(MOCK_FILM_SESSIONS[0].tags[0]);
  const [coverageFilter, setCoverageFilter] = useState<string>("ALL");
  const [routeFilter, setRouteFilter] = useState<string>("ALL");
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredTags = selectedSession.tags.filter((tag) => {
    const matchesCoverage = coverageFilter === "ALL" || tag.coverageShell === coverageFilter;
    const matchesRoute = routeFilter === "ALL" || tag.routeRun === routeFilter;
    return matchesCoverage && matchesRoute;
  });

  const handleRunAiAutoTag = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setToastMessage("⚡ Vision AI Auto-Tagged 4 New Film Clips!");
      setTimeout(() => setToastMessage(null), 3000);
    }, 1200);
  };

  const handleExportHighlightReel = () => {
    setToastMessage(`🎬 Exporting 60s Clipped Package (${filteredTags.length} Plays)...`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-white space-y-8">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border-2 border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Film className="w-3.5 h-3.5" /> AI Vision HUDL Play-by-Play Film Breakdown Studio
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-2">
              Gateway Vision AI Film Tagging
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Automated computer-vision play classification tagging defensive coverage shells, receiver route stems, play action concepts, and down & distance metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRunAiAutoTag}
              disabled={isProcessing}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-500 hover:from-indigo-500 hover:to-purple-400 text-white font-extrabold text-xs transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isProcessing ? "animate-spin" : ""}`} />
              {isProcessing ? "Analyzing Vision Frames..." : "Run AI Auto-Tag Diagnostic"}
            </button>

            <button
              onClick={handleExportHighlightReel}
              className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-300 font-bold text-xs transition-all flex items-center gap-2"
            >
              <Scissors className="w-4 h-4 text-indigo-400" />
              <span>Export 60s Reel</span>
            </button>
          </div>
        </div>

        {toastMessage && (
          <div className="p-3.5 bg-slate-950/90 border border-indigo-500/50 rounded-2xl text-indigo-200 text-xs font-bold flex items-center justify-between animate-fade-in">
            <span>{toastMessage}</span>
          </div>
        )}
      </div>

      {/* MAIN STUDIO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3): Video Player & Tagged Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Simulated HUDL Player */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] text-indigo-400 uppercase font-bold block">Selected Film Play</span>
                <h3 className="font-extrabold text-white text-lg">{selectedSession.athleteName} — Play #{selectedTag.playNumber} ({selectedTag.downAndDistance})</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-black">
                {selectedTag.confidenceScore}% Vision Confidence
              </span>
            </div>

            {/* Video Canvas Simulation */}
            <div className="relative aspect-video rounded-2xl bg-slate-950 border border-indigo-500/30 overflow-hidden flex items-center justify-center group shadow-2xl">
              <div className="absolute top-4 left-4 z-10 bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-xl text-xs space-y-0.5">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Detected Coverage Shell</span>
                <span className="text-emerald-400 font-extrabold font-mono">{selectedTag.coverageShell}</span>
              </div>

              <div className="absolute top-4 right-4 z-10 bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-xl text-xs space-y-0.5 text-right">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Receiver Route Package</span>
                <span className="text-purple-300 font-extrabold font-mono">{selectedTag.routeRun}</span>
              </div>

              <div className="text-center space-y-3 z-10">
                <div className="w-16 h-16 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white flex items-center justify-center mx-auto cursor-pointer shadow-xl transition-all scale-105">
                  <Play className="w-8 h-8 fill-white ml-1" />
                </div>
                <p className="text-xs text-slate-400 font-mono">Timestamp: {selectedTag.videoTimestamp} • Result: +{selectedTag.resultYardage} Yards</p>
              </div>

              <div className="absolute bottom-4 left-4 right-4 z-10 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-300 font-bold">Play Type: <strong className="text-amber-400">{selectedTag.playType}</strong></span>
                <span className="text-slate-400 font-mono">Q{selectedTag.quarter} • {selectedTag.downAndDistance}</span>
              </div>
            </div>
          </div>

          {/* Tagged Plays Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Tagged Plays Index ({filteredTags.length})
              </h3>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <select
                  value={coverageFilter}
                  onChange={(e) => setCoverageFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="ALL">All Coverages</option>
                  {selectedSession.coveragesDetected.map((cov) => (
                    <option key={cov} value={cov}>{cov}</option>
                  ))}
                </select>

                <select
                  value={routeFilter}
                  onChange={(e) => setRouteFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="ALL">All Routes</option>
                  {selectedSession.routesDetected.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              {filteredTags.map((tag) => (
                <div
                  key={tag.id}
                  onClick={() => setSelectedTag(tag)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-4 ${
                    selectedTag.id === tag.id
                      ? "bg-slate-950 border-indigo-500 shadow-md"
                      : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-mono font-black flex items-center justify-center">
                      #{tag.playNumber}
                    </span>
                    <div>
                      <h4 className="font-extrabold text-white text-xs">{tag.playType} — {tag.routeRun}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {tag.downAndDistance} • {tag.coverageShell}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-400 font-mono block">+{tag.resultYardage} YDS</span>
                    <span className="text-[9px] text-slate-500 font-mono">{tag.videoTimestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1/3): Breakdown Summary Statistics */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-slate-800 pb-3">
              Vision AI Analytics Summary
            </h3>

            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 font-bold block">Detected Defense Shells</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedSession.coveragesDetected.map((cov, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                      {cov}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 font-bold block">Route Run Diversity</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedSession.routesDetected.map((r, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-bold">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
