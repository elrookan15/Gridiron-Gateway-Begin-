import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Target, 
  ShieldAlert, 
  Sparkles, 
  Download, 
  Zap, 
  Layers, 
  CheckCircle2, 
  Loader2,
  ListOrdered
} from 'lucide-react';
import type { OpponentScoutingDossier } from '../types';

const MOCK_OPPONENTS: OpponentScoutingDossier[] = [
  {
    opponentId: 'opp-sec-georgia',
    opponentName: 'Georgia',
    opponentMascot: 'Bulldogs',
    conference: 'SEC',
    primaryColor: '#BA0C2F',
    defensiveBaseScheme: '3-4 / 4-2-5 Mint Front',
    blitzRateOverall: 42.5,
    filmSessionsAnalyzed: 14,
    tendencies: [
      {
        downAndDistance: '1st & 10 (Standard Downs)',
        preferredCoverage: 'Cover 3 Match',
        blitzFrequencyPercent: 24,
        vulnerableRoute: 'Play-Action Seam & Deep Post Stem',
        notes: 'Safeties sit at 12-yard depth. Susceptible to play-action freeze on boundary linebackers.'
      },
      {
        downAndDistance: '3rd & Medium (4-6 yds)',
        preferredCoverage: 'Cover 1 Press Man',
        blitzFrequencyPercent: 64,
        vulnerableRoute: 'Post-Corner & Rub Routes',
        notes: 'Aggressive Nickel blitz from slot. High man-press frequency on boundary receiver.'
      },
      {
        downAndDistance: '3rd & Long (7+ yds)',
        preferredCoverage: 'Cover 4 Quarters / Drop 8',
        blitzFrequencyPercent: 18,
        vulnerableRoute: 'Underneath Mesh & RB Checkdown',
        notes: 'Drops 8 defenders into coverage. Forces short checkdowns below line of gain.'
      }
    ],
    recommendedWristbandPlays: [
      {
        playNumber: 1,
        codeName: 'VIPER-99 POST-CORNER',
        personnelGroup: '11 Personnel (1 RB, 1 TE, 3 WR)',
        targetMatchup: 'Boundary Corner vs Cover 2 Trap',
        expectedSuccessRate: 88.4
      },
      {
        playNumber: 2,
        codeName: 'LIGHTNING-4 SWORD MESH',
        personnelGroup: '10 Personnel (0 RB, 4 WR)',
        targetMatchup: 'Slot Nickel Blitz vs 3rd & Medium',
        expectedSuccessRate: 82.1
      },
      {
        playNumber: 3,
        codeName: 'THUNDER-77 ZONE STRETCH PA',
        personnelGroup: '12 Personnel (2 TE, 2 WR)',
        targetMatchup: 'Boundary Linebacker Freeze vs Cover 3',
        expectedSuccessRate: 85.0
      },
      {
        playNumber: 4,
        codeName: 'COBRA-12 DRAW SCREEN',
        personnelGroup: '11 Personnel (1 RB, 1 TE, 3 WR)',
        targetMatchup: 'Drop 8 Coverage vs 3rd & Long',
        expectedSuccessRate: 79.5
      }
    ]
  },
  {
    opponentId: 'opp-bigten-ohio-state',
    opponentName: 'Ohio State',
    opponentMascot: 'Buckeyes',
    conference: 'Big Ten',
    primaryColor: '#BB0000',
    defensiveBaseScheme: '4-2-5 Over Front',
    blitzRateOverall: 38.0,
    filmSessionsAnalyzed: 12,
    tendencies: [
      {
        downAndDistance: '3rd & Short (1-3 yds)',
        preferredCoverage: 'Cover 0 Zero Blitz',
        blitzFrequencyPercent: 88,
        vulnerableRoute: 'Quick Slant & Fade/Stop Option',
        notes: 'Brings 7 pressure. Zero safety help over the top. Single coverage on outside.'
      },
      {
        downAndDistance: '2nd & Medium',
        preferredCoverage: 'Cover 2 Palms',
        blitzFrequencyPercent: 32,
        vulnerableRoute: 'High-Low Corner Route',
        notes: 'Cornerbacks read #2 receiver stem. Flaws in high-low flood route concepts.'
      }
    ],
    recommendedWristbandPlays: [
      {
        playNumber: 1,
        codeName: 'TITAN-11 QUICK SLANT ZERO',
        personnelGroup: '11 Personnel',
        targetMatchup: 'Zero Blitz vs 3rd & Short',
        expectedSuccessRate: 91.2
      },
      {
        playNumber: 2,
        codeName: 'FALCON-55 FLOOD CORNER',
        personnelGroup: '11 Personnel',
        targetMatchup: 'Cover 2 Palms High-Low',
        expectedSuccessRate: 84.0
      }
    ]
  }
];

