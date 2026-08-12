import React, { useState } from "react";
import { WeeklyHighlight, Position } from "../types";
import { INITIAL_TOP_HIGHLIGHTS } from "../data/mockData";
import {
  Flame,
  ThumbsUp,
  Play,
  Trophy,
  Upload,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Video,
  Filter,
  TrendingUp,
  Zap,
} from "lucide-react";

export const TopWeeklyHighlights: React.FC = () => {
  const [highlights, setHighlights] = useState<WeeklyHighlight[]>(
    INITIAL_TOP_HIGHLIGHTS
  );
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeVideoModal, setActiveVideoModal] = useState<WeeklyHighlight | null>(
    null
  );
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // New submission state
  const [athleteName, setAthleteName] = useState("");
  const [position, setPosition] = useState<Position>("QB");
  const [highSchool, setHighSchool] = useState("");
  const [playTitle, setPlayTitle] = useState("");
  const [playDescription, setPlayDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Handle live vote increment
  const handleVote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHighlights((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const hasVoted = item.userHasVoted;
          return {
            ...item,
            votes: hasVoted ? item.votes - 1 : item.votes + 1,
            userHasVoted: !hasVoted,
          };
        }
        return item;
      })
    );
  };

  const categories = [
    "All",
    "Touchdown / Big Play",
    "Defensive Hit / Pick 6",
    "Ankle Breaker Juke",
    "O-Line Pancake",
    "Special Teams Clutch",
  ];

  const filteredHighlights = highlights
    .filter((item) => {
      if (activeCategory === "All") return true;
      return item.category === activeCategory;
    })
    .sort((a, b) => b.votes - a.votes);

  const handleHighlightSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!athleteName || !playTitle) return;

    const newHighlight: WeeklyHighlight = {
      id: `hl-${Date.now()}`,
      rank: highlights.length + 1,
      athleteName,
      position,
      highSchool: highSchool || "Varsity Football",
      state: "TX",
      gradClass: 2026,
      title: playTitle,
      description: playDescription || "User submitted weekly showcase clip.",
      videoUrl:
        videoUrl ||
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80",
      votes: 1,
      userHasVoted: true,
      category: "Touchdown / Big Play",
      submittedDate: "Just Now",
    };

    setHighlights([newHighlight, ...highlights]);
    setSubmissionSuccess(true);
    setTimeout(() => {
      setSubmissionSuccess(false);
      setShowSubmitModal(false);
      setAthleteName("");
      setPlayTitle("");
      setPlayDescription("");
      setVideoUrl("");
    }, 1500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
      {/* Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-400" /> Top 10 Weekly Highlights
            </span>
            <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
              <Trophy className="w-3 h-3" /> Fan & Coach Voted
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1 flex items-center gap-2">
            Best 10 User-Submitted Plays of the Week
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Community and verified college scouts vote weekly on the nation's most electric high school plays.
          </p>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="self-start sm:self-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-rose-500/20 flex items-center gap-2"
        >
          <Upload className="w-4 h-4 stroke-[3]" /> Submit Your Highlight Clip
        </button>
      </div>

      {/* Categories Filter Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all text-xs whitespace-nowrap ${
              activeCategory === cat
                ? "bg-rose-500 text-slate-950 shadow-md"
                : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* HIGHLIGHTS GRID (Top 10) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredHighlights.map((hl, index) => (
          <div
            key={hl.id}
            onClick={() => setActiveVideoModal(hl)}
            className="group cursor-pointer bg-slate-950 rounded-2xl border border-slate-800/90 overflow-hidden hover:border-rose-500/50 transition-all shadow-xl flex flex-col justify-between"
          >
            {/* Thumbnail Stage */}
            <div className="relative aspect-video bg-slate-900 overflow-hidden">
              <img
                src={hl.thumbnailUrl}
                alt={hl.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

              {/* Top Badges overlay */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-slate-950/90 backdrop-blur-md text-amber-400 font-black text-xs border border-amber-500/40 flex items-center justify-center shadow-lg">
                  #{index + 1}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-slate-200 border border-slate-700 text-[10px] font-extrabold uppercase tracking-wider">
                  {hl.category}
                </span>
              </div>

              {/* Center Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-rose-500/90 group-hover:bg-rose-400 text-slate-950 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                  <Play className="w-7 h-7 fill-slate-950 ml-1" />
                </div>
              </div>

              {/* Bottom Thumbnail Info overlay */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-sm">
                    {hl.athleteName}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                    {hl.position}
                  </span>
                </div>
                <span className="text-[10px] text-slate-300 font-medium">
                  {hl.highSchool} ({hl.state})
                </span>
              </div>
            </div>

            {/* Play Description & Upvote Footer */}
            <div className="p-4 space-y-3">
              <h3 className="font-extrabold text-white text-sm leading-snug group-hover:text-rose-400 transition-colors">
                {hl.title}
              </h3>
              <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                {hl.description}
              </p>

              {/* Vote & Coach Reaction Strip */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
                <button
                  onClick={(e) => handleVote(hl.id, e)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all border ${
                    hl.userHasVoted
                      ? "bg-rose-500 text-slate-950 border-rose-400 shadow-md shadow-rose-500/20"
                      : "bg-slate-900 text-slate-300 hover:text-white border-slate-800"
                  }`}
                >
                  <ThumbsUp
                    className={`w-4 h-4 ${
                      hl.userHasVoted ? "fill-slate-950" : ""
                    }`}
                  />
                  <span>{hl.votes} Votes</span>
                </button>

                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified Reel
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* VIDEO PLAYBACK MODAL */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-black uppercase">
                    Rank #{activeVideoModal.rank} Weekly Highlight
                  </span>
                  <span className="text-xs text-slate-400">• {activeVideoModal.category}</span>
                </div>
                <h3 className="text-lg font-extrabold text-white mt-1">
                  {activeVideoModal.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="text-slate-400 hover:text-white font-bold text-lg px-2"
              >
                ✕
              </button>
            </div>

            <div className="relative aspect-video bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
              <video
                src={activeVideoModal.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div>
                <p className="font-extrabold text-white text-sm">
                  {activeVideoModal.athleteName} ({activeVideoModal.position}) — {activeVideoModal.highSchool} ({activeVideoModal.state})
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeVideoModal.description}
                </p>
              </div>

              <button
                onClick={(e) => handleVote(activeVideoModal.id, e)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
                  activeVideoModal.userHasVoted
                    ? "bg-rose-500 text-slate-950"
                    : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                }`}
              >
                <ThumbsUp className="w-4 h-4" /> {activeVideoModal.votes} Votes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT HIGHLIGHT MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Upload className="w-5 h-5 text-rose-400" /> Submit Your Best Play of the Week
                </h3>
                <p className="text-xs text-slate-400">
                  Enter your film clip details to enter weekly fan and coach voting.
                </p>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-white font-bold text-sm px-2"
              >
                ✕
              </button>
            </div>

            {submissionSuccess ? (
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/40 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="font-extrabold text-white text-sm">Highlight Reel Submitted!</h4>
                <p className="text-xs text-slate-300">
                  Your clip is live on the weekly leaderboard and ready for votes!
                </p>
              </div>
            ) : (
              <form onSubmit={handleHighlightSubmission} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Athlete Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={athleteName}
                    onChange={(e) => setAthleteName(e.target.value)}
                    placeholder="e.g. Caden Carter"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      Primary Position
                    </label>
                    <select
                      value={position}
                      onChange={(e) => setPosition(e.target.value as Position)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-rose-500 focus:outline-none"
                    >
                      {["QB", "RB", "WR", "TE", "OT", "OG", "C", "DE", "DT", "EDGE", "LB", "CB", "S", "ATH", "K", "P"].map(
                        (p) => (
                          <option key={p} value={p}>{p}</option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">
                      High School & State
                    </label>
                    <input
                      type="text"
                      value={highSchool}
                      onChange={(e) => setHighSchool(e.target.value)}
                      placeholder="e.g. Allen HS (TX)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Play Title / Headline *
                  </label>
                  <input
                    type="text"
                    required
                    value={playTitle}
                    onChange={(e) => setPlayTitle(e.target.value)}
                    placeholder="e.g. 60-Yard Game Winning Touchdown Pass"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Play Description
                  </label>
                  <textarea
                    rows={3}
                    value={playDescription}
                    onChange={(e) => setPlayDescription(e.target.value)}
                    placeholder="Describe the play context (opponent, quarter, game situation)..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Hudl or MP4 Video Clip URL
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://hudl.com/v/..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-black flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Post Highlight for Voting
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
