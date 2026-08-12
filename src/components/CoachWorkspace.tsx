import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Star,
  FileText,
  Video,
  ExternalLink,
  Save,
  CheckCircle2,
  Copy,
  Sparkles,
  MapPin,
  GraduationCap,
  Activity,
  UserCheck,
  ChevronRight,
  X,
  Plus,
  Trash2,
  SlidersHorizontal,
  RefreshCw,
  Trophy,
  Shield,
  Layers,
  Clock,
  Send,
  Eye,
  Check,
  Zap,
} from "lucide-react";
import { Position, GradYear } from "../types";

export type PipelineStatus = "High Priority" | "Watching" | "Offered" | "Cold";
export type DivisionTier = "All" | "FBS_P4" | "FBS_G5" | "FCS" | "D2" | "D3" | "JUCO";

export interface RecruitTarget {
  id: string;
  fullName: string;
  position: Position;
  secondaryPosition?: Position;
  highSchool: string;
  city: string;
  state: string;
  gradClass: GradYear;
  starRating: number; // 2 - 5
  heightFeet: number;
  heightInches: number;
  weightLbs: number;
  fortyTime: number;
  fortyTimingType: "Laser" | "Hand-timed";
  shuttleTime: number;
  verticalJump: number;
  benchPress: number;
  squatMax: number;
  gpa: number;
  coreGpa: number;
  ncaaEligibilityId: string;
  divisionTier: "FBS_P4" | "FBS_G5" | "FCS" | "D2" | "D3" | "JUCO";
  pipelineStatus: PipelineStatus;
  hudlUrl: string;
  twitterHandle: string;
  phone: string;
  seasonStats: string;
  lastUpdated: string;
}