export const AiGameplanGeneratorModule: React.FC = () => {
  const [selectedOpponentId, setSelectedOpponentId] = useState<string>(MOCK_OPPONENTS[0].opponentId);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'TENDENCIES' | 'WRISTBAND' | 'SCHEME_MATCHUP'>('TENDENCIES');
  const [exportedNotice, setExportedNotice] = useState(false);

  const activeOpponent = useMemo(() => {
    return MOCK_OPPONENTS.find(o => o.opponentId === selectedOpponentId) ?? MOCK_OPPONENTS[0];
  }, [selectedOpponentId]);

  const handleRunAiAnalysis = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 1200);
  };

  const handleExportCallSheet = () => {
    setExportedNotice(true);
    setTimeout(() => setExportedNotice(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Top Banner Header */}
      <div className="relative rounded-2xl bg-gradient-to-r from-purple-950 via-slate-900 to-slate-950 p-6 md:p-8 border border-purple-500/30 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <FileSpreadsheet className="w-64 h-64 text-purple-400 shrink-0" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/40">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            AI Computer Vision Gameplan Synthesizer • Film Studio Telemetry
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Weekly Opponent Gameplan & Call Sheet Generator
          </h1>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            Synthesizes raw computer vision film tags into opponent defensive tendency dossiers, scheme counter-strategies, and QB wristband call sheets.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-300 font-medium">
            <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{activeOpponent.filmSessionsAnalyzed} Film Sessions Analyzed</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Blitz Rate: {activeOpponent.blitzRateOverall}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Opponent Selector & AI Scan Action */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center shadow-lg">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">Target Opponent:</span>
          <select
            value={selectedOpponentId}
            onChange={(e) => setSelectedOpponentId(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs font-bold rounded-lg px-3 py-2 min-h-[44px] focus:outline-none focus:border-purple-500 w-full md:w-64 appearance-none"
          >
            {MOCK_OPPONENTS.map(opp => (
              <option key={opp.opponentId} value={opp.opponentId}>
                {opp.opponentName} ({opp.conference}) — {opp.defensiveBaseScheme}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={handleRunAiAnalysis}
            disabled={isGenerating}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 disabled:opacity-50 cursor-pointer w-full sm:w-auto"
          >
            {isGenerating ? (
              <><Loader2 className="w-4 h-4 animate-spin shrink-0" /> Synthesizing Film Tags...</>
            ) : (
              <><Sparkles className="w-4 h-4 shrink-0" /> Re-Scan Film Studio Tags</>
            )}
          </button>

          <button
            onClick={handleExportCallSheet}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 border border-slate-700 cursor-pointer w-full sm:w-auto shrink-0"
          >
            <Download className="w-4 h-4 shrink-0 text-cyan-400" /> Export Call Sheet PDF
          </button>
        </div>
      </div>

      {exportedNotice && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Call sheet PDF generated and dispatched to coaching staff wristband printer.</span>
        </div>
      )}

      {/* Main Tabs Header */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('TENDENCIES')}
          className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'TENDENCIES'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Target className="w-4 h-4 shrink-0" /> Defensive Tendencies ({activeOpponent.tendencies.length})
        </button>

        <button
          onClick={() => setActiveTab('WRISTBAND')}
          className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'WRISTBAND'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ListOrdered className="w-4 h-4 shrink-0" /> QB Wristband Card Index ({activeOpponent.recommendedWristbandPlays.length})
        </button>

        <button
          onClick={() => setActiveTab('SCHEME_MATCHUP')}
          className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'SCHEME_MATCHUP'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4 shrink-0" /> Scheme Breakdown
        </button>
      </div>

      {/* TAB 1: DEFENSIVE TENDENCIES */}
      {activeTab === 'TENDENCIES' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 min-h-[320px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white uppercase tracking-tight flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400 shrink-0" />
              Down & Distance Tendency Matrix — {activeOpponent.opponentName} {activeOpponent.opponentMascot}
            </h2>
            <span className="text-xs font-mono text-slate-400">Base: {activeOpponent.defensiveBaseScheme}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activeOpponent.tendencies.map((tendency, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3 hover:border-purple-500/40 transition-colors flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="px-2.5 py-1 bg-purple-500/10 text-purple-300 border border-purple-500/30 rounded text-[10px] font-bold uppercase tracking-wider inline-block">
                    {tendency.downAndDistance}
                  </span>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400 font-mono">Preferred Coverage:</p>
                    <p className="text-sm font-extrabold text-white">{tendency.preferredCoverage}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs text-slate-400 font-mono">Vulnerable Concept:</p>
                    <p className="text-xs font-bold text-cyan-400">{tendency.vulnerableRoute}</p>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed font-mono pt-2 border-t border-slate-900">
                    {tendency.notes}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-900 flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-500">Blitz Rate:</span>
                  <span className={`font-bold ${tendency.blitzFrequencyPercent > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {tendency.blitzFrequencyPercent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: QB WRISTBAND CARD INDEX */}
      {activeTab === 'WRISTBAND' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 min-h-[320px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white uppercase tracking-tight flex items-center gap-2">
              <ListOrdered className="w-5 h-5 text-cyan-400 shrink-0" />
              QB Wristband Play Call Index
            </h2>
            <span className="text-xs font-mono text-emerald-400 font-bold">Optimized for {activeOpponent.opponentName} Scheme</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeOpponent.recommendedWristbandPlays.map((play) => (
              <div key={play.playNumber} className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex items-start gap-4 hover:border-cyan-500/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-black text-lg shrink-0">
                  #{play.playNumber}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-black text-white truncate">{play.codeName}</h3>
                    <span className="text-xs font-mono font-bold text-emerald-400 shrink-0">
                      {play.expectedSuccessRate}% Success
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 font-mono">{play.personnelGroup}</p>
                  
                  <div className="pt-2 mt-2 border-t border-slate-900 flex justify-between items-center text-[11px] font-mono text-slate-400">
                    <span>Target Matchup:</span>
                    <span className="text-amber-400 font-bold truncate max-w-[200px]">{play.targetMatchup}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SCHEME BREAKDOWN */}
      {activeTab === 'SCHEME_MATCHUP' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 min-h-[320px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white uppercase tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400 shrink-0" />
              Defensive Alignment & Front Analysis
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-200 uppercase">Defensive Front Structure</h3>
              <p className="text-xs text-slate-400 font-mono leading-relaxed">
                {activeOpponent.opponentName} runs a primary <strong className="text-white">{activeOpponent.defensiveBaseScheme}</strong>. 
                Skeletal tracking indicates boundary linebackers step up into the A-gap on 68% of 3rd down passing plays.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-200 uppercase">Recommended Counter-Strategy</h3>
              <p className="text-xs text-slate-400 font-mono leading-relaxed">
                Utilize quick play-action motion out of 11/12 personnel to freeze the boundary linebacker before releasing the TE into the seam behind Cover 3 drop.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
