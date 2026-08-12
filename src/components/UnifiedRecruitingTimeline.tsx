import React from "react";
import { Award, ShieldCheck, Trophy, Eye, CheckCircle2, Flame, MapPin, Sparkles } from "lucide-react";
import { MOCK_TIMELINE_EVENTS } from "../data/mockData";
import { TimelineEvent } from "../types";

export const UnifiedRecruitingTimeline: React.FC = () => {
  const getEventIcon = (type: TimelineEvent["type"]) => {
    switch (type) {
      case "Offer":
        return <Award className="w-5 h-5 text-amber-400" />;
      case "Endorsement":
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case "Camp":
        return <Flame className="w-5 h-5 text-rose-400" />;
      case "Ranking":
        return <Trophy className="w-5 h-5 text-purple-400" />;
      case "CoachView":
        return <Eye className="w-5 h-5 text-sky-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            Unified Recruiting Activity Feed
          </h2>
          <p className="text-xs text-slate-400">
            Chronological audit trail of verified offers, camp milestones, ranking adjustments, and coach interactions.
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/20">
          5 Verified Events
        </span>
      </div>

      <div className="relative pl-6 border-l-2 border-slate-800 space-y-6">
        {MOCK_TIMELINE_EVENTS.map((event) => (
          <div key={event.id} className="relative group">
            {/* Timeline Dot */}
            <div className="absolute -left-[31px] top-1 w-6 h-6 rounded-full bg-slate-950 border-2 border-emerald-500/50 flex items-center justify-center group-hover:scale-110 group-hover:border-emerald-400 transition-all shadow-md">
              {getEventIcon(event.type)}
            </div>

            {/* Content Box */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm">{event.title}</h3>
                  <span className="px-2 py-0.5 rounded bg-slate-900 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                    {event.badgeText}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">{event.date}</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
