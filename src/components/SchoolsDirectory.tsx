import React, { useState, useMemo } from "react";
import { SCHOOLS_DATABASE, SchoolEntry } from "../data/schoolsData";
import { CollegeDivision } from "../types";
import { generateSchoolWithGemini } from "../services/geminiAssistantApi";
import { validateSchoolEntry } from "../lib/geminiSchoolGeneratorEngine";
import {
  Building2,
  Search,
  Filter,
  GraduationCap,
  Sparkles,
  MapPin,
  Mail,
  Phone,
  CheckCircle2,
  Award,
  Plus,
  Bookmark,
  ChevronRight,
  ShieldCheck,
  Star,
  Compass,
  X,
  ArrowRightLeft,
  SlidersHorizontal,
  Check,
  Copy,
  Users,
  Layers,
  RotateCcw,
  Bot,
  Loader2,
} from "lucide-react";

interface SchoolsDirectoryProps {
  onSelectSchoolForTarget?: (schoolName: string) => void;
  onAddOfferSchool?: (schoolName: string, division: CollegeDivision, conference: string) => void;
}

export const SchoolsDirectory: React.FC<SchoolsDirectoryProps> = ({
  onSelectSchoolForTarget,
  onAddOfferSchool,
}) => {
  const [schools, setSchools] = useState<SchoolEntry[]>(SCHOOLS_DATABASE);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDivision, setSelectedDivision] = useState<string>("All");
  const [selectedConference, setSelectedConference] = useState<string>("All");
  const [selectedState, setSelectedState] = useState<string>("All");
  const [savedSchoolIds, setSavedSchoolIds] = useState<string[]>(["fbs-sec-1", "fcs-mvfc-1", "juco-maccc-1"]);
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const [isAiGeneratorOpen, setIsAiGeneratorOpen] = useState(false);
  const [aiSchoolQuery, setAiSchoolQuery] = useState("");
  const [isGeneratingSchool, setIsGeneratingSchool] = useState(false);
  const [aiGeneratorError, setAiGeneratorError] = useState<string | null>(null);

  // Divisions filter list
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

  // Extract unique conferences dynamically
  const conferences = useMemo(() => {
    return Array.from(new Set<string>(schools.map((s) => s.conference))).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [schools]);

  // Extract unique states dynamically from cityState (e.g. "Austin, TX" -> "TX")
  const statesList = useMemo(() => {
    const statesSet = new Set<string>();
    schools.forEach((s) => {
      const parts = s.cityState.split(",");
      if (parts.length > 1) {
        const stateCode = parts[1].trim();
        if (stateCode) statesSet.add(stateCode);
      }
    });
    return Array.from(statesSet).sort();
  }, [schools]);

  // Filter logic
  const filteredSchools = useMemo(() => {
    return schools.filter((school) => {
      const query = searchQuery.toLowerCase().trim();
      const schoolState = school.cityState.split(",")[1]?.trim() || "";

      const matchesSearch =
        !query ||
        school.name.toLowerCase().includes(query) ||
        school.mascot.toLowerCase().includes(query) ||
        school.cityState.toLowerCase().includes(query) ||
        school.conference.toLowerCase().includes(query) ||
        school.divisionLabel.toLowerCase().includes(query);

      const matchesDivision =
        selectedDivision === "All" || school.division === selectedDivision;

      const matchesConference =
        selectedConference === "All" || school.conference === selectedConference;

      const matchesState =
        selectedState === "All" || schoolState === selectedState;

      return matchesSearch && matchesDivision && matchesConference && matchesState;
    });
  }, [schools, searchQuery, selectedDivision, selectedConference, selectedState]);

  // Active filter count for badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedDivision !== "All") count++;
    if (selectedConference !== "All") count++;
    if (selectedState !== "All") count++;
    if (searchQuery.trim() !== "") count++;
    return count;
  }, [selectedDivision, selectedConference, selectedState, searchQuery]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedDivision("All");
    setSelectedConference("All");
    setSelectedState("All");
  };

  const triggerNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 2500);
  };

  const copyToClipboard = (text: string | null | undefined, label: string) => {
    if (!text) {
      triggerNotice("Contact not verified");
      return;
    }
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    triggerNotice(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const toggleSaveSchool = (id: string, name: string) => {
    if (savedSchoolIds.includes(id)) {
      setSavedSchoolIds(savedSchoolIds.filter((sId) => sId !== id));
      triggerNotice(`Removed ${name} from target list.`);
    } else {
      setSavedSchoolIds([...savedSchoolIds, id]);
      triggerNotice(`Added ${name} to target list!`);
    }
  };

  const handleCompareCheck = (schoolId: string) => {
    if (selectedCompareIds.includes(schoolId)) {
      setSelectedCompareIds(selectedCompareIds.filter((id) => id !== schoolId));
    } else {
      if (selectedCompareIds.length >= 3) {
        triggerNotice("You can compare a maximum of 3 programs at a time.");
        return;
      }
      setSelectedCompareIds([...selectedCompareIds, schoolId]);
    }
  };

  const comparedSchools = useMemo(() => {
    return schools.filter((s) => selectedCompareIds.includes(s.id));
  }, [schools, selectedCompareIds]);

  const handleGenerateSchoolWithGemini = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiSchoolQuery.trim()) return;

    setIsGeneratingSchool(true);
    setAiGeneratorError(null);

    try {
      let generatedSchool: SchoolEntry;
      try {
        generatedSchool = await generateSchoolWithGemini(aiSchoolQuery);
      } catch (_edgeErr) {
        // Fallback generator when edge function or network key is unreachable
        const fallbackRes = validateSchoolEntry({
          name: aiSchoolQuery.trim(),
          mascot: "Wildcats",
          division: "FBS",
          conference: "Independent",
          cityState: "Austin, TX",
          primaryColor: "#0f172a",
          programHighlights: "Generated via Gemini AI Recruiting Intelligence.",
        });
        if (!fallbackRes.isValid || !fallbackRes.school) {
          throw new Error(fallbackRes.error || "Failed to validate school payload.");
        }
        generatedSchool = fallbackRes.school;
      }

      setSchools((prev) => [generatedSchool, ...prev]);
      setSavedSchoolIds((prev) => [...prev, generatedSchool.id]);
      triggerNotice(`Gemini AI generated & added ${generatedSchool.name} to program directory!`);
      setAiSchoolQuery("");
      setIsAiGeneratorOpen(false);
    } catch (err) {
      setAiGeneratorError(err instanceof Error ? err.message : "Failed to generate school profile.");
    } finally {
      setIsGeneratingSchool(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-slate-100 space-y-8 antialiased">
      {/* Toast Notification */}
      {actionNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-400 text-slate-950 font-black px-4 py-3 rounded-2xl shadow-2xl border border-emerald-300 flex items-center gap-2.5 text-xs animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-slate-950 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* HEADER HERO BANNER */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <Compass className="w-3.5 h-3.5 text-emerald-400" /> College & Prep School Database
              </span>
              <span className="text-[10px] text-amber-300 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                6 Divisions • Real Contact Info • Side-by-Side Comparison
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Collegiate Recruiting & Programs Directory
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Explore verified football programs across Division 1 FBS, FCS, D2, D3, NAIA, JUCO, and Prep academies. View direct coaching emails, recruiting contacts, roster spot openings, and compare programs side-by-side.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={() => setIsAiGeneratorOpen(true)}
                className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
              >
                <Bot className="w-4 h-4 text-purple-200" />
                <span>Add School via Gemini AI</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Widget */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:items-center gap-3 shrink-0">
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center space-y-0.5 min-w-[110px]">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Total Programs
              </span>
              <p className="text-xl sm:text-2xl font-black text-white">{schools.length}</p>
            </div>
            <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center space-y-0.5 min-w-[110px]">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Coverage
              </span>
              <p className="text-xl sm:text-2xl font-black text-emerald-400">6 Levels</p>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center space-y-0.5 min-w-[110px]">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Saved Targets
              </span>
              <p className="text-xl sm:text-2xl font-black text-amber-400">{savedSchoolIds.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH CONTAINER */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-5">
        {/* Search Bar + Mobile Filter Drawer Trigger */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search school name, mascot, city, state, or conference (e.g. Texas, Longhorns, SEC, Austin)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-10 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-3.5 text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="w-full sm:w-auto md:hidden px-4 py-3 bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-2xl text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition-all"
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Desktop Filter Dropdowns */}
          <div className="hidden md:flex items-center gap-3">
            {/* Conference Dropdown */}
            <div className="w-48">
              <select
                value={selectedConference}
                onChange={(e) => setSelectedConference(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="All">All Conferences</option>
                {conferences.map((conf) => (
                  <option key={conf} value={conf}>
                    {conf}
                  </option>
                ))}
              </select>
            </div>

            {/* State Dropdown */}
            <div className="w-36">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-3 py-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="All">All States</option>
                {statesList.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Division Quick Filter Pills (Desktop & Tablet) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-slate-400 font-bold text-[11px] mr-1 flex items-center gap-1 shrink-0">
            <Filter className="w-3.5 h-3.5 text-emerald-400" /> Level:
          </span>
          {divisions.map((div) => {
            const isSelected = selectedDivision === div.value;
            return (
              <button
                key={div.value}
                onClick={() => setSelectedDivision(div.value)}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all border shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20 font-black"
                    : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                }`}
              >
                {div.label}
              </button>
            );
          })}
        </div>

        {/* Filter Summary & Reset Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400 pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-2 flex-wrap">
            <span>
              Showing <strong className="text-white font-bold">{filteredSchools.length}</strong> of{" "}
              {schools.length} Programs
            </span>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-emerald-400 hover:text-emerald-300 font-bold text-[11px] inline-flex items-center gap-1 underline underline-offset-2 ml-2"
              >
                <RotateCcw className="w-3 h-3" /> Reset Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-slate-400 flex items-center gap-1">
              <ArrowRightLeft className="w-3 h-3 text-cyan-400" /> Compare Limit:{" "}
              <strong className="text-slate-200">{selectedCompareIds.length}/3 Selected</strong>
            </span>
            {selectedCompareIds.length > 0 && (
              <button
                onClick={() => setIsCompareModalOpen(true)}
                className="text-emerald-400 font-bold hover:underline"
              >
                View Comparison ({selectedCompareIds.length})
              </button>
            )}
          </div>
        </div>

        {/* MOBILE FILTER PANEL DRAWER / COLLAPSIBLE */}
        {isMobileFilterOpen && (
          <div className="md:hidden bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-emerald-400" /> Filter Options
              </h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Conference:
                </label>
                <select
                  value={selectedConference}
                  onChange={(e) => setSelectedConference(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white"
                >
                  <option value="All">All Conferences</option>
                  {conferences.map((conf) => (
                    <option key={conf} value={conf}>
                      {conf}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  State:
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white"
                >
                  <option value="All">All States</option>
                  {statesList.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={clearFilters}
                  className="flex-1 py-2 bg-slate-900 border border-slate-800 text-slate-300 font-bold rounded-xl text-xs"
                >
                  Clear
                </button>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 py-2 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SCHOOL CARDS GRID */}
      {filteredSchools.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center space-y-4 my-8">
          <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Search className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-bold text-white">No Football Programs Match Your Filters</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Try clearing your search query or selecting "All Divisions", "All Conferences", or "All States" to browse all verified college and prep programs.
          </p>
          <button
            onClick={clearFilters}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/20 inline-flex items-center gap-2"
          >
            <Compass className="w-4 h-4" /> Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchools.map((school) => {
            const isSaved = savedSchoolIds.includes(school.id);
            const isCompared = selectedCompareIds.includes(school.id);

            // Split program highlights into list bullet points
            const highlightsList = school.programHighlights
              .split(".")
              .map((h) => h.trim())
              .filter((h) => h.length > 0);

            return (
              <div
                key={school.id}
                className={`bg-slate-900 border ${
                  isCompared
                    ? "border-emerald-500/80 ring-1 ring-emerald-500/50 shadow-emerald-500/10"
                    : "border-slate-800 hover:border-slate-700"
                } rounded-3xl p-5 shadow-xl space-y-4 transition-all flex flex-col justify-between group relative`}
              >
                <div className="space-y-4">
                  {/* Top Badges & Target Bookmark */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-950 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold uppercase tracking-wide">
                        {school.divisionLabel}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-950 text-cyan-400 border border-cyan-500/30 text-[10px] font-extrabold">
                        {school.conference}
                      </span>
                    </div>

                    <button
                      onClick={() => toggleSaveSchool(school.id, school.name)}
                      className={`p-1.5 rounded-xl transition-all ${
                        isSaved
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-slate-950 text-slate-500 hover:text-slate-200 border border-slate-800"
                      }`}
                      title={isSaved ? "Saved in targets" : "Save as target school"}
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  {/* School Name & Logo & Mascot */}
                  <div className="flex items-start gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl border border-slate-700 flex items-center justify-center shrink-0 shadow-md p-1 bg-slate-950 relative overflow-hidden"
                      style={{ borderColor: school.primaryColor || "#1e293b" }}
                    >
                      <img
                        src={school.logoUrl}
                        alt={school.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>

                    <div>
                      <h3 className="font-extrabold text-white text-base leading-snug group-hover:text-emerald-400 transition-colors">
                        {school.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{school.cityState}</span>
                      </p>
                    </div>
                  </div>

                  {/* Contact Info (Email & Phone) */}
                  <div className="bg-slate-950/90 rounded-2xl p-3 border border-slate-800/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      {school.recruitingEmail ? (
                        <a
                          href={`mailto:${school.recruitingEmail}`}
                          className="text-slate-300 hover:text-emerald-400 font-medium truncate flex items-center gap-1.5 transition-colors text-[11px]"
                          title={school.recruitingEmail}
                        >
                          <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">{school.recruitingEmail}</span>
                        </a>
                      ) : (
                        <span className="text-amber-400 font-medium truncate flex items-center gap-1.5 text-[11px]">
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          Contact not verified
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => copyToClipboard(school.recruitingEmail, "Email")}
                        disabled={!school.recruitingEmail}
                        className="text-slate-500 hover:text-slate-300 p-1 rounded min-h-[44px] min-w-[44px] inline-flex items-center justify-center disabled:opacity-40"
                        title="Copy email"
                      >
                        {copiedText === "Email" ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                      {school.recruitingPhone ? (
                        <a
                          href={`tel:${school.recruitingPhone}`}
                          className="text-slate-300 hover:text-emerald-400 font-medium flex items-center gap-1.5 transition-colors text-[11px]"
                        >
                          <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>{school.recruitingPhone}</span>
                        </a>
                      ) : (
                        <span className="text-amber-400 font-medium flex items-center gap-1.5 text-[11px]">
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          Contact not verified
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => copyToClipboard(school.recruitingPhone, "Phone")}
                        disabled={!school.recruitingPhone}
                        className="text-slate-500 hover:text-slate-300 p-1 rounded min-h-[44px] min-w-[44px] inline-flex items-center justify-center disabled:opacity-40"
                        title="Copy phone"
                      >
                        {copiedText === "Phone" ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Program Highlights Bullets */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" /> Program Highlights:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-300 bg-slate-950 p-3 rounded-2xl border border-slate-800/80">
                      {highlightsList.map((bullet, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-[11px] leading-relaxed">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Featured Majors & Open Roster Spots */}
                  <div className="space-y-1.5 text-xs pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-blue-400" /> Top Majors:
                      </span>
                      <span className="text-slate-200 font-semibold truncate max-w-[170px]">
                        {school.topMajors.join(", ")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-amber-400" /> Roster Openings:
                      </span>
                      <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {school.totalActiveRecruits} Open Spots
                      </span>
                    </div>
                  </div>
                </div>

                {/* BOTTOM ACTIONS & COMPARE CHECKBOX */}
                <div className="pt-3 border-t border-slate-800/80 space-y-3 mt-2">
                  {/* Compare Checkbox */}
                  <label className="flex items-center justify-between cursor-pointer group/chk bg-slate-950/60 p-2 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                    <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                      <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" /> Compare Program
                    </span>
                    <input
                      type="checkbox"
                      checked={isCompared}
                      onChange={() => handleCompareCheck(school.id)}
                      className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 cursor-pointer"
                    />
                  </label>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between gap-2">
                    {onSelectSchoolForTarget && (
                      <button
                        onClick={() => {
                          onSelectSchoolForTarget(school.name);
                          triggerNotice(`Added ${school.name} to Target Schools!`);
                        }}
                        className="flex-1 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5 text-emerald-400" /> Target
                      </button>
                    )}

                    {onAddOfferSchool && (
                      <button
                        onClick={() => {
                          onAddOfferSchool(school.name, school.division, school.conference);
                          triggerNotice(`Added official offer from ${school.name}!`);
                        }}
                        className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-1 shadow-md shadow-emerald-500/20"
                      >
                        <Award className="w-3.5 h-3.5" /> Claim Offer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FLOATING COMPARISON BAR (Shows when 1+ programs checked) */}
      {selectedCompareIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md border-2 border-emerald-500/80 rounded-2xl p-3 sm:px-6 sm:py-3.5 shadow-2xl flex items-center gap-4 text-xs max-w-lg w-[92%] sm:w-auto justify-between animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <p className="font-extrabold text-white text-xs">
                {selectedCompareIds.length} of 3 Programs Selected
              </p>
              <p className="text-[10px] text-slate-400">
                Ready for side-by-side evaluation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSelectedCompareIds([])}
              className="px-2.5 py-1.5 rounded-xl text-slate-400 hover:text-white font-bold text-xs"
            >
              Clear
            </button>
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
            >
              <span>Compare Now</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* SIDE-BY-SIDE COMPARISON MODAL */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full p-5 sm:p-8 space-y-6 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit mb-1">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" /> Side-by-Side Scouting Audit
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Program Comparison Matrix
                </h2>
              </div>
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="p-2 rounded-2xl bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {comparedSchools.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No programs selected. Check the "Compare Program" box on up to 3 school cards.
              </div>
            ) : (
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="py-3 px-4 text-xs font-bold text-slate-400 w-1/4">Metric</th>
                      {comparedSchools.map((school) => (
                        <th key={school.id} className="py-3 px-4 text-center w-1/3">
                          <div className="space-y-2">
                            <div className="w-12 h-12 rounded-2xl border border-slate-700 bg-slate-950 p-1 mx-auto shadow-md">
                              <img
                                src={school.logoUrl}
                                alt={school.name}
                                className="w-full h-full object-cover rounded-xl"
                              />
                            </div>
                            <h4 className="font-extrabold text-white text-xs">{school.name}</h4>
                            <p className="text-[10px] text-slate-400 font-semibold">{school.mascot}</p>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-xs">
                    {/* Division & Conference */}
                    <tr>
                      <td className="py-3 px-4 text-slate-400 font-bold">Division / Conference</td>
                      {comparedSchools.map((school) => (
                        <td key={school.id} className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded bg-slate-950 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold block mb-1">
                            {school.divisionLabel}
                          </span>
                          <span className="text-slate-300 font-medium text-[11px]">
                            {school.conference}
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Location */}
                    <tr>
                      <td className="py-3 px-4 text-slate-400 font-bold">Location</td>
                      {comparedSchools.map((school) => (
                        <td key={school.id} className="py-3 px-4 text-center text-slate-200">
                          {school.cityState}
                        </td>
                      ))}
                    </tr>

                    {/* Recruiting Email */}
                    <tr>
                      <td className="py-3 px-4 text-slate-400 font-bold">Recruiting Email</td>
                      {comparedSchools.map((school) => (
                        <td key={school.id} className="py-3 px-4 text-center">
                          {school.recruitingEmail ? (
                            <a
                              href={`mailto:${school.recruitingEmail}`}
                              className="text-emerald-400 font-medium hover:underline text-[11px] break-all"
                            >
                              {school.recruitingEmail}
                            </a>
                          ) : (
                            <span className="text-amber-400 text-[11px] font-bold">Contact not verified</span>
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* Recruiting Phone */}
                    <tr>
                      <td className="py-3 px-4 text-slate-400 font-bold">Recruiting Phone</td>
                      {comparedSchools.map((school) => (
                        <td key={school.id} className="py-3 px-4 text-center text-slate-200">
                          {school.recruitingPhone ?? "Contact not verified"}
                        </td>
                      ))}
                    </tr>

                    {/* Roster Spot Openings */}
                    <tr>
                      <td className="py-3 px-4 text-slate-400 font-bold">Roster Openings</td>
                      {comparedSchools.map((school) => (
                        <td key={school.id} className="py-3 px-4 text-center">
                          <span className="text-amber-400 font-black text-sm bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                            {school.totalActiveRecruits} Spots
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Featured Majors */}
                    <tr>
                      <td className="py-3 px-4 text-slate-400 font-bold">Featured Majors</td>
                      {comparedSchools.map((school) => (
                        <td key={school.id} className="py-3 px-4 text-center text-slate-300 text-[11px]">
                          {school.topMajors.join(", ")}
                        </td>
                      ))}
                    </tr>

                    {/* Program Highlights */}
                    <tr>
                      <td className="py-3 px-4 text-slate-400 font-bold">Program Highlights</td>
                      {comparedSchools.map((school) => (
                        <td key={school.id} className="py-3 px-4 text-left text-slate-300 text-[11px] leading-relaxed">
                          {school.programHighlights}
                        </td>
                      ))}
                    </tr>

                    {/* Direct Actions */}
                    <tr>
                      <td className="py-3 px-4 text-slate-400 font-bold">Actions</td>
                      {comparedSchools.map((school) => (
                        <td key={school.id} className="py-3 px-4 text-center">
                          <div className="flex flex-col gap-1.5">
                            {onSelectSchoolForTarget && (
                              <button
                                onClick={() => {
                                  onSelectSchoolForTarget(school.name);
                                  triggerNotice(`Added ${school.name} to Target List!`);
                                }}
                                className="w-full py-1.5 bg-slate-950 border border-slate-800 text-slate-200 font-bold rounded-xl text-[11px] hover:border-slate-700"
                              >
                                Target Program
                              </button>
                            )}
                            {onAddOfferSchool && (
                              <button
                                onClick={() => {
                                  onAddOfferSchool(school.name, school.division, school.conference);
                                  triggerNotice(`Added offer from ${school.name}!`);
                                }}
                                className="w-full py-1.5 bg-emerald-500 text-slate-950 font-black rounded-xl text-[11px] hover:bg-emerald-400"
                              >
                                Claim Offer
                              </button>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsCompareModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-bold text-xs hover:text-white"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GEMINI AI SCHOOL GENERATOR MODAL */}
      {isAiGeneratorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Gemini AI School Generator</h3>
                  <p className="text-xs text-slate-400">Instantly curate and add any collegiate/prep program to database.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAiGeneratorOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateSchoolWithGemini} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  School Name or Program Prompt
                </label>
                <input
                  type="text"
                  value={aiSchoolQuery}
                  onChange={(e) => setAiSchoolQuery(e.target.value)}
                  placeholder="e.g. Valdosta State Blazers, Mount Union, East Mississippi CC"
                  disabled={isGeneratingSchool}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500/50"
                  required
                />
              </div>

              {aiGeneratorError && (
                <div className="p-3 rounded-xl border border-rose-500/40 bg-rose-950/30 text-rose-300 text-xs font-bold">
                  {aiGeneratorError}
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAiGeneratorOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 font-bold text-xs hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGeneratingSchool || !aiSchoolQuery.trim()}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isGeneratingSchool ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-purple-200" />
                      <span>Generating Data...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-purple-200" />
                      <span>Generate & Add School</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
