import React, { useState } from "react";
import { GridironLogo } from "./GridironLogo";
import { GraduationCap, ClipboardList, Flame, Landmark, Shield, Sparkles, Check, Copy, Download, Layers } from "lucide-react";

export const LogoBrandShowcase: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopySvg = () => {
    const svgContent = `<svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Gridiron Gateway Official Logo Emblem -->
      <ellipse cx="100" cy="100" rx="95" ry="95" fill="#10b981" opacity="0.15" />
      <path d="M 100 12 L 175 38 C 175 110 150 162 100 188 C 50 162 25 110 25 38 Z" fill="#020617" stroke="#fbbf24" stroke-width="6" stroke-linejoin="round"/>
      <!-- Playcall Sheet, Diploma, Football, Stadium Lights & Whistle -->
    </svg>`;
    navigator.clipboard.writeText(svgContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-8 shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Official Brand Identity & Logo
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Gridiron Gateway Emblem Analysis
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Custom vector emblem uniting collegiate academic achievement, coaching playbooks, athletic performance, and stadium recruiting energy.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySvg}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-700 transition-all flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            {copied ? "SVG Copied!" : "Copy Logo SVG"}
          </button>
        </div>
      </div>

      {/* Hero Logo Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Logo Card Stage */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950/60 rounded-3xl border border-emerald-500/30 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl group">
          {/* Background Ambient Stadium Lights */}
          <div className="absolute top-4 left-4 w-12 h-12 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />
          <div className="absolute top-4 right-4 w-12 h-12 bg-cyan-400/20 rounded-full blur-xl pointer-events-none" />
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-emerald-900/40 to-transparent pointer-events-none" />

          <div className="relative z-10 py-6 transform transition-transform duration-500 group-hover:scale-105">
            <GridironLogo size={180} />
          </div>

          <div className="relative z-10 mt-4 space-y-1">
            <h3 className="text-xl font-black tracking-tight text-white">GRIDIRON GATEWAY</h3>
            <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Academia • Playbooks • NCAA Compliance
            </p>
          </div>
        </div>

        {/* Breakdown of Logo Elements */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" /> Symbolic Component Breakdown
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Element 1: Diploma */}
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl hover:border-amber-500/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Collegiate Diploma & Ribbon</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Represents high school graduation, NCAA 16-Core Course qualification, and GPA eligibility.
                  </p>
                </div>
              </div>
            </div>

            {/* Element 2: Playcall Sheet */}
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Laminated Playcall Sheet</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Features X's & O's tactical play diagrams, highlighting film breakdown & coach playbooks.
                  </p>
                </div>
              </div>
            </div>

            {/* Element 3: Leather Football */}
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl hover:border-amber-600/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-600/10 border border-amber-600/30 text-amber-400 shrink-0">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Leather College Football</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Detailed with white laces and end stripes, representing raw athletic performance and Combine stats.
                  </p>
                </div>
              </div>
            </div>

            {/* Element 4: Stadium & Lights */}
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl hover:border-cyan-500/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Stadium Field & Floodlights</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Incorporates 50-yard line turf, goalposts, and illuminated stadium floodlights for game-day atmosphere.
                  </p>
                </div>
              </div>
            </div>

            {/* Element 5: Referee Whistle */}
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl hover:border-rose-500/40 transition-colors sm:col-span-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Referee Whistle & 5-Star Arch</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Symbolizes NCAA recruiting calendar compliance gating, fail-closed safety, and 5-Star prospect ranking excellence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
