import React, { useState } from "react";
import { CognitiveProfile } from "../types";
import { Brain, Zap, Target, ShieldCheck, Activity, Award, CheckCircle2, ChevronRight } from "lucide-react";

const MOCK_COGNITIVE_PROFILES: CognitiveProfile[] = [
  {
    id: "cog-1",
    athleteName: "Derrick Vance Jr.",
    overallScore: 98,
    perceptionSpeedMs: 112,
    trackingEfficiencyScore: 97,
    decisionSpeedUnderPressureMs: 98,
    tacticalSchemeMatches: [
      { schemeName: "Air Raid Pass Offense", matchPercentage: 99, suitabilityNotes: "Elite multi-field read progression under 1.2s blitz pressure." },
      { schemeName: "West Coast Pro Offense", matchPercentage: 96, suitabilityNotes: "Exceptional short-to-intermediate timing accuracy." },
      { schemeName: "Spread Option Offense", matchPercentage: 92, suitabilityNotes: "High mesh-point decision speed." },
    ],
    scoutEvaluationSummary: "Top 1% national S2-style cognitive rating. Processes complex coverage shells in under 120ms.",
  },
  {
    id: "cog-2",
    athleteName: "Malik Sanders",
    overallScore: 94,
    perceptionSpeedMs: 124,
    trackingEfficiencyScore: 96,
    decisionSpeedUnderPressureMs: 115,
    tacticalSchemeMatches: [
      { schemeName: "Spread Option Offense", matchPercentage: 97, suitabilityNotes: "Instant route-tree leverage recognition." },
      { schemeName: "Air Raid Pass Offense", matchPercentage: 94, suitabilityNotes: "Deep-ball tracking efficiency score 96/100." },
    ],
    scoutEvaluationSummary: "Elite visual tracking and fast dynamic spatial awareness during scramble drill transitions.",
  },
  {
    id: "cog-3",
    athleteName: "Tariq Lawson",
    overallScore: 96,
    perceptionSpeedMs: 118,
    trackingEfficiencyScore: 98,
    decisionSpeedUnderPressureMs: 104,
    tacticalSchemeMatches: [
      { schemeName: "Cover 3 Match Defense", matchPercentage: 98, suitabilityNotes: "First-step reaction time off receiver stem release is 0.08s." },
      { schemeName: "3-4 Zone Blitz Scheme", matchPercentage: 95, suitabilityNotes: "High pattern-matching instinct." },
    ],
    scoutEvaluationSummary: "Pro-grade defensive back processing speed. Anticipates route breaks before receiver foot plant.",
  },
];

export const CognitiveSchemeMatcher: React.FC = () => {
  const [profiles] = useState<CognitiveProfile[]>(MOCK_COGNITIVE_PROFILES);
  const [selectedProfile, setSelectedProfile] = useState<CognitiveProfile>(MOCK_COGNITIVE_PROFILES[0]);
  const [testInteractiveScore, setTestInteractiveScore] = useState<number | null>(null);
  const [isSimulatingTest, setIsSimulatingTest] = useState(false);

  const handleSimulateTest = () => {
    setIsSimulatingTest(true);
    setTimeout(() => {
      const generatedMs = Math.floor(Math.random() * 30) + 105;
      setTestInteractiveScore(generatedMs);
      setIsSimulatingTest(false);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-white space-y-8">
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950/60 border-2 border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Brain className="w-3.5 h-3.5" /> S2-Style Game-Speed Processing & Tactical Scheme Hub
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-2">
              Gateway Cognition Sports IQ Engine
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Evaluates millisecond perception speed, tracking efficiency, and decision time under pressure to match recruits to collegiate tactical schemes.
            </p>
          </div>

          <button
            onClick={handleSimulateTest}
            disabled={isSimulatingTest}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-extrabold text-xs transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
            {isSimulatingTest ? "Running 120ms Reaction Diagnostic..." : "Run Live Reaction Test Diagnostic"}
          </button>
        </div>

        {/* Live Test Diagnostic Result Pill */}
        {testInteractiveScore && (
          <div className="p-4 bg-slate-950/90 border border-purple-500/50 rounded-2xl text-purple-200 text-xs font-bold flex items-center justify-between animate-fade-in">
            <span>⚡ Interactive Decision Diagnostic Output:</span>
            <span className="font-mono text-emerald-400 font-extrabold text-sm">{testInteractiveScore} ms Perception Speed (Top 2% National Benchmark)</span>
          </div>
        )}
      </div>

      {/* COGNITIVE RECRUIT PROFILES SELECTOR & DETAILS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (1/3): Athlete Profile List */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <h2 className="text-sm font-black text-slate-300 uppercase tracking-wider">
              Evaluated Prospects ({profiles.length})
            </h2>

            {profiles.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedProfile(p)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedProfile.id === p.id
                    ? "bg-slate-950 border-purple-500/60 shadow-lg shadow-purple-500/10 scale-102"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-white text-sm">{p.athleteName}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono font-black">
                    {p.overallScore} S2 Score
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Perception: {p.perceptionSpeedMs}ms • Pressure: {p.decisionSpeedUnderPressureMs}ms
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (2/3): Selected Profile Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-black uppercase tracking-wider">
                  Cognitive Sports IQ Report
                </span>
                <h2 className="text-2xl font-black text-white mt-1">{selectedProfile.athleteName}</h2>
              </div>

              <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Overall Rating</span>
                  <span className="text-xl font-black text-purple-400 font-mono">{selectedProfile.overallScore} / 100</span>
                </div>
              </div>
            </div>

            {/* Processing Speed Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 font-bold block">Perception Speed</span>
                <span className="text-xl font-black text-emerald-400 font-mono mt-1 block">
                  {selectedProfile.perceptionSpeedMs} ms
                </span>
                <span className="text-[10px] text-slate-500">Top 1% Benchmark</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 font-bold block">Tracking Efficiency</span>
                <span className="text-xl font-black text-cyan-400 font-mono mt-1 block">
                  {selectedProfile.trackingEfficiencyScore} / 100
                </span>
                <span className="text-[10px] text-slate-500">Dynamic Spatial Vision</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 font-bold block">Blitz Pressure Speed</span>
                <span className="text-xl font-black text-amber-400 font-mono mt-1 block">
                  {selectedProfile.decisionSpeedUnderPressureMs} ms
                </span>
                <span className="text-[10px] text-slate-500">Under Chaos</span>
              </div>
            </div>

            {/* Scheme Compatibility Ratings */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" /> Program Tactical Scheme Match Ratings
              </h3>

              <div className="space-y-3">
                {selectedProfile.tacticalSchemeMatches.map((scheme, idx) => (
                  <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm text-white">{scheme.schemeName}</h4>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-black">
                        {scheme.matchPercentage}% Tactical Fit
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      💡 {scheme.suitabilityNotes}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Scout Evaluation Summary */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-purple-400 uppercase font-bold block">Scout Cognitive Summary</span>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                "{selectedProfile.scoutEvaluationSummary}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
