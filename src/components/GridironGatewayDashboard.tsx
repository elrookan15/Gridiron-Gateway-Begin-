"use client";

import React, { useState, useMemo } from "react";
import {
  School,
  Search,
  Filter,
  Star,
  Award,
  ExternalLink,
  Copy,
  CheckCircle2,
  Printer,
  Calculator,
  Building2,
  UserCheck,
  Zap,
  TrendingUp,
  MapPin,
  GraduationCap,
  Shield,
  Phone,
  Mail,
  Video,
  Twitter,
  Instagram,
  X,
  RefreshCw,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Sliders,
  DollarSign,
  Activity,
  Layers,
  ChevronDown,
  Flame,
  Pause,
  Play,
  Brain,
  Film,
  Bot,
  ShieldCheck,
  Database,
} from "lucide-react";
import { NILValuationChart } from "./NILValuationChart";
import { CapGMRosterSimulator } from "./CapGMRosterSimulator";
import { CognitiveSchemeMatcher } from "./CognitiveSchemeMatcher";
import { TrueSpeedModule } from "./TrueSpeedModule";
import { BioScanTelemetryModule } from "./BioScanTelemetryModule";
import { RallySafeEscrowModule } from "./RallySafeEscrowModule";
import { AiFilmTaggingStudio } from "./AiFilmTaggingStudio";
import { MultiTenantRoleSelector, MOCK_MULTI_TENANT_USERS } from "./MultiTenantRoleSelector";
import { AutonomousScoutingAgent } from "./AutonomousScoutingAgent";
import { CombineLaserApiModule } from "./CombineLaserApiModule";
import { ParentConsentPortal } from "./ParentConsentPortal";
import { SchoolsCsvImporter } from "./SchoolsCsvImporter";

// ============================================================================
// TYPES & DATA MODELS
// ============================================================================

export interface CommitmentTickerItem {
  id: string;
  athleteName: string;
  position: string;
  starRating: 3 | 4 | 5;
  highSchool: string;
  state: string;
  committedToSchool: string;
  committedToMascot: string;
  divisionTier: string;
  timestamp: string;
}

const MOCK_LATEST_COMMITS: CommitmentTickerItem[] = [
  {
    id: "commit-1",
    athleteName: "Derrick Vance Jr.",
    position: "QB",
    starRating: 5,
    highSchool: "Westlake HS",
    state: "TX",
    committedToSchool: "Texas",
    committedToMascot: "Longhorns",
    divisionTier: "SEC (FBS P4)",
    timestamp: "8m ago",
  },
  {
    id: "commit-2",
    athleteName: "Malik Sanders",
    position: "WR",
    starRating: 5,
    highSchool: "Buford HS",
    state: "GA",
    committedToSchool: "Georgia",
    committedToMascot: "Bulldogs",
    divisionTier: "SEC (FBS P4)",
    timestamp: "24m ago",
  },
  {
    id: "commit-3",
    athleteName: "Treyvon Harris",
    position: "EDGE",
    starRating: 4,
    highSchool: "St. Thomas Aquinas",
    state: "FL",
    committedToSchool: "Ohio State",
    committedToMascot: "Buckeyes",
    divisionTier: "Big Ten (FBS P4)",
    timestamp: "41m ago",
  },
  {
    id: "commit-4",
    athleteName: "Jackson Miller",
    position: "OT",
    starRating: 4,
    highSchool: "Mater Dei",
    state: "CA",
    committedToSchool: "Oregon",
    committedToMascot: "Ducks",
    divisionTier: "Big Ten (FBS P4)",
    timestamp: "1h ago",
  },
  {
    id: "commit-5",
    athleteName: "Jaylen Brooks",
    position: "CB",
    starRating: 4,
    highSchool: "Duncanville HS",
    state: "TX",
    committedToSchool: "Alabama",
    committedToMascot: "Crimson Tide",
    divisionTier: "SEC (FBS P4)",
    timestamp: "2h ago",
  },
  {
    id: "commit-6",
    athleteName: "Caleb O'Connor",
    position: "LB",
    starRating: 3,
    highSchool: "Iowa Western CC",
    state: "IA",
    committedToSchool: "Ferris State",
    committedToMascot: "Bulldogs",
    divisionTier: "GLIAC (DII)",
    timestamp: "3h ago",
  },
  {
    id: "commit-7",
    athleteName: "Marcus Thorne",
    position: "RB",
    starRating: 4,
    highSchool: "IMG Academy",
    state: "FL",
    committedToSchool: "LSU",
    committedToMascot: "Tigers",
    divisionTier: "SEC (FBS P4)",
    timestamp: "4h ago",
  },
  {
    id: "commit-8",
    athleteName: "Zachary Lawson",
    position: "S",
    starRating: 3,
    highSchool: "Mount Union Prep",
    state: "OH",
    committedToSchool: "Mount Union",
    committedToMascot: "Purple Raiders",
    divisionTier: "OAC (DIII)",
    timestamp: "5h ago",
  },
];

