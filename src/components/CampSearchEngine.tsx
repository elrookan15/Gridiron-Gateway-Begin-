import React, { useState } from "react";
import { CampEntry, CollegeDivision } from "../types";
import { MOCK_CAMPS } from "../data/mockData";
import {
  Search,
  Calendar,
  MapPin,
  DollarSign,
  Bookmark,
  ExternalLink,
  Star,
  Plus,
  Check,
  Filter,
  Share2,
  Sparkles,
  Trophy,
  Zap,
  Dumbbell,
  Ruler,
  Award,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

export interface CampTopPerformer {
  id: string;
  athleteName: string;
  position: string;
  highSchool: string;
  state: string;
  gradClass: number;
  campName: string;
  campCityState: string;
  metricCategory: "40_dash" | "bench_press" | "broad_jump" | "shuttle";
  metricDisplay: string;
  numericValue: number;
  accoladeBadge: string;
}

const TOP_PERFORMERS_DATA: Record<"40_dash" | "bench_press" | "broad_jump" | "shuttle", CampTopPerformer[]> = {
  "40_dash": [
    { id: "tp-40-1", athleteName: "Tariq Lawson", position: "CB", highSchool: "Duncanville HS", state: "TX", gradClass: 2026, campName: "Lone Star Mega Camp", campCityState: "Arlington, TX", metricCategory: "40_dash", metricDisplay: "4.34s (Laser)", numericValue: 4.34, accoladeBadge: "⚡ Fastest Man Award" },
    { id: "tp-40-2", athleteName: "Derrick Vance Jr.", position: "QB", highSchool: "Westlake HS", state: "TX", gradClass: 2025, campName: "Rivals Elite 5-Star Showcase", campCityState: "Dallas, TX", metricCategory: "40_dash", metricDisplay: "4.38s (Laser)", numericValue: 4.38, accoladeBadge: "🏆 Overall Showcase MVP" },
    { id: "tp-40-3", athleteName: "Malik Sanders", position: "WR", highSchool: "Buford HS", state: "GA", gradClass: 2025, campName: "Peach State Combine", campCityState: "Atlanta, GA", metricCategory: "40_dash", metricDisplay: "4.41s (Laser)", numericValue: 4.41, accoladeBadge: "🥇 Speed Demon MVP" },
    { id: "tp-40-4", athleteName: "Jaylen Brooks", position: "CB", highSchool: "St. Thomas Aquinas", state: "FL", gradClass: 2026, campName: "Sunshine State Showcase", campCityState: "Miami, FL", metricCategory: "40_dash", metricDisplay: "4.43s (Laser)", numericValue: 4.43, accoladeBadge: "⭐ All-Combine First Team" },
    { id: "tp-40-5", athleteName: "Kaelen Harris", position: "RB", highSchool: "DeSoto HS", state: "TX", gradClass: 2027, campName: "Lone Star Mega Camp", campCityState: "Arlington, TX", metricCategory: "40_dash", metricDisplay: "4.45s (Laser)", numericValue: 4.45, accoladeBadge: "🔥 Underclassmen MVP" },
  ],
  "bench_press": [
    { id: "tp-bp-1", athleteName: "Brandon 'Tank' Miller", position: "DT", highSchool: "North Shore HS", state: "TX", gradClass: 2025, campName: "Trench Warfare Big Man Camp", campCityState: "Houston, TX", metricCategory: "bench_press", metricDisplay: "32 Reps @ 225 lbs", numericValue: 32, accoladeBadge: "🏋️ Trench King MVP" },
    { id: "tp-bp-2", athleteName: "Jackson Miller", position: "OT", highSchool: "Mater Dei", state: "CA", gradClass: 2025, campName: "West Coast Lineman Showcase", campCityState: "Los Angeles, CA", metricCategory: "bench_press", metricDisplay: "30 Reps @ 225 lbs", numericValue: 30, accoladeBadge: "💪 Iron Man Award" },
    { id: "tp-bp-3", athleteName: "Trevor Williams", position: "OG", highSchool: "Allen HS", state: "TX", gradClass: 2026, campName: "Lone Star Mega Camp", campCityState: "Arlington, TX", metricCategory: "bench_press", metricDisplay: "28 Reps @ 225 lbs", numericValue: 28, accoladeBadge: "⭐ All-Combine First Team" },
    { id: "tp-bp-4", athleteName: "Damon Carter", position: "DE", highSchool: "St. Frances Academy", state: "MD", gradClass: 2025, campName: "Mid-Atlantic Combine", campCityState: "Baltimore, MD", metricCategory: "bench_press", metricDisplay: "27 Reps @ 225 lbs", numericValue: 27, accoladeBadge: "🔥 Power Pass Rusher MVP" },
    { id: "tp-bp-5", athleteName: "Marcus Thorne", position: "RB", highSchool: "IMG Academy", state: "FL", gradClass: 2026, campName: "Under Armour Elite Showcase", campCityState: "Bradenton, FL", metricCategory: "bench_press", metricDisplay: "25 Reps @ 225 lbs", numericValue: 25, accoladeBadge: "🏅 Strongest Back Award" },
  ],
  "broad_jump": [
    { id: "tp-bj-1", athleteName: "Treyvon Harris", position: "EDGE", highSchool: "St. Thomas Aquinas", state: "FL", gradClass: 2025, campName: "Sunshine State Showcase", campCityState: "Miami, FL", metricCategory: "broad_jump", metricDisplay: "10' 11\" (131 in)", numericValue: 131, accoladeBadge: "🚀 Explosive Athlete MVP" },
    { id: "tp-bj-2", athleteName: "DeAndre Ross", position: "WR", highSchool: "Katy HS", state: "TX", gradClass: 2026, campName: "Texas Speed & Agility Combine", campCityState: "Austin, TX", metricCategory: "broad_jump", metricDisplay: "10' 8\" (128 in)", numericValue: 128, accoladeBadge: "⭐ Jump & Fly Award" },
    { id: "tp-bj-3", athleteName: "Malik Sanders", position: "WR", highSchool: "Buford HS", state: "GA", gradClass: 2025, campName: "Peach State Combine", campCityState: "Atlanta, GA", metricCategory: "broad_jump", metricDisplay: "10' 7\" (127 in)", numericValue: 127, accoladeBadge: "🥇 All-Combine First Team" },
    { id: "tp-bj-4", athleteName: "Caleb O'Connor", position: "LB", highSchool: "Iowa Western CC", state: "IA", gradClass: 2025, campName: "Midwest JuCo Showcase", campCityState: "Des Moines, IA", metricCategory: "broad_jump", metricDisplay: "10' 5\" (125 in)", numericValue: 125, accoladeBadge: "💥 Top JuCo Performer" },
    { id: "tp-bj-5", athleteName: "Julian Vance", position: "S", highSchool: "Central Catholic", state: "OH", gradClass: 2026, campName: "Great Lakes Mega Camp", campCityState: "Cleveland, OH", metricCategory: "broad_jump", metricDisplay: "10' 4\" (124 in)", numericValue: 124, accoladeBadge: "🔥 Defensive Back MVP" },
  ],
  "shuttle": [
    { id: "tp-sh-1", athleteName: "Kaelen Harris", position: "RB", highSchool: "DeSoto HS", state: "TX", gradClass: 2027, campName: "Lone Star Mega Camp", campCityState: "Arlington, TX", metricCategory: "shuttle", metricDisplay: "4.01s (5-10-5)", numericValue: 4.01, accoladeBadge: "🎯 Quickness & Agility King" },
    { id: "tp-sh-2", athleteName: "Tariq Lawson", position: "CB", highSchool: "Duncanville HS", state: "TX", gradClass: 2026, campName: "Texas Speed & Agility Combine", campCityState: "Austin, TX", metricCategory: "shuttle", metricDisplay: "4.05s (5-10-5)", numericValue: 4.05, accoladeBadge: "⚡ LockDown DB Award" },
    { id: "tp-sh-3", athleteName: "Derrick Vance Jr.", position: "QB", highSchool: "Westlake HS", state: "TX", gradClass: 2025, campName: "Elite 11 Regional Showcase", campCityState: "Frisco, TX", metricCategory: "shuttle", metricDisplay: "4.08s (5-10-5)", numericValue: 4.08, accoladeBadge: "🏆 Golden Arm MVP" },
    { id: "tp-sh-4", athleteName: "Jaylen Brooks", position: "CB", highSchool: "St. Thomas Aquinas", state: "FL", gradClass: 2026, campName: "Sunshine State Showcase", campCityState: "Miami, FL", metricCategory: "shuttle", metricDisplay: "4.11s (5-10-5)", numericValue: 4.11, accoladeBadge: "⭐ All-Combine First Team" },
    { id: "tp-sh-5", athleteName: "Marcus Thorne", position: "RB", highSchool: "IMG Academy", state: "FL", gradClass: 2026, campName: "Under Armour Elite Showcase", campCityState: "Bradenton, FL", metricCategory: "shuttle", metricDisplay: "4.14s (5-10-5)", numericValue: 4.14, accoladeBadge: "🔥 Elusive Back Award" },
  ]
};

export const CampSearchEngine: React.FC = () => {
  const [camps, setCamps] = useState<CampEntry[]>(MOCK_CAMPS);
  const [searchQuery, setSearchQuery] = useState("");
  const [zipCodeFilter, setZipCodeFilter] = useState("");
  const [stateFilter, setStateFilter] = useState<string>("ALL");
  const [divisionFilter, setDivisionFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("ALL");
  const [maxCost, setMaxCost] = useState<number>(250);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  // Top Performers Tab Category
  const [activeLeaderboardMetric, setActiveLeaderboardMetric] = useState<"40_dash" | "bench_press" | "broad_jump" | "shuttle">("40_dash");

  // Review submission state modal
  const [selectedCampForReview, setSelectedCampForReview] = useState<CampEntry | null>(null);
  const [userRating, setUserRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>("");
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);

  // Toggle Bookmark
  const toggleBookmark = (id: string) => {
    setCamps((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isBookmarked: !c.isBookmarked } : c))
    );
  };

  const filteredCamps = camps.filter((camp) => {
    if (showBookmarksOnly && !camp.isBookmarked) return false;
    if (divisionFilter !== "ALL" && camp.division !== divisionFilter) return false;
    if (typeFilter !== "ALL" && camp.campType !== typeFilter) return false;
    if (stateFilter !== "ALL" && camp.state.toUpperCase() !== stateFilter.toUpperCase()) return false;
    if (camp.cost > maxCost) return false;
    if (zipCodeFilter.trim() && !camp.zipCode.startsWith(zipCodeFilter.trim())) return false;

    // Date Range Filtering
    if (dateRangeFilter !== "ALL") {
      const campDate = new Date(camp.date);
      const now = new Date("2026-08-11");
      if (dateRangeFilter === "NEXT_30") {
        const next30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        if (campDate < now || campDate > next30Days) return false;
      } else if (dateRangeFilter === "NEXT_60") {
        const next60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
        if (campDate < now || campDate > next60Days) return false;
      } else if (dateRangeFilter === "SUMMER_2026") {
        if (campDate < new Date("2026-06-01") || campDate > new Date("2026-08-31")) return false;
      } else if (dateRangeFilter === "FALL_2026") {
        if (campDate < new Date("2026-09-01") || campDate > new Date("2026-11-30")) return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        camp.name.toLowerCase().includes(q) ||
        camp.host.toLowerCase().includes(q) ||
        camp.city.toLowerCase().includes(q) ||
        camp.state.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Export .ics calendar file
  const handleAddToCalendar = (camp: CampEntry) => {
    const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Gridiron Gateway//Camp Calendar//EN
BEGIN:VEVENT
SUMMARY:${camp.name}
DESCRIPTION:${camp.description}
LOCATION:${camp.city}, ${camp.state} ${camp.zipCode}
DTSTART:${camp.date.replace(/-/g, "")}T090000Z
DTEND:${camp.date.replace(/-/g, "")}T150000Z
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `${camp.name.replace(/[^a-z0-9]/gi, "_")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampForReview) return;

    setCamps((prev) =>
      prev.map((c) => {
        if (c.id === selectedCampForReview.id) {
          const newTotal = c.totalReviews + 1;
          const newRating = Number(((c.rating * c.totalReviews + userRating) / newTotal).toFixed(1));
          return { ...c, rating: newRating, totalReviews: newTotal };
        }
        return c;
      })
    );

    setReviewSubmitted(true);
    setTimeout(() => {
      setReviewSubmitted(false);
      setSelectedCampForReview(null);
      setReviewText("");
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 text-white space-y-8">
      {/* Title Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Calendar className="w-3.5 h-3.5" /> College Showcase & Combine Search Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Upcoming College Camps & Combines
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Discover mega-camps, position skill showcases, and laser-timed regional combines nationwide.
          </p>
        </div>

        <button
          onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs border transition-all shrink-0 ${
            showBookmarksOnly
              ? "bg-amber-500 text-slate-950 border-amber-400 shadow-lg"
              : "bg-slate-900 text-amber-400 border-slate-800 hover:bg-slate-800"
          }`}
        >
          <Bookmark className="w-4 h-4 fill-current" />
          {showBookmarksOnly ? "Showing Bookmarked Camps" : "View Saved Camps"}
        </button>
      </div>

      {/* FILTER CONTROL BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <span className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-amber-400" /> Search & Filter Parameters
          </span>
          <button
            onClick={() => {
              setSearchQuery("");
              setZipCodeFilter("");
              setStateFilter("ALL");
              setDivisionFilter("ALL");
              setTypeFilter("ALL");
              setDateRangeFilter("ALL");
              setMaxCost(250);
            }}
            className="text-[11px] text-slate-400 hover:text-white underline font-semibold"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search camp, host, city..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* State Dropdown Filter */}
          <div>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="ALL">All States</option>
              <option value="TX">Texas (TX)</option>
              <option value="GA">Georgia (GA)</option>
              <option value="FL">Florida (FL)</option>
              <option value="CA">California (CA)</option>
              <option value="OH">Ohio (OH)</option>
              <option value="IA">Iowa (IA)</option>
              <option value="AL">Alabama (AL)</option>
              <option value="NC">North Carolina (NC)</option>
            </select>
          </div>

          {/* Camp Type Dropdown Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="ALL">All Camp Types</option>
              <option value="Mega Camp">Mega Camps (Multi-College)</option>
              <option value="Combine / Showcase">Laser Combine / Showcase</option>
              <option value="Position Skills">Position Skills Camps</option>
              <option value="Specialist K/P Camp">Kicker / Punter Camps</option>
            </select>
          </div>

          {/* Date Range Dropdown Filter */}
          <div>
            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="ALL">All Upcoming Dates</option>
              <option value="NEXT_30">Next 30 Days</option>
              <option value="NEXT_60">Next 60 Days</option>
              <option value="SUMMER_2026">Summer 2026</option>
              <option value="FALL_2026">Fall 2026</option>
            </select>
          </div>

          {/* Host Division */}
          <div>
            <select
              value={divisionFilter}
              onChange={(e) => setDivisionFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Host Divisions</option>
              <option value="FBS">FBS (NCAA Division I)</option>
              <option value="FCS">FCS (Division I AA)</option>
              <option value="DII">Division II</option>
              <option value="DIII">Division III</option>
              <option value="Independent Showcase">Independent / Rivals / UA</option>
            </select>
          </div>
        </div>

        {/* Max Cost Range */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-slate-400 font-semibold shrink-0">Max Registration Cost:</span>
            <input
              type="range"
              min={0}
              max={300}
              step={25}
              value={maxCost}
              onChange={(e) => setMaxCost(Number(e.target.value))}
              className="w-48 accent-emerald-500"
            />
            <span className="font-bold text-amber-400">
              {maxCost === 0 ? "FREE ONLY" : `$${maxCost}`}
            </span>
          </div>

          <div className="text-slate-400 text-xs">
            Showing <strong className="text-white">{filteredCamps.length}</strong> upcoming camps & combines
          </div>
        </div>
      </div>

      {/* CAMPS LISTING CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCamps.length === 0 ? (
          <div className="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            No camps matched your current search filters. Try adjusting price or division settings.
          </div>
        ) : (
          filteredCamps.map((camp) => (
            <div
              key={camp.id}
              className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all group"
            >
              <div>
                {/* Header Row: Type Badge, Title & Bookmark */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase tracking-wider">
                        {camp.campType}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950 text-slate-300 border border-slate-800">
                        {camp.division}
                      </span>
                    </div>

                    <h2 className="font-extrabold text-lg text-white group-hover:text-emerald-400 transition-colors leading-snug">
                      {camp.name}
                    </h2>
                    <p className="text-xs text-slate-400 font-medium">Hosted by: {camp.host}</p>
                  </div>

                  <button
                    onClick={() => toggleBookmark(camp.id)}
                    className={`p-2 rounded-xl border transition-all ${
                      camp.isBookmarked
                        ? "bg-amber-500 text-slate-950 border-amber-400"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white"
                    }`}
                  >
                    <Bookmark className="w-4 h-4 fill-current" />
                  </button>
                </div>

                {/* Location & Date Details */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 block font-semibold">Date & Time</span>
                      <strong className="text-white">{camp.date}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 block font-semibold">Location</span>
                      <strong className="text-white">{camp.city}, {camp.state} ({camp.zipCode})</strong>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">{camp.description}</p>

                {/* Features List */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {camp.features.map((feat, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-medium text-slate-300 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" /> {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer Row: Price, Rating & Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Cost</span>
                    <span className="text-sm font-black text-amber-400">
                      {camp.cost === 0 ? "FREE (Invite)" : `$${camp.cost}`}
                    </span>
                  </div>

                  <div className="pl-3 border-l border-slate-800">
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {camp.rating}
                    </div>
                    <button
                      onClick={() => setSelectedCampForReview(camp)}
                      className="text-[10px] text-slate-400 hover:text-cyan-400 underline"
                    >
                      {camp.totalReviews} Reviews
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleAddToCalendar(camp)}
                    className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all"
                  >
                    + Add to Calendar
                  </button>

                  <a
                    href={camp.registerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-1"
                  >
                    Register <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* REGIONAL COMBINE & SHOWCASE TOP PERFORMERS LEADERBOARD */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border-2 border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <Trophy className="w-3 h-3 text-amber-400" /> Verified Combine Record Hall
              </span>
              <span className="text-xs text-slate-400 font-bold">Top 5 Performer Leaderboards</span>
            </div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              Camp, Combine & Showcase Top Performers
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified top athletic benchmarks from completed regional mega camps, showcases & laser-timed combines.
            </p>
          </div>

          {/* Metric Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveLeaderboardMetric("40_dash")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                activeLeaderboardMetric === "40_dash"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> 40-Yard Dash
            </button>

            <button
              onClick={() => setActiveLeaderboardMetric("bench_press")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                activeLeaderboardMetric === "bench_press"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Dumbbell className="w-3.5 h-3.5" /> Bench Press
            </button>

            <button
              onClick={() => setActiveLeaderboardMetric("broad_jump")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                activeLeaderboardMetric === "broad_jump"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Ruler className="w-3.5 h-3.5" /> Broad Jump
            </button>

            <button
              onClick={() => setActiveLeaderboardMetric("shuttle")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                activeLeaderboardMetric === "shuttle"
                  ? "bg-amber-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" /> 5-10-5 Shuttle
            </button>
          </div>
        </div>

        {/* Top 5 Performers Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {TOP_PERFORMERS_DATA[activeLeaderboardMetric].map((performer, idx) => {
            const rank = idx + 1;
            return (
              <div
                key={performer.id}
                className="bg-slate-950/90 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 flex flex-col justify-between transition-all relative overflow-hidden group shadow-xl"
              >
                {/* Top Rank Badge & Accolade */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center border shadow-md ${
                        rank === 1
                          ? "bg-amber-500 text-slate-950 border-amber-400 shadow-amber-500/20"
                          : rank === 2
                          ? "bg-slate-300 text-slate-950 border-white"
                          : rank === 3
                          ? "bg-amber-800 text-amber-100 border-amber-600"
                          : "bg-slate-900 text-slate-400 border-slate-800"
                      }`}
                    >
                      #{rank}
                    </span>

                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      {performer.accoladeBadge}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-white group-hover:text-amber-400 transition-colors">
                    {performer.athleteName}
                  </h3>

                  <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                    {performer.position} • {performer.highSchool} ({performer.state})
                  </p>

                  <p className="text-[10px] text-slate-500 font-medium">
                    Class of {performer.gradClass}
                  </p>
                </div>

                {/* Performance Metric & Event Display */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1">
                  <div className="text-center bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Verified Result</span>
                    <span className="text-sm font-black text-lime-400 font-mono">
                      {performer.metricDisplay}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400 text-center truncate pt-1" title={performer.campName}>
                    📍 {performer.campName}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* USER CAMP REVIEW & RATING MODAL */}
      {selectedCampForReview && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setSelectedCampForReview(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold"
            >
              ✕
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> Submit Review for {selectedCampForReview.name}
            </h3>

            {reviewSubmitted ? (
              <div className="p-4 bg-emerald-950 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-bold text-center">
                ✓ Review successfully submitted! Thank you for helping fellow athletes.
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Your Rating (1 to 5 Stars)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setUserRating(star)}
                        className={`p-2 rounded-xl border text-sm font-bold ${
                          userRating >= star
                            ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                            : "bg-slate-950 text-slate-500 border-slate-800"
                        }`}
                      >
                        ★ {star}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Camp Experience & Coaching Review</label>
                  <textarea
                    rows={3}
                    required
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share feedback on college coach exposure, laser 40 timing accuracy, and overall organization..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCampForReview(null)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl"
                  >
                    Post Review
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
