import React, { useState } from "react";
import { CoachEndorsement, CollegeDivision } from "../types";
import { INITIAL_COACH_ENDORSEMENTS } from "../data/mockData";
import {
  ShieldCheck,
  Award,
  Sparkles,
  Plus,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  Building2,
  UserCheck,
  Zap,
} from "lucide-react";

interface EndorsementSectionProps {
  athleteName?: string;
  athleteId?: string;
}

export const EndorsementSection: React.FC<EndorsementSectionProps> = ({
  athleteName = "Caden 'Rocket' Carter",
}) => {
  const [endorsements, setEndorsements] = useState<CoachEndorsement[]>(
    INITIAL_COACH_ENDORSEMENTS
  );
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [showAddModal, setShowAddModal] = useState(false);

  // New endorsement form state
  const [coachName, setCoachName] = useState("");
  const [coachTitle, setCoachTitle] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [badge, setBadge] = useState<CoachEndorsement["badge"]>("Position Coach");
  const [relationship, setRelationship] = useState("");
  const [testimonialText, setTestimonialText] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  const totalBonusScore = endorsements.reduce((acc, curr) => acc + curr.scoreBonus, 0);

  const filteredEndorsements = endorsements.filter((item) => {
    if (activeFilter === "All") return true;
    return item.badge === activeFilter;
  });

  const handleAddEndorsement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coachName || !schoolName || !testimonialText) return;

    const newEndorsement: CoachEndorsement = {
      id: `end-${Date.now()}`,
      coachName,
      coachTitle: coachTitle || "Verified Scout / Coach",
      schoolName,
      division: "FBS",
      avatarUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      badge,
      relationship: relationship || "Camp Evaluator",
      text: testimonialText,
      date: "Just Now",
      scoreBonus: 20,
      verified: true,
    };

    setEndorsements([newEndorsement, ...endorsements]);
    setFormSuccess(true);
    setTimeout(() => {
      setFormSuccess(false);
      setShowAddModal(false);
      // reset form
      setCoachName("");
      setCoachTitle("");
      setSchoolName("");
      setRelationship("");
      setTestimonialText("");
    }, 1500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      {/* Header & Leaderboard Boost Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Verified Coach Endorsements
            </span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +{totalBonusScore} Leaderboard Points Boost
            </span>
          </div>
          <h2 className="text-lg font-extrabold text-white mt-1 flex items-center gap-2">
            Coach Testimonials & Verified Scout Evaluations
          </h2>
          <p className="text-xs text-slate-400">
            Official character and talent assessments from High School Head Coaches, Division I Staff & Rivals/Under Armour Analysts.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Add Coach Testimonial
        </button>
      </div>

      {/* Leaderboard Boost Explanation Banner */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-white text-xs">How Endorsements Boost Top 250 Leaderboard Rank</h4>
            <p className="text-[11px] text-slate-400">
              Verified endorsements add composite multiplier points, increasing athlete visibility to over 450+ Division I college recruiters.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 shrink-0">
          <div className="text-center">
            <span className="text-[10px] text-slate-500 block">Total Endorsements</span>
            <span className="font-extrabold text-white text-sm">{endorsements.length} Verified</span>
          </div>
          <div className="w-px h-6 bg-slate-800"></div>
          <div className="text-center">
            <span className="text-[10px] text-slate-500 block">Composite Boost</span>
            <span className="font-extrabold text-emerald-400 text-sm">+{totalBonusScore} pts</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          "All",
          "High School Head Coach",
          "Position Coach",
          "Scout Evaluator",
        ].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all text-xs whitespace-nowrap ${
              activeFilter === filter
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Endorsements List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEndorsements.map((item) => (
          <div
            key={item.id}
            className="bg-slate-950 p-5 rounded-2xl border border-slate-800/90 hover:border-amber-500/40 transition-all space-y-3.5 shadow-md flex flex-col justify-between"
          >
            <div>
              {/* Header Info */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={item.avatarUrl}
                    alt={item.coachName}
                    className="w-12 h-12 rounded-2xl border border-slate-700 object-cover shadow-inner"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-extrabold text-white text-sm">
                        {item.coachName}
                      </h3>
                      {item.verified && (
                        <ShieldCheck className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
                      )}
                    </div>
                    <p className="text-[11px] text-amber-400 font-medium">
                      {item.coachTitle}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {item.schoolName}
                    </p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase tracking-wider shrink-0">
                  +{item.scoreBonus} Leaderboard Pts
                </span>
              </div>

              {/* Endorsement Body Text */}
              <p className="text-slate-200 text-xs italic leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
                "{item.text}"
              </p>
            </div>

            {/* Footer Metadata */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-900">
              <span className="flex items-center gap-1 text-slate-400">
                <UserCheck className="w-3 h-3 text-cyan-400" /> Relationship: <strong className="text-slate-200">{item.relationship}</strong>
              </span>
              <span>{item.date}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ADD TESTIMONIAL MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" /> Add Verified Coach Endorsement
                </h3>
                <p className="text-xs text-slate-400">
                  Submit a scout evaluation or testimonial for {athleteName}.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white font-bold text-sm px-2"
              >
                ✕
              </button>
            </div>

            {formSuccess ? (
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/40 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="font-extrabold text-white text-sm">Endorsement Verified & Saved!</h4>
                <p className="text-xs text-slate-300">
                  +{20} Composite Points added to {athleteName}'s Top 250 Leaderboard score.
                </p>
              </div>
            ) : (
              <form onSubmit={handleAddEndorsement} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Coach / Scout Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={coachName}
                    onChange={(e) => setCoachName(e.target.value)}
                    placeholder="e.g. Coach Todd Dodge"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Staff Title
                    </label>
                    <input
                      type="text"
                      value={coachTitle}
                      onChange={(e) => setCoachTitle(e.target.value)}
                      placeholder="e.g. Offensive Coordinator"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      School / Organization *
                    </label>
                    <input
                      type="text"
                      required
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="e.g. Westlake HS / Rivals"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Coach Category
                    </label>
                    <select
                      value={badge}
                      onChange={(e) => setBadge(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-amber-500 focus:outline-none"
                    >
                      <option value="High School Head Coach">High School Head Coach</option>
                      <option value="Position Coach">Position Coach</option>
                      <option value="Scout Evaluator">Scout Evaluator</option>
                      <option value="Recruiting Coordinator">Recruiting Coordinator</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Relationship to Athlete
                    </label>
                    <input
                      type="text"
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      placeholder="e.g. Head Coach / QB Trainer"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Testimonial / Evaluation Assessment *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={testimonialText}
                    onChange={(e) => setTestimonialText(e.target.value)}
                    placeholder="Provide detailed observations regarding character, leadership, work ethic, film study, or physical athletic upside..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Submit & Boost Leaderboard
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
