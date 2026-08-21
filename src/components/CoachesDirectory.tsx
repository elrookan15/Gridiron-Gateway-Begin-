import React, { useState } from "react";
import { CollegeCoachProfile, Position, CollegeDivision } from "../types";
import { MOCK_COLLEGE_COACHES } from "../data/mockData";
import {
  Users,
  Search,
  Mail,
  Phone,
  ExternalLink,
  ShieldCheck,
  Building2,
  MapPin,
  Sparkles,
  Send,
  CheckCircle2,
  Award,
  Filter,
  MessageSquare,
  BookOpen,
} from "lucide-react";

export const CoachesDirectory: React.FC = () => {
  const [coaches] = useState<CollegeCoachProfile[]>(MOCK_COLLEGE_COACHES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConference, setSelectedConference] = useState<string>("All");
  const [selectedDivision, setSelectedDivision] = useState<string>("All");
  const [selectedPosition, setSelectedPosition] = useState<string>("All");
  const [selectedCoach, setSelectedCoach] = useState<CollegeCoachProfile | null>(null);

  // Direct messaging modal state
  const [messageCoachModal, setMessageCoachModal] = useState<CollegeCoachProfile | null>(null);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [messageSentSuccess, setMessageSentSuccess] = useState(false);

  const divisions = [
    { value: "All", label: "All Divisions" },
    { value: "FBS", label: "Division 1 FBS" },
    { value: "FCS", label: "Division 1-AA (FCS)" },
    { value: "DII", label: "Division 2 (DII)" },
    { value: "DIII", label: "Division 3 (DIII)" },
    { value: "NAIA", label: "Division 4 / NAIA" },
    { value: "JUCO", label: "JUCO (NJCAA)" },
    { value: "PREP", label: "PREP / Post-Grad" },
  ];

  const conferences = ["All", "SEC", "Big Ten", "ACC", "Big 12", "Missouri Valley (MVFC)", "GLIAC", "Ohio Athletic (OAC)", "MACCC", "National Prep", "Independent"];
  const positions: Position[] = [
    "QB",
    "RB",
    "WR",
    "TE",
    "OT",
    "OG",
    "C",
    "DE",
    "DT",
    "EDGE",
    "LB",
    "CB",
    "S",
    "ATH",
  ];

  const filteredCoaches = coaches.filter((coach) => {
    const matchesSearch =
      coach.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coach.school.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coach.title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesConf =
      selectedConference === "All" || coach.conference === selectedConference;

    const matchesDiv =
      selectedDivision === "All" || coach.division === selectedDivision;

    const matchesPos =
      selectedPosition === "All" ||
      coach.targetPositions.includes(selectedPosition as Position);

    return matchesSearch && matchesConf && matchesDiv && matchesPos;
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setMessageSentSuccess(true);
    setTimeout(() => {
      setMessageSentSuccess(false);
      setMessageCoachModal(null);
      setMessageSubject("");
      setMessageBody("");
    }, 1800);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-white space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 border-2 border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-400" /> College Football Coaches Directory
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                450+ Verified NCAA Programs
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              College Coaches & Staff Directory
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Detailed bios, recruiting territories, target position requirements, and verified contact channels for Division I, II & III college coaches.
            </p>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-center shrink-0 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Direct Recruiter Access
            </span>
            <p className="text-2xl font-black text-blue-400">100% Verified</p>
            <p className="text-[10px] text-emerald-400 font-medium">NCAA Compliant Directory</p>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTER CONTROLS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search coach name, school (e.g. Texas, Georgia), or title..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Division Filter */}
          <div className="w-full md:w-44">
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-bold"
            >
              {divisions.map((div) => (
                <option key={div.value} value={div.value}>
                  {div.label}
                </option>
              ))}
            </select>
          </div>

          {/* Conference Filter */}
          <div className="w-full md:w-48">
            <select
              value={selectedConference}
              onChange={(e) => setSelectedConference(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Conferences</option>
              {conferences.filter((c) => c !== "All").map((conf) => (
                <option key={conf} value={conf}>
                  {conf}
                </option>
              ))}
            </select>
          </div>

          {/* Target Position Filter */}
          <div className="w-full md:w-48">
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Target Positions</option>
              {positions.map((p) => (
                <option key={p} value={p}>
                  Recruiting {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <span>
            Showing <strong className="text-white">{filteredCoaches.length}</strong> Verified College Coaches
          </span>
          <span className="text-[11px] text-blue-400 font-medium">
            Updated for 2026-2027 Recruiting Cycle
          </span>
        </div>
      </div>

      {/* COACH CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredCoaches.map((coach) => (
          <div
            key={coach.id}
            className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-3xl p-6 shadow-xl space-y-5 transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Header Avatar & Name */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <img
                      src={coach.avatarUrl}
                      alt={coach.fullName}
                      className="w-16 h-16 rounded-2xl border-2 border-slate-700 object-cover shadow-lg"
                    />
                    {coach.verifiedBadge && (
                      <ShieldCheck className="w-5 h-5 text-emerald-400 fill-slate-950 absolute -bottom-1 -right-1" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-lg font-extrabold text-white">
                        {coach.fullName}
                      </h3>
                    </div>
                    <p className="text-xs font-bold text-blue-400">
                      {coach.title}
                    </p>
                    <p className="text-xs text-slate-300 font-semibold flex items-center gap-1 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {coach.school}
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30 text-[10px] font-extrabold uppercase shrink-0">
                  {coach.conference}
                </span>
              </div>

              {/* Detailed Bio */}
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80 font-medium">
                "{coach.bio}"
              </p>

              {/* Recruiting Territories & Target Positions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Recruiting Territories
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {coach.recruitingTerritory.map((state) => (
                      <span
                        key={state}
                        className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-semibold text-slate-200"
                      >
                        {state}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Target Position Groups
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {coach.targetPositions.map((pos) => (
                      <span
                        key={pos}
                        className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold"
                      >
                        {pos}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact Info Detail Box */}
              <div className="space-y-2 text-xs bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <span className="text-slate-400 flex items-center gap-1.5 shrink-0">
                    <Mail className="w-3.5 h-3.5 text-blue-400" /> Official Email:
                  </span>
                  {coach.email ? (
                    <a
                      href={`mailto:${coach.email}`}
                      className="font-bold text-white hover:text-blue-400 transition-colors truncate"
                    >
                      {coach.email}
                    </a>
                  ) : (
                    <span className="font-bold text-amber-400 truncate">Contact not verified</span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 min-w-0">
                  <span className="text-slate-400 flex items-center gap-1.5 shrink-0">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" /> Football Office:
                  </span>
                  <span className="font-mono text-slate-200 font-bold truncate">
                    {coach.phone ?? "Contact not verified"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" /> Office Address:
                  </span>
                  <span className="text-[11px] text-slate-300 font-medium truncate max-w-[200px]">
                    {coach.officeAddress}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <a
                href={`https://x.com/${coach.twitterHandle.replace("@", "")}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-cyan-400 border border-slate-800 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                {coach.twitterHandle} <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={() => {
                  setMessageCoachModal(coach);
                  setMessageSubject(
                    `Class of 2026 Athlete Intro — Caden Carter (Allen HS, TX)`
                  );
                  setMessageBody(
                    `Coach ${coach.fullName.split(" ").slice(-1)[0]},\n\nI hope you're having a great week! My name is Caden Carter, 6'3" 212lb QB out of Allen High School (TX, Class of 2026). I wanted to share my verified 4.52s 40 film and NCAA eligibility credentials with your staff at ${coach.school}.\n\nLooking forward to connecting!`
                  );
                }}
                className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/20"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Direct Message Coach
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* DIRECT MESSAGE COACH MODAL */}
      {messageCoachModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={messageCoachModal.avatarUrl}
                  alt={messageCoachModal.fullName}
                  className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                />
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    Message {messageCoachModal.fullName}
                  </h3>
                  <p className="text-[11px] text-blue-400">
                    {messageCoachModal.title} • {messageCoachModal.school}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setMessageCoachModal(null)}
                className="text-slate-400 hover:text-white font-bold text-sm px-2"
              >
                ✕
              </button>
            </div>

            {messageSentSuccess ? (
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/40 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="font-extrabold text-white text-sm">Direct Message Dispatched!</h4>
                <p className="text-xs text-slate-300">
                  {messageCoachModal.email
                    ? `Queued for verified staff contact at ${messageCoachModal.school}.`
                    : "Queued locally. Contact not verified — message will not be delivered to an unpublished athletics address."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    required
                    value={messageSubject}
                    onChange={(e) => setMessageSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Personalized Recruiting Message
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-blue-500 focus:outline-none font-sans leading-relaxed"
                  />
                </div>

                <div className="p-3 bg-blue-950/60 border border-blue-500/30 rounded-xl flex items-center gap-2 text-[11px] text-blue-300">
                  <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                  Includes attached verified 40-time, core GPA, Hudl film & NCAA ID credentials.
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setMessageCoachModal(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-black flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4" /> Send Message
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
