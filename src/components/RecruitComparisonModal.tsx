import React, { useState } from "react";
import { X, Trophy, Zap, Shield, GraduationCap, ArrowRight, CheckCircle2 } from "lucide-react";
import { TopRecruit } from "../types";
import { MOCK_TOP_RECRUITS } from "../data/mockData";

interface RecruitComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRecruits?: TopRecruit[];
}

export const RecruitComparisonModal: React.FC<RecruitComparisonModalProps> = ({
  isOpen,
  onClose,
  initialRecruits = [],
}) => {
  const [selectedRecruits, setSelectedRecruits] = useState<TopRecruit[]>(() => {
    if (initialRecruits.length > 0) return initialRecruits;
    return [MOCK_TOP_RECRUITS[0], MOCK_TOP_RECRUITS[1], MOCK_TOP_RECRUITS[2]];
  });

  if (!isOpen) return null;

  const handleAddRecruit = (recruit: TopRecruit) => {
    if (selectedRecruits.length < 4 && !selectedRecruits.some((r) => r.id === recruit.id)) {
      setSelectedRecruits([...selectedRecruits, recruit]);
    }
  };

  const handleRemoveRecruit = (id: string) => {
    if (selectedRecruits.length > 1) {
      setSelectedRecruits(selectedRecruits.filter((r) => r.id !== id));
    }
  };

  const availableRecruits = MOCK_TOP_RECRUITS.filter(
    (r) => !selectedRecruits.some((sr) => sr.id === r.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Recruit Side-by-Side Comparison Matrix
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                  {selectedRecruits.length}/4 Selected
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Cross-compare physical metrics, 40-times, composite scores, GPA, and offer lists.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add Recruit Selector Row */}
        {selectedRecruits.length < 4 && availableRecruits.length > 0 && (
          <div className="p-4 bg-slate-950/50 border-b border-slate-800/80 flex items-center gap-3 overflow-x-auto">
            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
              + Add Recruit to Matrix:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto">
              {availableRecruits.slice(0, 5).map((recruit) => (
                <button
                  key={recruit.id}
                  onClick={() => handleAddRecruit(recruit)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600/30 hover:border-emerald-500/50 border border-slate-700 text-xs font-medium text-slate-200 transition-all flex items-center gap-2 shrink-0"
                >
                  <span className="w-5 h-5 rounded-full bg-slate-700 font-bold flex items-center justify-center text-[10px] text-emerald-400">
                    #{recruit.rank}
                  </span>
                  <span>{recruit.fullName} ({recruit.position})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Matrix Grid */}
        <div className="p-6 overflow-x-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 min-w-[700px]">
            {selectedRecruits.map((recruit) => (
              <div
                key={recruit.id}
                className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative group hover:border-emerald-500/30 transition-all"
              >
                {selectedRecruits.length > 1 && (
                  <button
                    onClick={() => handleRemoveRecruit(recruit.id)}
                    className="absolute top-3 right-3 p-1 rounded-md bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-700 transition-colors"
                    title="Remove from comparison"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* Athlete Top Card */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={recruit.avatarUrl}
                      alt={recruit.fullName}
                      className="w-14 h-14 rounded-xl object-cover border border-emerald-500/30 shadow-md"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                          #{recruit.rank}
                        </span>
                        <span className="text-xs font-bold text-amber-400">
                          {"★".repeat(recruit.starRating)}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-base leading-tight mt-0.5">
                        {recruit.fullName}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {recruit.position} • {recruit.highSchool} ({recruit.state})
                      </p>
                    </div>
                  </div>

                  {/* Key Metric Badges */}
                  <div className="space-y-3 font-sans">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                        Composite Rating
                      </div>
                      <div className="text-lg font-bold text-emerald-400 font-mono">
                        {recruit.compositeScore.toFixed(4)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="text-slate-400 text-[10px]">Height / Weight</div>
                        <div className="font-semibold text-white">
                          {recruit.height} / {recruit.weight} lbs
                        </div>
                      </div>

                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="text-slate-400 text-[10px]">40-Yard Dash</div>
                        <div className="font-semibold text-emerald-400 font-mono">
                          {recruit.fortyTime}s
                        </div>
                      </div>

                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="text-slate-400 text-[10px]">Core GPA</div>
                        <div className="font-semibold text-sky-400 font-mono">
                          {recruit.gpa.toFixed(2)}
                        </div>
                      </div>

                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="text-slate-400 text-[10px]">Coach Views</div>
                        <div className="font-semibold text-purple-400">
                          {recruit.verifiedCoachViews}
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="pt-2 border-t border-slate-800/80">
                      <div className="text-[11px] text-slate-400 mb-1">Commitment Status</div>
                      {recruit.committedTo ? (
                        <div className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Committed: {recruit.committedTo}
                        </div>
                      ) : (
                        <div className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                          Uncommitted High Target
                        </div>
                      )}
                    </div>

                    {/* Top Offers */}
                    <div className="pt-2">
                      <div className="text-[11px] text-slate-400 mb-1">Key Division I Offers</div>
                      <div className="flex flex-wrap gap-1">
                        {recruit.topOffers.map((offer, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px] font-medium border border-slate-800"
                          >
                            {offer}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hudl Reel Button */}
                <div className="mt-4 pt-3 border-t border-slate-800">
                  <a
                    href={recruit.hudlUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-emerald-600/20"
                  >
                    <span>Watch Hudl Film</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>* All stats are laser-verified or co-signed by official combine partners.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white font-semibold hover:bg-slate-700 transition-colors"
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
};