export const MOCK_RECRUIT_TARGETS: RecruitTarget[] = [
  {
    id: "rec-101",
    fullName: "Caden Carter",
    position: "QB",
    secondaryPosition: "ATH",
    highSchool: "Westlake High School",
    city: "Austin",
    state: "TX",
    gradClass: 2026,
    starRating: 5,
    heightFeet: 6,
    heightInches: 3,
    weightLbs: 215,
    fortyTime: 4.52,
    fortyTimingType: "Laser",
    shuttleTime: 4.15,
    verticalJump: 36.5,
    benchPress: 285,
    squatMax: 425,
    gpa: 3.92,
    coreGpa: 3.88,
    ncaaEligibilityId: "2408912048",
    divisionTier: "FBS_P4",
    pipelineStatus: "High Priority",
    hudlUrl: "https://hudl.com/profile/caden-carter-qb",
    twitterHandle: "@CadenCarterQB",
    phone: "(512) 555-0194",
    seasonStats: "3,420 Yds Passing, 38 TDs, 540 Rushing Yds",
    lastUpdated: "2026-08-05",
  },
  {
    id: "rec-102",
    fullName: "DeMarcus Vance",
    position: "EDGE",
    secondaryPosition: "DE",
    highSchool: "Buford High School",
    city: "Buford",
    state: "GA",
    gradClass: 2026,
    starRating: 5,
    heightFeet: 6,
    heightInches: 5,
    weightLbs: 245,
    fortyTime: 4.58,
    fortyTimingType: "Laser",
    shuttleTime: 4.22,
    verticalJump: 38.0,
    benchPress: 315,
    squatMax: 500,
    gpa: 3.65,
    coreGpa: 3.55,
    ncaaEligibilityId: "2409812903",
    divisionTier: "FBS_P4",
    pipelineStatus: "Offered",
    hudlUrl: "https://hudl.com/profile/demarcus-vance-edge",
    twitterHandle: "@VanceEdge99",
    phone: "(770) 555-0182",
    seasonStats: "18.5 Sacks, 26 TFLs, 4 Forced Fumbles",
    lastUpdated: "2026-08-04",
  },
  {
    id: "rec-103",
    fullName: "Bryce Singleton",
    position: "WR",
    secondaryPosition: "ATH",
    highSchool: "St. Thomas Aquinas",
    city: "Fort Lauderdale",
    state: "FL",
    gradClass: 2026,
    starRating: 5,
    heightFeet: 6,
    heightInches: 1,
    weightLbs: 188,
    fortyTime: 4.38,
    fortyTimingType: "Laser",
    shuttleTime: 4.02,
    verticalJump: 40.5,
    benchPress: 225,
    squatMax: 365,
    gpa: 3.48,
    coreGpa: 3.40,
    ncaaEligibilityId: "2401827391",
    divisionTier: "FBS_P4",
    pipelineStatus: "Offered",
    hudlUrl: "https://hudl.com/profile/bryce-singleton-wr",
    twitterHandle: "@BryceSpeed1",
    phone: "(954) 555-0129",
    seasonStats: "1,240 Receiving Yds, 16 TDs, 2 PR TDs",
    lastUpdated: "2026-08-03",
  },
  {
    id: "rec-104",
    fullName: "Jackson Miller",
    position: "OT",
    secondaryPosition: "OG",
    highSchool: "St. Edward High School",
    city: "Lakewood",
    state: "OH",
    gradClass: 2026,
    starRating: 4,
    heightFeet: 6,
    heightInches: 6,
    weightLbs: 295,
    fortyTime: 5.08,
    fortyTimingType: "Laser",
    shuttleTime: 4.65,
    verticalJump: 29.5,
    benchPress: 345,
    squatMax: 545,
    gpa: 3.82,
    coreGpa: 3.78,
    ncaaEligibilityId: "2407718290",
    divisionTier: "FBS_P4",
    pipelineStatus: "High Priority",
    hudlUrl: "https://hudl.com/profile/jackson-miller-ot",
    twitterHandle: "@JMillerOT77",
    phone: "(216) 555-0144",
    seasonStats: "42 Pancake Blocks, 0 Sacks Allowed in 12 Games",
    lastUpdated: "2026-08-02",
  },
  {
    id: "rec-105",
    fullName: "Trevon Hicks",
    position: "CB",
    secondaryPosition: "S",
    highSchool: "North Shore High School",
    city: "Houston",
    state: "TX",
    gradClass: 2026,
    starRating: 4,
    heightFeet: 6,
    heightInches: 0,
    weightLbs: 180,
    fortyTime: 4.44,
    fortyTimingType: "Laser",
    shuttleTime: 4.08,
    verticalJump: 37.0,
    benchPress: 245,
    squatMax: 385,
    gpa: 3.25,
    coreGpa: 3.18,
    ncaaEligibilityId: "2401129481",
    divisionTier: "FBS_P4",
    pipelineStatus: "Watching",
    hudlUrl: "https://hudl.com/profile/trevon-hicks-cb",
    twitterHandle: "@LockdownTrev",
    phone: "(713) 555-0177",
    seasonStats: "7 INTs, 14 Pass Breakups, 48 Tackles",
    lastUpdated: "2026-08-01",
  },
  {
    id: "rec-106",
    fullName: "Alijah Brooks",
    position: "RB",
    secondaryPosition: "ATH",
    highSchool: "Duncanville High School",
    city: "Duncanville",
    state: "TX",
    gradClass: 2026,
    starRating: 4,
    heightFeet: 5,
    heightInches: 11,
    weightLbs: 205,
    fortyTime: 4.46,
    fortyTimingType: "Laser",
    shuttleTime: 4.12,
    verticalJump: 36.0,
    benchPress: 295,
    squatMax: 465,
    gpa: 3.30,
    coreGpa: 3.20,
    ncaaEligibilityId: "2405518290",
    divisionTier: "FBS_G5",
    pipelineStatus: "Offered",
    hudlUrl: "https://hudl.com/profile/alijah-brooks-rb",
    twitterHandle: "@AlijahBrooks21",
    phone: "(214) 555-0138",
    seasonStats: "1,890 Rushing Yds, 24 TDs, 8.2 YPC",
    lastUpdated: "2026-07-30",
  },
  {
    id: "rec-107",
    fullName: "Kobe Washington",
    position: "DT",
    secondaryPosition: "DE",
    highSchool: "Valdosta High School",
    city: "Valdosta",
    state: "GA",
    gradClass: 2026,
    starRating: 4,
    heightFeet: 6,
    heightInches: 3,
    weightLbs: 285,
    fortyTime: 4.88,
    fortyTimingType: "Hand-timed",
    shuttleTime: 4.50,
    verticalJump: 31.0,
    benchPress: 365,
    squatMax: 565,
    gpa: 3.12,
    coreGpa: 3.05,
    ncaaEligibilityId: "2402219481",
    divisionTier: "FBS_P4",
    pipelineStatus: "Watching",
    hudlUrl: "https://hudl.com/profile/kobe-washington-dt",
    twitterHandle: "@KobeWash92",
    phone: "(229) 555-0112",
    seasonStats: "11.0 Sacks, 19 TFLs, 62 Total Tackles",
    lastUpdated: "2026-07-28",
  },
  {
    id: "rec-108",
    fullName: "Ethan Kowalski",
    position: "LB",
    secondaryPosition: "TE",
    highSchool: "Cascade High School",
    city: "Grand Rapids",
    state: "MI",
    gradClass: 2026,
    starRating: 3,
    heightFeet: 6,
    heightInches: 2,
    weightLbs: 222,
    fortyTime: 4.68,
    fortyTimingType: "Laser",
    shuttleTime: 4.28,
    verticalJump: 33.5,
    benchPress: 275,
    squatMax: 425,
    gpa: 3.95,
    coreGpa: 3.90,
    ncaaEligibilityId: "2403318290",
    divisionTier: "FCS",
    pipelineStatus: "High Priority",
    hudlUrl: "https://hudl.com/profile/ethan-kowalski-lb",
    twitterHandle: "@EthanKowalski44",
    phone: "(616) 555-0163",
    seasonStats: "112 Tackles, 14 TFLs, 2 INTs, 3 Forced Fumbles",
    lastUpdated: "2026-07-25",
  },
  {
    id: "rec-109",
    fullName: "Jamal Thornton",
    position: "WR",
    secondaryPosition: "CB",
    highSchool: "East Mississippi CC",
    city: "Scooba",
    state: "MS",
    gradClass: 2025,
    starRating: 4,
    heightFeet: 6,
    heightInches: 2,
    weightLbs: 195,
    fortyTime: 4.41,
    fortyTimingType: "Laser",
    shuttleTime: 4.05,
    verticalJump: 38.5,
    benchPress: 255,
    squatMax: 405,
    gpa: 3.40,
    coreGpa: 3.35,
    ncaaEligibilityId: "2301128391",
    divisionTier: "JUCO",
    pipelineStatus: "High Priority",
    hudlUrl: "https://hudl.com/profile/jamal-thornton-juco",
    twitterHandle: "@JamalThorntonJUCO",
    phone: "(662) 555-0150",
    seasonStats: "68 Rec, 1,020 Yds, 12 TDs in JUCO MACCC",
    lastUpdated: "2026-07-22",
  },
  {
    id: "rec-110",
    fullName: "Gavin O'Connor",
    position: "C",
    secondaryPosition: "OG",
    highSchool: "Naperville Central",
    city: "Naperville",
    state: "IL",
    gradClass: 2026,
    starRating: 3,
    heightFeet: 6,
    heightInches: 3,
    weightLbs: 280,
    fortyTime: 5.12,
    fortyTimingType: "Laser",
    shuttleTime: 4.70,
    verticalJump: 28.0,
    benchPress: 325,
    squatMax: 505,
    gpa: 3.88,
    coreGpa: 3.82,
    ncaaEligibilityId: "2408819280",
    divisionTier: "D2",
    pipelineStatus: "Watching",
    hudlUrl: "https://hudl.com/profile/gavin-oconnor-c",
    twitterHandle: "@GavinOConnorC",
    phone: "(630) 555-0199",
    seasonStats: "31 Pancakes, 98% Pass Block Grade",
    lastUpdated: "2026-07-20",
  },
];