const LatestCommitsTickerBar: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  React.useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % MOCK_LATEST_COMMITS.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % MOCK_LATEST_COMMITS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + MOCK_LATEST_COMMITS.length) % MOCK_LATEST_COMMITS.length);
  };

  return (
    <div className="no-print bg-slate-900/90 border-b border-slate-800 backdrop-blur-sm text-white overflow-hidden py-2.5 px-4 shadow-inner">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left Ticker Badge */}
        <div className="flex items-center gap-2 shrink-0 bg-slate-950 px-3 py-1 rounded-xl border border-amber-500/40 text-amber-300 font-extrabold text-[11px] uppercase tracking-wider shadow-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Latest Commits</span>
        </div>

        {/* Center Animated Ticker Items View */}
        <div
          className="flex-1 overflow-hidden relative cursor-pointer"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="flex items-center gap-4 transition-transform duration-500 ease-in-out whitespace-nowrap overflow-x-auto no-scrollbar">
            {MOCK_LATEST_COMMITS.map((item, idx) => {
              const isActive = idx === currentIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl border text-xs font-semibold transition-all shrink-0 ${
                    isActive
                      ? "bg-slate-950 border-emerald-500/60 shadow-lg shadow-emerald-500/10 scale-105"
                      : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  {/* Star Rating Badge */}
                  <span className="text-yellow-400 font-bold font-mono text-[11px]">
                    {"★".repeat(item.starRating)}
                  </span>

                  {/* Athlete Info */}
                  <span className="font-extrabold text-white">
                    {item.athleteName}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-mono font-bold text-slate-300">
                    {item.position}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    ({item.highSchool}, {item.state})
                  </span>

                  {/* Commitment Arrow */}
                  <span className="text-emerald-400 font-black">➜</span>

                  {/* School Committed */}
                  <span className="font-black text-lime-400 flex items-center gap-1">
                    {item.committedToSchool} {item.committedToMascot}
                  </span>

                  {/* Tier & Time */}
                  <span className="px-2 py-0.2 rounded-full bg-slate-900 border border-slate-800 text-[9px] text-cyan-300 font-mono">
                    {item.divisionTier}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {item.timestamp}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Controls (Pause/Play, Prev, Next) */}
        <div className="flex items-center gap-1 shrink-0 bg-slate-950 p-1 rounded-xl border border-slate-800 text-slate-400">
          <button
            onClick={handlePrev}
            className="p-1 rounded-lg hover:bg-slate-800 hover:text-white transition-all min-h-[32px] min-w-[32px] flex items-center justify-center"
            title="Previous Commitment"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1 rounded-lg hover:bg-slate-800 hover:text-white transition-all min-h-[32px] min-w-[32px] flex items-center justify-center"
            title={isPaused ? "Play Ticker" : "Pause Ticker"}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
          </button>
          <button
            onClick={handleNext}
            className="p-1 rounded-lg hover:bg-slate-800 hover:text-white transition-all min-h-[32px] min-w-[32px] flex items-center justify-center"
            title="Next Commitment"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export type DivisionTier = "FBS_P4" | "FBS_G5" | "FCS" | "D2" | "D3" | "JUCO";

export interface SchoolRecord {
  id: string;
  name: string;
  mascot: string;
  city: string;
  state: string;
  divisionTier: DivisionTier;
  conference: string;
  primaryRecruitingEmail: string;
  coachingPhone: string;
  topMajors: string[];
  programHighlights: string[];
  logoUrl: string;
  headCoach: string;
}

export interface OfferTimelineItem {
  id: string;
  schoolName: string;
  divisionTier: DivisionTier;
  conference: string;
  offerDate: string;
  offerType: "Verbal" | "Official Written";
  status: "Committed" | "Offered" | "Warm Interest";
  logoUrl: string;
}

export interface AthleteDossierData {
  id: string;
  fullName: string;
  position: string;
  secondaryPosition?: string;
  gradClass: number;
  highSchool: string;
  city: string;
  state: string;
  starRating: number;
  heightFeet: number;
  heightInches: number;
  weightLbs: number;
  handSizeInches: number;
  armLengthInches: number;
  fortyTime: number;
  fortyTimingType: "Laser" | "Hand-timed";
  shuttleTime: number;
  verticalJump: number;
  benchPress: number;
  squatMax: number;
  gpa: number;
  coreGpa: number;
  satScore?: number;
  actScore?: number;
  ncaaEligibilityId: string;
  hudlUrl: string;
  twitterHandle: string;
  instagramHandle?: string;
  seasonStats: string;
  honors: string[];
  offers: OfferTimelineItem[];
  committedSchool?: string;
}

// ============================================================================
// MOCK DATASETS
// ============================================================================

const MOCK_SCHOOLS: SchoolRecord[] = [
  {
    id: "sch-1",
    name: "University of Texas",
    mascot: "Longhorns",
    city: "Austin",
    state: "TX",
    divisionTier: "FBS_P4",
    conference: "SEC",
    primaryRecruitingEmail: "recruiting@texaslonghorns.com",
    coachingPhone: "(512) 471-3050",
    topMajors: ["Business Administration", "Kinesiology", "Petroleum Engineering"],
    programHighlights: ["2023 CFP Semifinalist", "DKR Texas Memorial Stadium (100k+)", "Premier Texas Recruiting Hub"],
    logoUrl: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=120&auto=format&fit=crop&q=80",
    headCoach: "Steve Sarkisian",
  },
  {
    id: "sch-2",
    name: "University of Georgia",
    mascot: "Bulldogs",
    city: "Athens",
    state: "GA",
    divisionTier: "FBS_P4",
    conference: "SEC",
    primaryRecruitingEmail: "recruiting@uga.edu",
    coachingPhone: "(706) 542-1307",
    topMajors: ["Sport Management", "Finance", "Agricultural Sciences"],
    programHighlights: ["2x Back-to-Back CFP National Champions", "Top NFL Draft First Round Producer", "Sanford Stadium Atmosphere"],
    logoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    headCoach: "Kirby Smart",
  },
  {
    id: "sch-3",
    name: "Ohio State University",
    mascot: "Buckeyes",
    city: "Columbus",
    state: "OH",
    divisionTier: "FBS_P4",
    conference: "Big Ten",
    primaryRecruitingEmail: "recruiting@buckeyes.osu.edu",
    coachingPhone: "(614) 292-2531",
    topMajors: ["Business", "Kinesiology", "Mechanical Engineering"],
    programHighlights: ["8-Time National Champions", "Woody Hayes Athletic Center", "WR U Recruiting Tradition"],
    logoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    headCoach: "Ryan Day",
  },
  {
    id: "sch-4",
    name: "University of Oregon",
    mascot: "Ducks",
    city: "Eugene",
    state: "OR",
    divisionTier: "FBS_P4",
    conference: "Big Ten",
    primaryRecruitingEmail: "oregonrecruiting@uoregon.edu",
    coachingPhone: "(541) 346-3825",
    topMajors: ["Journalism & Media", "Business", "Human Physiology"],
    programHighlights: ["World-class Nike Athletic Innovation Center", "Autzen Stadium Loudness", "High-Tempo Offense"],
    logoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80",
    headCoach: "Dan Lanning",
  },
  {
    id: "sch-5",
    name: "Appalachian State University",
    mascot: "Mountaineers",
    city: "Boone",
    state: "NC",
    divisionTier: "FBS_G5",
    conference: "Sun Belt",
    primaryRecruitingEmail: "appstaterecruiting@appstate.edu",
    coachingPhone: "(828) 262-2501",
    topMajors: ["Building Science", "Recreation Management", "Criminal Justice"],
    programHighlights: ["Famous Giant-Killer Heritage", "Multiple Sun Belt Titles", "Kidd Brewer Stadium Altitude Advantage"],
    logoUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=120&auto=format&fit=crop&q=80",
    headCoach: "Shawn Clark",
  },
  {
    id: "sch-6",
    name: "North Dakota State University",
    mascot: "Bison",
    city: "Fargo",
    state: "ND",
    divisionTier: "FCS",
    conference: "Missouri Valley",
    primaryRecruitingEmail: "ndsu.fbrecruiting@ndsu.edu",
    coachingPhone: "(701) 231-7811",
    topMajors: ["Agricultural Sciences", "Construction Management", "Industrial Engineering"],
    programHighlights: ["9-Time FCS National Champions", "Fargodome Home Dominance", "NFL Quarterback Pipeline"],
    logoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80",
    headCoach: "Tim Polasek",
  },
  {
    id: "sch-7",
    name: "Grand Valley State University",
    mascot: "Lakers",
    city: "Allendale",
    state: "MI",
    divisionTier: "D2",
    conference: "GLIAC",
    primaryRecruitingEmail: "gvsu.recruiting@gvsu.edu",
    coachingPhone: "(616) 331-8800",
    topMajors: ["Nursing", "Biomedical Science", "Supply Chain Management"],
    programHighlights: ["4-Time NCAA Division II Champions", "Lubbers Stadium 17k+ Capacity", "Elite Midwest Facility"],
    logoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80",
    headCoach: "Scott Wooster",
  },
  {
    id: "sch-8",
    name: "Keiser University",
    mascot: "Seahawks",
    city: "West Palm Beach",
    state: "FL",
    divisionTier: "JUCO",
    conference: "Sun Conference",
    primaryRecruitingEmail: "keiser.recruiting@keiseruniversity.edu",
    coachingPhone: "(561) 478-5000",
    topMajors: ["Sports Management", "Business Administration", "Exercise Science"],
    programHighlights: ["2023 NAIA National Champions", "Florida Recruiting Pipeline", "Year-round Sunshine Training"],
    logoUrl: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=120&auto=format&fit=crop&q=80",
    headCoach: "Myles Russ",
  },
];

const MOCK_ATHLETE_DOSSIER: AthleteDossierData = {
  id: "ath-2026-001",
  fullName: "Caden Carter",
  position: "QB",
  secondaryPosition: "ATH",
  gradClass: 2026,
  highSchool: "Westlake High School",
  city: "Austin",
  state: "TX",
  starRating: 5,
  heightFeet: 6,
  heightInches: 3,
  weightLbs: 215,
  handSizeInches: 9.75,
  armLengthInches: 32.5,
  fortyTime: 4.52,
  fortyTimingType: "Laser",
  shuttleTime: 4.15,
  verticalJump: 36.5,
  benchPress: 285,
  squatMax: 425,
  gpa: 3.92,
  coreGpa: 3.88,
  satScore: 1310,
  actScore: 29,
  ncaaEligibilityId: "2408912048",
  hudlUrl: "https://hudl.com/profile/caden-carter-qb",
  twitterHandle: "@CadenCarterQB",
  instagramHandle: "@caden_carter_qb",
  seasonStats: "3,420 Yds Passing, 38 TDs, 4 INTs, 540 Yds Rushing, 8 Rush TDs",
  honors: [
    "Texas 6A District Offensive Player of the Year",
    "Elite 11 Finals Qualifier",
    "1st Team All-State Academic Honors",
    "2x High School Team Captain",
  ],
  committedSchool: "University of Texas",
  offers: [
    {
      id: "off-1",
      schoolName: "University of Texas",
      divisionTier: "FBS_P4",
      conference: "SEC",
      offerDate: "2025-06-15",
      offerType: "Official Written",
      status: "Committed",
      logoUrl: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=120&auto=format&fit=crop&q=80",
    },
    {
      id: "off-2",
      schoolName: "University of Georgia",
      divisionTier: "FBS_P4",
      conference: "SEC",
      offerDate: "2025-05-10",
      offerType: "Verbal",
      status: "Offered",
      logoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    },
    {
      id: "off-3",
      schoolName: "Ohio State University",
      divisionTier: "FBS_P4",
      conference: "Big Ten",
      offerDate: "2025-04-22",
      offerType: "Verbal",
      status: "Offered",
      logoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    },
    {
      id: "off-4",
      schoolName: "University of Oregon",
      divisionTier: "FBS_P4",
      conference: "Big Ten",
      offerDate: "2025-03-01",
      offerType: "Verbal",
      status: "Offered",
      logoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80",
    },
  ],
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const GridironGatewayDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    | "directory"
    | "dossier"
    | "nil_calculator"
    | "cap_gm"
    | "cognition"
    | "nextgen_tech"
    | "film_studio"
    | "autonomous_scout"
    | "combine_laser"
    | "parent_portal"
    | "csv_importer"
  >("directory");

  const [activeUser, setActiveUser] = useState(MOCK_MULTI_TENANT_USERS[0]);

  // Copy toast notification state
  const [copyToast, setCopyToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setCopyToast(message);
    setTimeout(() => setCopyToast(null), 3000);
  };

  // --------------------------------------------------------------------------
  // TAB 1: COLLEGIATE DIRECTORY STATE & FILTERS
  // --------------------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState<string>("All");
  const [selectedDivision, setSelectedDivision] = useState<string>("All");

  const filteredSchools = useMemo(() => {
    return MOCK_SCHOOLS.filter((school) => {
      const matchesSearch =
        school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.mascot.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.conference.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesState = selectedState === "All" || school.state === selectedState;
      const matchesDivision = selectedDivision === "All" || school.divisionTier === selectedDivision;

      return matchesSearch && matchesState && matchesDivision;
    });
  }, [searchQuery, selectedState, selectedDivision]);

  const handleResetDirectoryFilters = () => {
    setSearchQuery("");
    setSelectedState("All");
    setSelectedDivision("All");
  };

  // --------------------------------------------------------------------------
  // TAB 2: ATHLETE DOSSIER UTILITIES
  // --------------------------------------------------------------------------
  const handleCopyScoutPackage = () => {
    const text = `
==================================================
GRIDIRON GATEWAY VERIFIED SCOUT DOSSIER
==================================================
ATHLETE: ${MOCK_ATHLETE_DOSSIER.fullName} (${MOCK_ATHLETE_DOSSIER.position})
CLASS: ${MOCK_ATHLETE_DOSSIER.gradClass} | RATING: ${MOCK_ATHLETE_DOSSIER.starRating}-Star
SCHOOL: ${MOCK_ATHLETE_DOSSIER.highSchool} (${MOCK_ATHLETE_DOSSIER.city}, ${MOCK_ATHLETE_DOSSIER.state})
STATUS: Committed to ${MOCK_ATHLETE_DOSSIER.committedSchool}

PHYSICAL SPECS:
• Height: ${MOCK_ATHLETE_DOSSIER.heightFeet}'${MOCK_ATHLETE_DOSSIER.heightInches}" | Weight: ${MOCK_ATHLETE_DOSSIER.weightLbs} lbs
• Arm Length: ${MOCK_ATHLETE_DOSSIER.armLengthInches}" | Hand Size: ${MOCK_ATHLETE_DOSSIER.handSizeInches}"

VERIFIED COMBINE METRICS:
• 40-Yard Dash: ${MOCK_ATHLETE_DOSSIER.fortyTime}s (${MOCK_ATHLETE_DOSSIER.fortyTimingType})
• Shuttle: ${MOCK_ATHLETE_DOSSIER.shuttleTime}s | Vertical: ${MOCK_ATHLETE_DOSSIER.verticalJump}"
• Bench Press: ${MOCK_ATHLETE_DOSSIER.benchPress} lbs | Squat Max: ${MOCK_ATHLETE_DOSSIER.squatMax} lbs

ACADEMICS & COMPLIANCE:
• Core NCAA GPA: ${MOCK_ATHLETE_DOSSIER.coreGpa} | SAT: ${MOCK_ATHLETE_DOSSIER.satScore}
• NCAA Eligibility ID: ${MOCK_ATHLETE_DOSSIER.ncaaEligibilityId}

FILM & SOCIAL:
• HUDL: ${MOCK_ATHLETE_DOSSIER.hudlUrl}
• Twitter: ${MOCK_ATHLETE_DOSSIER.twitterHandle}

GRIDIRON VERIFIED RECORD # ${MOCK_ATHLETE_DOSSIER.id}
==================================================
`.trim();

    navigator.clipboard.writeText(text);
    showToast("Scout Package copied to clipboard!");
  };

  const handlePrintDossier = () => {
    window.print();
  };

  // --------------------------------------------------------------------------
  // TAB 3: NIL VALUATION ESTIMATOR CALCULATOR STATE
  // --------------------------------------------------------------------------
  const [followerCount, setFollowerCount] = useState<number>(45000);
  const [nilStarRating, setNilStarRating] = useState<number>(5);
  const [positionTier, setPositionTier] = useState<"QB" | "SKILL" | "TRENCH" | "SPECIALIST">("QB");
  const [conferencePower, setConferencePower] = useState<"Power4" | "GroupOf5" | "FCS_D2">("Power4");
  const [engagementRate, setEngagementRate] = useState<number>(4.2);

  const nilValuation = useMemo(() => {
    // Base valuation by star rating
    let baseVal = 20000;
    if (nilStarRating === 3) baseVal = 45000;
    if (nilStarRating === 4) baseVal = 180000;
    if (nilStarRating === 5) baseVal = 550000;

    // Social follower multiplier ($1.80 per follower baseline adjusted by engagement)
    const socialValue = followerCount * 1.8 * (engagementRate / 3.0);

    // Position Demand Multiplier
    let posMult = 1.0;
    if (positionTier === "QB") posMult = 1.85;
    if (positionTier === "SKILL") posMult = 1.35; // WR, EDGE, RB, CB
    if (positionTier === "TRENCH") posMult = 1.20; // OT, DT, LB
    if (positionTier === "SPECIALIST") posMult = 0.65; // K, P, LS

    // Conference Market Size Multiplier
    let confMult = 1.0;
    if (conferencePower === "Power4") confMult = 1.6;
    if (conferencePower === "GroupOf5") confMult = 0.75;
    if (conferencePower === "FCS_D2") confMult = 0.35;

    const totalEstimated = Math.round((baseVal + socialValue) * posMult * confMult);
    const lowRange = Math.round(totalEstimated * 0.85);
    const highRange = Math.round(totalEstimated * 1.25);

    return {
      total: totalEstimated,
      low: lowRange,
      high: highRange,
      breakdown: {
        collectivePayout: Math.round(totalEstimated * 0.55),
        socialEndorsements: Math.round(totalEstimated * 0.30),
        merchAndLicensing: Math.round(totalEstimated * 0.15),
      },
    };
  }, [followerCount, nilStarRating, positionTier, conferencePower, engagementRate]);

  // Division Tier Badge Helper
  const renderDivisionBadge = (tier: DivisionTier) => {
    switch (tier) {
      case "FBS_P4":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
            FBS Power 4
          </span>
        );
      case "FBS_G5":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-black uppercase tracking-wider">
            FBS Group of 5
          </span>
        );
      case "FCS":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase tracking-wider">
            FCS Division I
          </span>
        );
      case "D2":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-black uppercase tracking-wider">
            NCAA Division II
          </span>
        );
      case "D3":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-black uppercase tracking-wider">
            NCAA Division III
          </span>
        );
      case "JUCO":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-black uppercase tracking-wider">
            JUCO / NAIA
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 pb-16">
      {/* MULTI-TENANT ROLE SWITCHER BAR */}
      <MultiTenantRoleSelector
        activeUser={activeUser}
        onSelectUser={(user) => setActiveUser(user)}
      />

      {/* Toast Notification */}
      {copyToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-400 text-slate-950 font-black px-4 py-3 rounded-2xl shadow-2xl border border-emerald-300 flex items-center gap-2 text-xs animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-slate-950 shrink-0" />
          <span>{copyToast}</span>
        </div>
      )}

      {/* Embedded Print Stylesheet for High-Contrast White Page Scout Dossier Output */}
      <style>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only-container {
            border: 2px solid #000 !important;
            background: #fff !important;
            color: #000 !important;
            box-shadow: none !important;
          }
          .print-text-dark {
            color: #000000 !important;
          }
        }
      `}</style>

      {/* TOP NAVIGATION HEADER */}
      <header className="no-print sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-base tracking-wider uppercase">
                  Gridiron<span className="text-emerald-400">Gateway</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-black uppercase">
                  Client MVP
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Collegiate Scouting, Verified Athlete Dossier & NIL Command Center
              </p>
            </div>
          </div>

          {/* TAB SWITCHER NAV BUTTONS */}
          <nav className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab("directory")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === "directory"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span className="hidden md:inline">Collegiate Directory</span>
            </button>

            <button
              onClick={() => setActiveTab("dossier")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === "dossier"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span className="hidden md:inline">Athlete Dossier</span>
            </button>

            <button
              onClick={() => setActiveTab("nil_calculator")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === "nil_calculator"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span className="hidden md:inline">NIL Estimator</span>
            </button>

            {activeUser.permissions.canAccessCapGM && (
              <button
                onClick={() => setActiveTab("cap_gm")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                  activeTab === "cap_gm"
                    ? "bg-emerald-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <DollarSign className="w-4 h-4 text-emerald-300" />
                <span className="hidden md:inline">CapGM $20.5M</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab("film_studio")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === "film_studio"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Film className="w-4 h-4 text-indigo-300" />
              <span className="hidden md:inline">AI Film Tagging</span>
            </button>

            <button
              onClick={() => setActiveTab("autonomous_scout")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === "autonomous_scout"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Bot className="w-4 h-4 text-emerald-300" />
              <span className="hidden md:inline">Auto Scouting</span>
            </button>

            <button
              onClick={() => setActiveTab("combine_laser")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === "combine_laser"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Zap className="w-4 h-4 text-sky-300" />
              <span className="hidden md:inline">Laser Combine</span>
            </button>

            <button
              onClick={() => setActiveTab("parent_portal")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === "parent_portal"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-rose-300" />
              <span className="hidden md:inline">Parent Portal</span>
            </button>

            <button
              onClick={() => setActiveTab("csv_importer")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === "csv_importer"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Database className="w-4 h-4 text-amber-300" />
              <span className="hidden md:inline">CSV Import</span>
            </button>

            <button
              onClick={() => setActiveTab("cognition")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === "cognition"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Brain className="w-4 h-4 text-purple-300" />
              <span className="hidden md:inline">Cognition IQ</span>
            </button>

            <button
              onClick={() => setActiveTab("nextgen_tech")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === "nextgen_tech"
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Sparkles className="w-4 h-4 text-sky-300" />
              <span className="hidden md:inline">Tech Hub</span>
            </button>
          </nav>
        </div>
      </header>

      {/* LATEST COMMITS TICKER BAR */}
      <LatestCommitsTickerBar />

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* ==================================================================== */}
        {/* TAB 1: COLLEGIATE DIRECTORY                                           */}
        {/* ==================================================================== */}
        {activeTab === "directory" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header Banner */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 relative overflow-hidden shadow-2xl">
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-emerald-400" />
                    <h1 className="text-2xl font-black text-white uppercase tracking-tight">
                      Collegiate Program Directory
                    </h1>
                  </div>
                  <p className="text-xs text-slate-400 max-w-2xl">
                    Search and filter verified college football programs across Power 4, Group of 5, FCS, D2, and JUCO tiers. Access recruiting contacts, coaching phones, and academic majors.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 text-xs font-black">
                    {filteredSchools.length} Programs Found
                  </span>
                </div>
              </div>

              {/* SEARCH & FILTER CONTROLS BAR */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-slate-800">
                {/* Search Input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by school, mascot, or conference..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* State Select */}
                <div className="relative">
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500/60 appearance-none cursor-pointer"
                  >
                    <option value="All">All States</option>
                    <option value="TX">Texas (TX)</option>
                    <option value="GA">Georgia (GA)</option>
                    <option value="OH">Ohio (OH)</option>
                    <option value="OR">Oregon (OR)</option>
                    <option value="NC">North Carolina (NC)</option>
                    <option value="ND">North Dakota (ND)</option>
                    <option value="MI">Michigan (MI)</option>
                    <option value="FL">Florida (FL)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Division Tier Select */}
                <div className="relative">
                  <select
                    value={selectedDivision}
                    onChange={(e) => setSelectedDivision(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500/60 appearance-none cursor-pointer"
                  >
                    <option value="All">All Divisions</option>
                    <option value="FBS_P4">FBS Power 4</option>
                    <option value="FBS_G5">FBS Group of 5</option>
                    <option value="FCS">FCS Division I</option>
                    <option value="D2">NCAA Division II</option>
                    <option value="JUCO">JUCO / NAIA</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* DIRECTORY GRID OR EMPTY STATE */}
            {filteredSchools.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-xl">
                <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                  <Building2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white">No Programs Found</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    We couldn't find any college programs matching your active search and division filters.
                  </p>
                </div>
                <button
                  onClick={handleResetDirectoryFilters}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 mx-auto transition-all shadow-lg shadow-emerald-500/20"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredSchools.map((school) => (
                  <div
                    key={school.id}
                    className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-3xl p-5 space-y-4 transition-all hover:shadow-2xl hover:shadow-emerald-500/5 group flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={school.logoUrl}
                            alt={school.name}
                            className="w-12 h-12 rounded-2xl object-cover bg-slate-950 p-1 border border-slate-800 shrink-0 group-hover:border-emerald-500/50"
                          />
                          <div>
                            <h3 className="font-black text-white text-base group-hover:text-emerald-300 transition-colors leading-tight">
                              {school.name}
                            </h3>
                            <p className="text-xs text-slate-400 font-semibold">
                              {school.mascot} • {school.conference}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Division Badge & Location */}
                      <div className="flex items-center justify-between pt-1">
                        {renderDivisionBadge(school.divisionTier)}
                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          {school.city}, {school.state}
                        </span>
                      </div>

                      {/* Head Coach */}
                      <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 text-xs space-y-1">
                        <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                          Head Football Coach
                        </span>
                        <p className="font-extrabold text-white">{school.headCoach}</p>
                      </div>

                      {/* Program Highlights */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider block">
                          Program Highlights
                        </span>
                        <ul className="space-y-1 text-xs text-slate-300">
                          {school.programHighlights.map((hl, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span className="line-clamp-1">{hl}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Recruiting Contact Buttons */}
                    <div className="pt-3 border-t border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <a
                          href={`mailto:${school.primaryRecruitingEmail}`}
                          className="flex items-center gap-1.5 text-emerald-400 hover:underline font-bold"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[180px]">{school.primaryRecruitingEmail}</span>
                        </a>
                        <span className="flex items-center gap-1 font-bold text-slate-300">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          {school.coachingPhone}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: VERIFIED ATHLETE DOSSIER                                      */}
        {/* ==================================================================== */}
        {activeTab === "dossier" && (
          <div className="space-y-6 animate-fadeIn">
            {/* ACTION BAR FOR PRINT & COPY */}
            <div className="no-print bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  Verified Scout Dossier # {MOCK_ATHLETE_DOSSIER.id}
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleCopyScoutPackage}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 text-emerald-400 font-black text-xs flex items-center justify-center gap-2 transition-all hover:bg-emerald-500/10"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Scout Package</span>
                </button>

                <button
                  onClick={handlePrintDossier}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Dossier</span>
                </button>
              </div>
            </div>

            {/* PRINTABLE DOSSIER CONTAINER */}
            <div className="print-only-container bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
              {/* ATHLETE HERO HEADER */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-black">
                      {MOCK_ATHLETE_DOSSIER.position} / {MOCK_ATHLETE_DOSSIER.secondaryPosition}
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-black">
                      Class of {MOCK_ATHLETE_DOSSIER.gradClass}
                    </span>
                    <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black">
                      <span>{MOCK_ATHLETE_DOSSIER.starRating} Stars</span>
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    </div>
                  </div>

                  <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase print-text-dark">
                      {MOCK_ATHLETE_DOSSIER.fullName}
                    </h1>
                    <p className="text-sm text-slate-400 font-semibold flex items-center gap-2 mt-1">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      {MOCK_ATHLETE_DOSSIER.highSchool} • {MOCK_ATHLETE_DOSSIER.city}, {MOCK_ATHLETE_DOSSIER.state}
                    </p>
                  </div>
                </div>

                {/* Commitment Status Card */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-right space-y-1 shrink-0">
                  <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider block">
                    Commitment Status
                  </span>
                  <div className="flex items-center justify-end gap-2 text-emerald-400 font-black text-base">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Committed to {MOCK_ATHLETE_DOSSIER.committedSchool}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium block">
                    NCAA ID: {MOCK_ATHLETE_DOSSIER.ncaaEligibilityId}
                  </span>
                </div>
              </div>

              {/* ATHLETE PHYSICAL SPECS & COMBINE METRICS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Physical & Biometric Measurements */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Physical & Biometric Specs
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-0.5">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase">Height / Weight</span>
                      <p className="text-sm font-black text-white">
                        {MOCK_ATHLETE_DOSSIER.heightFeet}'{MOCK_ATHLETE_DOSSIER.heightInches}" / {MOCK_ATHLETE_DOSSIER.weightLbs} lbs
                      </p>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-0.5">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase">Arm / Hand Size</span>
                      <p className="text-sm font-black text-white">
                        {MOCK_ATHLETE_DOSSIER.armLengthInches}" / {MOCK_ATHLETE_DOSSIER.handSizeInches}"
                      </p>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-0.5 col-span-2">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase">Season Highlights</span>
                      <p className="text-xs font-bold text-emerald-400">{MOCK_ATHLETE_DOSSIER.seasonStats}</p>
                    </div>
                  </div>
                </div>

                {/* Verified Combine Testing Stats */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-2">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    Verified Combine Metrics
                  </h3>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-0.5">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase">40-Yard Dash</span>
                      <p className="text-sm font-black text-cyan-400">
                        {MOCK_ATHLETE_DOSSIER.fortyTime}s <span className="text-[9px] text-slate-500">({MOCK_ATHLETE_DOSSIER.fortyTimingType})</span>
                      </p>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-0.5">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase">20y Shuttle</span>
                      <p className="text-sm font-black text-white">{MOCK_ATHLETE_DOSSIER.shuttleTime}s</p>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-0.5">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase">Vertical Jump</span>
                      <p className="text-sm font-black text-white">{MOCK_ATHLETE_DOSSIER.verticalJump}"</p>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-0.5 col-span-1">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase">Bench Press</span>
                      <p className="text-sm font-black text-white">{MOCK_ATHLETE_DOSSIER.benchPress} lbs</p>
                    </div>

                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-0.5 col-span-2">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase">Squat Max</span>
                      <p className="text-sm font-black text-white">{MOCK_ATHLETE_DOSSIER.squatMax} lbs</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACADEMICS & HONORS STRIP */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-2">
                    <GraduationCap className="w-4 h-4 text-purple-400" />
                    Academic Credentials
                  </h3>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] font-extrabold text-slate-500 block">Overall GPA</span>
                      <span className="text-base font-black text-purple-300">{MOCK_ATHLETE_DOSSIER.gpa}</span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] font-extrabold text-slate-500 block">Core NCAA GPA</span>
                      <span className="text-base font-black text-emerald-400">{MOCK_ATHLETE_DOSSIER.coreGpa}</span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[10px] font-extrabold text-slate-500 block">SAT Score</span>
                      <span className="text-base font-black text-white">{MOCK_ATHLETE_DOSSIER.satScore}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    Accolades & Honors
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {MOCK_ATHLETE_DOSSIER.honors.map((hnr, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{hnr}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* VERBAL OFFERS TIMELINE */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Scholarship Offer Timeline
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {MOCK_ATHLETE_DOSSIER.offers.map((offer) => (
                    <div
                      key={offer.id}
                      className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-2 relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <img
                          src={offer.logoUrl}
                          alt={offer.schoolName}
                          className="w-8 h-8 rounded-lg object-cover bg-slate-950 p-0.5 border border-slate-800"
                        />
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded ${
                            offer.status === "Committed"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          {offer.status}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-extrabold text-white text-xs">{offer.schoolName}</h4>
                        <span className="text-[10px] text-slate-400 font-medium">{offer.conference}</span>
                      </div>

                      <div className="pt-1 border-t border-slate-800 text-[10px] text-slate-500 font-bold flex justify-between">
                        <span>{offer.offerType} Offer</span>
                        <span>{offer.offerDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: NIL VALUATION ESTIMATOR                                       */}
        {/* ==================================================================== */}
        {activeTab === "nil_calculator" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header Banner */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-2 relative overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2">
                <Calculator className="w-6 h-6 text-emerald-400" />
                <h1 className="text-2xl font-black text-white uppercase tracking-tight">
                  NIL Valuation Estimator
                </h1>
              </div>
              <p className="text-xs text-slate-400 max-w-2xl">
                Interactive Name, Image, and Likeness (NIL) annual market value calculator. Adjust social reach, star rating, position demand, and market tier to generate real-time projections.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* SLIDERS & INPUTS PANEL */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
                <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-slate-800">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  Valuation Model Parameters
                </h2>

                {/* Slider 1: Social Media Followers */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-extrabold">
                    <span className="text-slate-300 uppercase">Social Media Followers (Instagram / X / TikTok)</span>
                    <span className="text-emerald-400 font-black text-sm">
                      {followerCount.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">Followers</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={2000}
                    max={250000}
                    step={1000}
                    value={followerCount}
                    onChange={(e) => setFollowerCount(Number(e.target.value))}
                    className="w-full accent-emerald-400 bg-slate-950 rounded-lg cursor-pointer h-2"
                  />
                  <div className="flex justify-between text-[10px] font-extrabold text-slate-500">
                    <span>2k</span>
                    <span>50k</span>
                    <span>100k</span>
                    <span>250k+</span>
                  </div>
                </div>

                {/* Slider 2: Star Rating */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-extrabold">
                    <span className="text-slate-300 uppercase">Prospect Star Rating</span>
                    <span className="text-amber-400 font-black text-sm flex items-center gap-1">
                      {nilStarRating} Stars <Star className="w-3.5 h-3.5 fill-amber-400" />
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setNilStarRating(star)}
                        className={`py-2 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center gap-1 ${
                          nilStarRating === star
                            ? "bg-amber-400/20 border-amber-400/50 text-amber-300 shadow-sm"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        <span>{star} Stars</span>
                        <Star className="w-3 h-3 fill-amber-400" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Select 3: Position Demand Tier */}
                <div className="space-y-2">
                  <span className="text-xs font-extrabold text-slate-300 uppercase block">
                    Position Market Demand
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: "Quarterback (QB)", value: "QB" },
                      { label: "Skill (WR/EDGE/RB/CB)", value: "SKILL" },
                      { label: "Trench (OT/DT/LB)", value: "TRENCH" },
                      { label: "Specialist (K/P/LS)", value: "SPECIALIST" },
                    ].map((pos) => (
                      <button
                        key={pos.value}
                        onClick={() => setPositionTier(pos.value as any)}
                        className={`p-2.5 rounded-xl text-[11px] font-extrabold border transition-all text-center ${
                          positionTier === pos.value
                            ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Select 4: Conference / Market Tier */}
                <div className="space-y-2">
                  <span className="text-xs font-extrabold text-slate-300 uppercase block">
                    Conference / Market Tier
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Power 4 Conference", value: "Power4" },
                      { label: "Group of 5 Conference", value: "GroupOf5" },
                      { label: "FCS / Division II / JUCO", value: "FCS_D2" },
                    ].map((conf) => (
                      <button
                        key={conf.value}
                        onClick={() => setConferencePower(conf.value as any)}
                        className={`p-2.5 rounded-xl text-[11px] font-extrabold border transition-all text-center ${
                          conferencePower === conf.value
                            ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        {conf.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slider 5: Engagement Rate */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between text-xs font-extrabold">
                    <span className="text-slate-300 uppercase">Social Engagement Rate</span>
                    <span className="text-purple-400 font-black text-sm">{engagementRate.toFixed(1)}%</span>
                  </div>
                  <input
                    type="range"
                    min={1.0}
                    max={10.0}
                    step={0.1}
                    value={engagementRate}
                    onChange={(e) => setEngagementRate(Number(e.target.value))}
                    className="w-full accent-purple-400 bg-slate-950 rounded-lg cursor-pointer h-2"
                  />
                </div>
              </div>

              {/* ODOMETER DISPLAY & BREAKDOWN DISPLAY PANEL */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl sticky top-24">
                <div className="space-y-1 text-center border-b border-slate-800 pb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    ESTIMATED ANNUAL NIL VALUE
                  </span>
                  {/* Odometer Style Counter Display */}
                  <div className="text-4xl sm:text-5xl font-black text-white tracking-tight flex items-center justify-center gap-1 my-2">
                    <span className="text-emerald-400">$</span>
                    <span>{nilValuation.total.toLocaleString()}</span>
                    <span className="text-xs text-slate-500 font-medium">/yr</span>
                  </div>

                  <p className="text-[11px] font-bold text-slate-400">
                    Projected Range: ${nilValuation.low.toLocaleString()} - ${nilValuation.high.toLocaleString()}
                  </p>
                </div>

                {/* Revenue Source Breakdown */}
                <div className="space-y-3">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                    Estimated Revenue Source Breakdown
                  </span>

                  <div className="space-y-2">
                    {/* Collective Payout */}
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-300">Collective Roster Revenue</span>
                        <span className="text-emerald-400 font-extrabold">
                          ${nilValuation.breakdown.collectivePayout.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: "55%" }} />
                      </div>
                    </div>

                    {/* Social Endorsements */}
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-300">Sponsored Posts & Media</span>
                        <span className="text-cyan-300 font-extrabold">
                          ${nilValuation.breakdown.socialEndorsements.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400 rounded-full" style={{ width: "30%" }} />
                      </div>
                    </div>

                    {/* Merch & Licensing */}
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-300">Jersey Sales & Licensing</span>
                        <span className="text-purple-300 font-extrabold">
                          ${nilValuation.breakdown.merchAndLicensing.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-400 rounded-full" style={{ width: "15%" }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-[11px] text-slate-400 leading-relaxed space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-200">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Gridiron Gateway Methodology</span>
                  </div>
                  <p>
                    Projections are calculated dynamically using real-time market multipliers, verified combine metrics, and active collective roster distribution guidelines.
                  </p>
                </div>
              </div>
            </div>

            {/* RECRUIT VALUATION TRENDS CHART SECTION */}
            <NILValuationChart
              followerCount={followerCount}
              engagementRate={engagementRate}
              nilStarRating={nilStarRating}
              totalValuation={nilValuation.total}
            />
          </div>
        )}
        {/* ==================================================================== */}
        {/* TAB 4: CAP GM $20.5M SALARY CAP SIMULATOR                             */}
        {/* ==================================================================== */}
        {activeTab === "cap_gm" && (
          <div className="animate-fadeIn">
            <CapGMRosterSimulator />
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 5: COGNITION SPORTS IQ & SCHEME MATCHER                          */}
        {/* ==================================================================== */}
        {activeTab === "cognition" && (
          <div className="animate-fadeIn">
            <CognitiveSchemeMatcher />
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 6: NEXT-GEN TECH HUB (TRUESPEED, BIOSCAN, RALLYSAFE)             */}
        {/* ==================================================================== */}
        {activeTab === "nextgen_tech" && (
          <div className="space-y-12 animate-fadeIn">
            <TrueSpeedModule />
            <BioScanTelemetryModule />
            <RallySafeEscrowModule />
          </div>
        )}
        {/* ==================================================================== */}
        {/* TAB 7: AI HUDL PLAY-BY-PLAY AUTOMATED FILM TAGGING STUDIO             */}
        {/* ==================================================================== */}
        {activeTab === "film_studio" && (
          <div className="animate-fadeIn">
            <AiFilmTaggingStudio />
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 8: NEXT-GEN SCOUTING & AUTONOMOUS AGENT (PHASE 4)                 */}
        {/* ==================================================================== */}
        {activeTab === "autonomous_scout" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
            <div className="lg:col-span-1">
              <AutonomousScoutingAgent />
            </div>
            <div className="lg:col-span-2">
              <CombineLaserApiModule />
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 9: VERIFIED COMBINE LASER API HUB                                 */}
        {/* ==================================================================== */}
        {activeTab === "combine_laser" && (
          <div className="animate-fadeIn">
            <CombineLaserApiModule />
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 10: PARENT & GUARDIAN COMPLIANCE CONSENT PORTAL                   */}
        {/* ==================================================================== */}
        {activeTab === "parent_portal" && (
          <div className="animate-fadeIn">
            <ParentConsentPortal />
          </div>
        )}

        {activeTab === "csv_importer" && (
          <div className="animate-fadeIn">
            <SchoolsCsvImporter />
          </div>
        )}
      </main>
    </div>
  );
};

export default GridironGatewayDashboard;