export const CoachWorkspace: React.FC = () => {
  // Filter States
  const [targets, setTargets] = useState<RecruitTarget[]>(MOCK_RECRUIT_TARGETS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState<string>("All");
  const [selectedStarRating, setSelectedStarRating] = useState<number | "All">("All");
  const [selectedDivision, setSelectedDivision] = useState<DivisionTier>("All");
  const [selectedPosition, setSelectedPosition] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  // Scratchpad Side-Drawer State
  const [activeAthleteForNotes, setActiveAthleteForNotes] = useState<RecruitTarget | null>(null);
  const [notesContent, setNotesContent] = useState<string>("");
  const [savedTimeNotice, setSavedTimeNotice] = useState<string | null>(null);
  const [copyNotice, setCopyNotice] = useState<string | null>(null);

  // Expanded Row State for Mobile View
  const [expandedMobileId, setExpandedMobileId] = useState<string | null>(null);

  // Auto-load notes when opening drawer
  useEffect(() => {
    if (activeAthleteForNotes) {
      const saved = localStorage.getItem(`gridiron_coach_notes_${activeAthleteForNotes.id}`);
      if (saved) {
        setNotesContent(saved);
      } else {
        setNotesContent(
          `Scouting Evaluation for ${activeAthleteForNotes.fullName} (${activeAthleteForNotes.position} - ${activeAthleteForNotes.highSchool}):\n\n• Film Observations:\n  - Excellent initial explosion and footwork.\n  - High football IQ and competitive toughness.\n\n• Physical Metrics:\n  - Height/Weight: ${activeAthleteForNotes.heightFeet}'${activeAthleteForNotes.heightInches}" ${activeAthleteForNotes.weightLbs}lbs\n  - Verified 40-Time: ${activeAthleteForNotes.fortyTime}s (${activeAthleteForNotes.fortyTimingType})\n\n• Academic & Compliance:\n  - NCAA Core GPA: ${activeAthleteForNotes.coreGpa} (Qualified)\n\n• Next Action Item:\n  - Schedule official campus visit & contact head high school coach.`
        );
      }
    }
  }, [activeAthleteForNotes]);

  // Auto-save notes to LocalStorage
  const handleSaveNotes = (newContent: string) => {
    setNotesContent(newContent);
    if (activeAthleteForNotes) {
      localStorage.setItem(`gridiron_coach_notes_${activeAthleteForNotes.id}`, newContent);
      const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setSavedTimeNotice(`Auto-saved at ${timestamp}`);
    }
  };

  const handleApplyNoteTemplate = (templateSnippet: string) => {
    const updated = notesContent + `\n• ${templateSnippet}`;
    handleSaveNotes(updated);
  };

  const handleUpdateStatus = (targetId: string, newStatus: PipelineStatus) => {
    setTargets((prev) =>
      prev.map((t) => (t.id === targetId ? { ...t, pipelineStatus: newStatus, lastUpdated: new Date().toISOString().split("T")[0] } : t))
    );
  };

  // Filter Logic
  const filteredTargets = targets.filter((target) => {
    const matchesSearch =
      target.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      target.highSchool.toLowerCase().includes(searchQuery.toLowerCase()) ||
      target.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      target.position.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesState = selectedState === "All" || target.state === selectedState;
    const matchesStars = selectedStarRating === "All" || target.starRating === selectedStarRating;
    const matchesDivision = selectedDivision === "All" || target.divisionTier === selectedDivision;
    const matchesPosition = selectedPosition === "All" || target.position === selectedPosition;
    const matchesStatus = selectedStatus === "All" || target.pipelineStatus === selectedStatus;

    return matchesSearch && matchesState && matchesStars && matchesDivision && matchesPosition && matchesStatus;
  });

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedState("All");
    setSelectedStarRating("All");
    setSelectedDivision("All");
    setSelectedPosition("All");
    setSelectedStatus("All");
  };

  // Quick Stats
  const totalPipelineCount = filteredTargets.length;
  const highPriorityCount = filteredTargets.filter((t) => t.pipelineStatus === "High Priority").length;
  const offeredCount = filteredTargets.filter((t) => t.pipelineStatus === "Offered").length;
  const avgForty =
    filteredTargets.length > 0
      ? (filteredTargets.reduce((acc, curr) => acc + curr.fortyTime, 0) / filteredTargets.length).toFixed(2)
      : "0.00";
  const avgGpa =
    filteredTargets.length > 0
      ? (filteredTargets.reduce((acc, curr) => acc + curr.gpa, 0) / filteredTargets.length).toFixed(2)
      : "0.00";

  const stateList = ["All", "TX", "GA", "FL", "OH", "MI", "IL", "KS", "MS"];
  const positionList = ["All", "QB", "RB", "WR", "TE", "OT", "OG", "C", "EDGE", "DE", "DT", "LB", "CB", "S", "ATH"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-slate-100 space-y-6 antialiased">
      {/* Toast Notification */}
      {copyNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-400 text-slate-950 font-black px-4 py-3 rounded-2xl shadow-2xl border border-emerald-300 flex items-center gap-2.5 text-xs animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-slate-950 shrink-0" />
          <span>{copyNotice}</span>
        </div>
      )}

      {/* DASHBOARD HEADER & QUICK STATS BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                  Coaching Staff Pipeline Workspace
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-black tracking-wider uppercase">
                  Live Scouting
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Unified recruit database, verified combine metrics & instant film scratchpad.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleResetFilters}
              className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-xs flex items-center gap-2 transition-all hover:bg-slate-900"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        {/* METRICS SUMMARY STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-slate-800/80">
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-0.5">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
              Targets Listed
            </span>
            <p className="text-xl font-black text-white flex items-center gap-1.5">
              {totalPipelineCount} <span className="text-[11px] text-slate-500 font-normal">Recruits</span>
            </p>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-0.5">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
              High Priority
            </span>
            <p className="text-xl font-black text-amber-400">{highPriorityCount}</p>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-0.5">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
              Offered Targets
            </span>
            <p className="text-xl font-black text-emerald-400">{offeredCount}</p>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-0.5">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
              Avg 40-Yard Time
            </span>
            <p className="text-xl font-black text-cyan-400">{avgForty}s</p>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-0.5 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
              Avg Core GPA
            </span>
            <p className="text-xl font-black text-purple-400">{avgGpa}</p>
          </div>
        </div>
      </div>

      {/* SPLIT SCREEN DASHBOARD LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* LEFT SIDEBAR: FILTERS PANEL */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-400" />
              Scouting Filters
            </h2>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
              {filteredTargets.length} Active
            </span>
          </div>

          {/* Search Field */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Quick Search
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Name, HS, City..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Star Rating Badge Filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Star Rating
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {(["All", 5, 4, 3, 2] as const).map((stars) => {
                const isSelected = selectedStarRating === stars;
                return (
                  <button
                    key={stars}
                    onClick={() => setSelectedStarRating(stars)}
                    className={`py-1.5 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center gap-1 ${
                      isSelected
                        ? "bg-amber-400/20 border-amber-400/50 text-amber-300 shadow-sm"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                    }`}
                  >
                    {stars === "All" ? (
                      "All"
                    ) : (
                      <>
                        <span>{stars}</span>
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* State Select */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Recruit State
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500/60"
            >
              {stateList.map((st) => (
                <option key={st} value={st}>
                  {st === "All" ? "All States" : st}
                </option>
              ))}
            </select>
          </div>

          {/* Position Select */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Position
            </label>
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500/60"
            >
              {positionList.map((pos) => (
                <option key={pos} value={pos}>
                  {pos === "All" ? "All Positions" : pos}
                </option>
              ))}
            </select>
          </div>

          {/* Division Tier */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Division Tier
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "All", value: "All" },
                { label: "FBS P4", value: "FBS_P4" },
                { label: "FBS G5", value: "FBS_G5" },
                { label: "FCS", value: "FCS" },
                { label: "D2", value: "D2" },
                { label: "JUCO", value: "JUCO" },
              ].map((div) => {
                const isSel = selectedDivision === div.value;
                return (
                  <button
                    key={div.value}
                    onClick={() => setSelectedDivision(div.value as DivisionTier)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold border transition-all ${
                      isSel
                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {div.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pipeline Status */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Pipeline Status
            </label>
            <div className="flex flex-wrap gap-1.5">
              {["All", "High Priority", "Offered", "Watching", "Cold"].map((st) => {
                const isSel = selectedStatus === st;
                return (
                  <button
                    key={st}
                    onClick={() => setSelectedStatus(st)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold border transition-all ${
                      isSel
                        ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* MAIN CONTENT PANEL: RECRUITS PIPELINE TABLE */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                Target Board & Evaluation Table
              </h2>
              <p className="text-xs text-slate-400">
                Click athlete row to open scratchpad notes or switch pipeline statuses directly.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-emerald-400 text-xs font-black">
              Showing {filteredTargets.length} Recruits
            </span>
          </div>

          {/* DESKTOP DATA TABLE */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="py-3 px-3">Athlete & Position</th>
                  <th className="py-3 px-3">High School</th>
                  <th className="py-3 px-3">Stars</th>
                  <th className="py-3 px-3">Combine Metrics</th>
                  <th className="py-3 px-3">Academics</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredTargets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                      No targets matched your active filter criteria. Try resetting filters.
                    </td>
                  </tr>
                ) : (
                  filteredTargets.map((target) => {
                    const isSelectedNotes = activeAthleteForNotes?.id === target.id;

                    return (
                      <tr
                        key={target.id}
                        className={`group transition-all hover:bg-slate-850 ${
                          isSelectedNotes ? "bg-slate-800/80 border-l-4 border-l-emerald-400" : ""
                        }`}
                      >
                        {/* Athlete Name & Pos */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-400 font-black text-xs shrink-0 group-hover:border-emerald-500/50">
                              {target.position}
                            </div>
                            <div>
                              <p className="font-extrabold text-white text-sm leading-snug group-hover:text-emerald-300">
                                {target.fullName}
                              </p>
                              <span className="text-[10px] text-slate-400 font-medium">
                                Class {target.gradClass} • {target.state}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* High School */}
                        <td className="py-3 px-3">
                          <p className="font-bold text-slate-200">{target.highSchool}</p>
                          <span className="text-[10px] text-slate-400">{target.city}</span>
                        </td>

                        {/* Star Rating */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1">
                            <span className="font-black text-amber-400 text-xs">{target.starRating}</span>
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          </div>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">{target.divisionTier}</span>
                        </td>

                        {/* Combine Metrics */}
                        <td className="py-3 px-3">
                          <div className="space-y-0.5">
                            <p className="font-extrabold text-emerald-400">
                              40y: {target.fortyTime}s{" "}
                              <span className="text-[9px] text-slate-400 font-normal">({target.fortyTimingType})</span>
                            </p>
                            <p className="text-[10px] text-slate-300">
                              {target.heightFeet}'{target.heightInches}" • {target.weightLbs} lbs
                            </p>
                          </div>
                        </td>

                        {/* Academics */}
                        <td className="py-3 px-3">
                          <p className="font-bold text-cyan-300">GPA: {target.gpa}</p>
                          <span className="text-[10px] text-slate-400">Core: {target.coreGpa}</span>
                        </td>

                        {/* Status Switcher Dropdown */}
                        <td className="py-3 px-3">
                          <select
                            value={target.pipelineStatus}
                            onChange={(e) => handleUpdateStatus(target.id, e.target.value as PipelineStatus)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider focus:outline-none ${
                              target.pipelineStatus === "High Priority"
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                : target.pipelineStatus === "Offered"
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                : target.pipelineStatus === "Watching"
                                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                                : "bg-slate-800 text-slate-400 border-slate-700"
                            }`}
                          >
                            <option value="High Priority">High Priority</option>
                            <option value="Offered">Offered</option>
                            <option value="Watching">Watching</option>
                            <option value="Cold">Cold</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setActiveAthleteForNotes(target)}
                              className={`p-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${
                                isSelectedNotes
                                  ? "bg-emerald-500 text-slate-950 border-emerald-400 font-black"
                                  : "bg-slate-950 border-slate-800 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/40"
                              }`}
                              title="Open Scouting Notes Scratchpad"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline">Notes</span>
                            </button>

                            <a
                              href={target.hudlUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/40 transition-all flex items-center gap-1"
                              title="Watch Film on HUDL"
                            >
                              <Video className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE ACCORDION CARD LIST */}
          <div className="block md:hidden space-y-3">
            {filteredTargets.map((target) => {
              const isExpanded = expandedMobileId === target.id;
              return (
                <div
                  key={target.id}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 font-black text-xs">
                        {target.position}
                      </div>
                      <div>
                        <h3 className="font-black text-white text-sm">{target.fullName}</h3>
                        <p className="text-[10px] text-slate-400">
                          {target.highSchool} ({target.state})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        <span className="text-xs font-black text-amber-400">{target.starRating}</span>
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      </div>

                      <button
                        onClick={() => setExpandedMobileId(isExpanded ? null : target.id)}
                        className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
                      >
                        <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Mobile Details */}
                  {isExpanded && (
                    <div className="pt-3 border-t border-slate-800/80 space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">40-Yard Dash</span>
                          <span className="font-extrabold text-emerald-400">{target.fortyTime}s ({target.fortyTimingType})</span>
                        </div>
                        <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Academics</span>
                          <span className="font-extrabold text-cyan-300">GPA: {target.gpa}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <select
                          value={target.pipelineStatus}
                          onChange={(e) => handleUpdateStatus(target.id, e.target.value as PipelineStatus)}
                          className="px-2.5 py-1 rounded-lg text-xs font-black bg-slate-900 border border-slate-800 text-amber-300 uppercase"
                        >
                          <option value="High Priority">High Priority</option>
                          <option value="Offered">Offered</option>
                          <option value="Watching">Watching</option>
                          <option value="Cold">Cold</option>
                        </select>

                        <button
                          onClick={() => setActiveAthleteForNotes(target)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Open Notes</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* INLINE SCOUTING NOTES SCRATCHPAD SLIDE-OVER DRAWER */}
      {activeAthleteForNotes && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end animate-fadeIn">
          <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full p-6 space-y-5 flex flex-col shadow-2xl overflow-y-auto relative">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base uppercase tracking-wider flex items-center gap-2">
                    Scouting Scratchpad & Film Notes
                  </h3>
                  <p className="text-xs text-slate-400">Auto-saved locally for immediate staff evaluations.</p>
                </div>
              </div>

              <button
                onClick={() => setActiveAthleteForNotes(null)}
                className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selected Athlete Header Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-black">
                    {activeAthleteForNotes.position}
                  </span>
                  <h4 className="font-black text-white text-base">{activeAthleteForNotes.fullName}</h4>
                </div>
                <div className="flex items-center gap-1 text-amber-400 font-black text-xs">
                  <span>{activeAthleteForNotes.starRating} Stars</span>
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span>{activeAthleteForNotes.highSchool} ({activeAthleteForNotes.state})</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">40y: {activeAthleteForNotes.fortyTime}s</span>
                <span>•</span>
                <span className="text-cyan-300 font-bold">GPA: {activeAthleteForNotes.gpa}</span>
              </div>
            </div>

            {/* Quick Template Tag Snippets */}
            <div className="space-y-1.5 shrink-0">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                Quick Evaluation Tags (Tap to append)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Elite Arm Velocity & Release",
                  "First-Step Explosiveness",
                  "High Football IQ & Instincts",
                  "Verified Academic Qualifier",
                  "Schedule Official Campus Visit",
                  "Contact High School Head Coach",
                ].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleApplyNoteTemplate(tag)}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 text-[11px] font-bold transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3 text-emerald-400" />
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Rich Text Scouting Notes Field */}
            <div className="space-y-2 flex-1 flex flex-col min-h-[250px]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 uppercase tracking-wider">Evaluation Scratchpad</span>
                {savedTimeNotice && (
                  <span className="text-[10px] font-extrabold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {savedTimeNotice}
                  </span>
                )}
              </div>

              <textarea
                value={notesContent}
                onChange={(e) => handleSaveNotes(e.target.value)}
                placeholder="Type film evaluation notes, physical impressions, or recruiting follow-up actions..."
                className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/60 leading-relaxed resize-none"
              />
            </div>

            {/* Footer Action Buttons */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(notesContent);
                  setCopyNotice("Scouting notes copied to clipboard!");
                  setTimeout(() => setCopyNotice(null), 3000);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 font-extrabold text-xs flex items-center gap-2 transition-all"
              >
                <Copy className="w-4 h-4 text-cyan-400" />
                <span>Copy Notes</span>
              </button>

              <button
                onClick={() => setActiveAthleteForNotes(null)}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Done & Close</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachWorkspace;
