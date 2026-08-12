import React, { useState, useMemo } from "react";
import {
  Users,
  Plus,
  MoveRight,
  Star,
  MessageSquare,
  CheckCircle,
  ChevronRight,
  Edit3,
  Trash2,
  Download,
  FileSpreadsheet,
  Search,
  Filter,
  X,
  RefreshCw,
  CheckCircle2,
  CheckSquare,
  Square,
  ListChecks,
  MessageSquarePlus,
  AlertTriangle,
} from "lucide-react";
import { MOCK_COACH_PIPELINE_PROSPECTS } from "../data/mockData";
import { CoachPipelineProspect } from "../types";

export const CoachPipelineBoard: React.FC = () => {
  const [prospects, setProspects] = useState<CoachPipelineProspect[]>(MOCK_COACH_PIPELINE_PROSPECTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPosition, setSelectedPosition] = useState<string>("ALL");
  const [selectedStage, setSelectedStage] = useState<string>("ALL");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals & Notifications state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkNoteModal, setShowBulkNoteModal] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [bulkNoteText, setBulkNoteText] = useState("");
  const [bulkNoteMode, setBulkNoteMode] = useState<"append" | "overwrite">("append");
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [newProspect, setNewProspect] = useState({
    athleteName: "",
    position: "QB",
    highSchoolOrSchool: "",
    state: "TX",
    gradClass: 2026,
    stage: "Identified" as CoachPipelineProspect["stage"],
    notes: "",
  });

  const stages: CoachPipelineProspect["stage"][] = ["Identified", "Contacted", "Offered", "Committed"];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const availablePositions = useMemo(() => {
    const posSet = new Set(prospects.map((p) => p.position));
    return Array.from(posSet).sort();
  }, [prospects]);

  const filteredProspects = useMemo(() => {
    return prospects.filter((p) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        p.athleteName.toLowerCase().includes(query) ||
        p.highSchoolOrSchool.toLowerCase().includes(query) ||
        p.state.toLowerCase().includes(query) ||
        p.notes.toLowerCase().includes(query) ||
        p.position.toLowerCase().includes(query);

      const matchesPos = selectedPosition === "ALL" || p.position === selectedPosition;
      const matchesStage = selectedStage === "ALL" || p.stage === selectedStage;

      return matchesSearch && matchesPos && matchesStage;
    });
  }, [prospects, searchQuery, selectedPosition, selectedStage]);

  // Selection Helper Functions
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isAllVisibleSelected = useMemo(() => {
    if (filteredProspects.length === 0) return false;
    return filteredProspects.every((p) => selectedIds.includes(p.id));
  }, [filteredProspects, selectedIds]);

  const toggleSelectAllVisible = () => {
    if (isAllVisibleSelected) {
      const visibleSet = new Set(filteredProspects.map((p) => p.id));
      setSelectedIds((prev) => prev.filter((id) => !visibleSet.has(id)));
    } else {
      const visibleIds = filteredProspects.map((p) => p.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const toggleSelectStage = (stage: CoachPipelineProspect["stage"]) => {
    const stageProspects = filteredProspects.filter((p) => p.stage === stage);
    if (stageProspects.length === 0) return;

    const allStageSelected = stageProspects.every((p) => selectedIds.includes(p.id));
    const stageIds = stageProspects.map((p) => p.id);

    if (allStageSelected) {
      const stageSet = new Set(stageIds);
      setSelectedIds((prev) => prev.filter((id) => !stageSet.has(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...stageIds])));
    }
  };

  // Bulk Operation Handlers
  const handleBulkChangeStatus = (newStage: CoachPipelineProspect["stage"]) => {
    if (selectedIds.length === 0) return;

    const count = selectedIds.length;
    setProspects((prev) =>
      prev.map((p) =>
        selectedIds.includes(p.id)
          ? { ...p, stage: newStage, lastActivity: "Just now — Bulk Stage Update" }
          : p
      )
    );

    triggerToast(`Moved ${count} recruit${count > 1 ? "s" : ""} to "${newStage}" stage.`);
  };

  const handleBulkAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkNoteText.trim() || selectedIds.length === 0) return;

    const count = selectedIds.length;
    const cleanNote = bulkNoteText.trim();

    setProspects((prev) =>
      prev.map((p) => {
        if (!selectedIds.includes(p.id)) return p;

        let updatedNote = cleanNote;
        if (bulkNoteMode === "append" && p.notes) {
          updatedNote = `${p.notes} | ${cleanNote}`;
        }

        return {
          ...p,
          notes: updatedNote,
          lastActivity: "Just now — Bulk Note Added",
        };
      })
    );

    triggerToast(`Added scouting note to ${count} recruit${count > 1 ? "s" : ""}.`);
    setBulkNoteText("");
    setShowBulkNoteModal(false);
  };

  const handleBulkDeleteConfirm = () => {
    if (selectedIds.length === 0) return;

    const count = selectedIds.length;
    setProspects((prev) => prev.filter((p) => !selectedIds.includes(p.id)));
    setSelectedIds([]);
    setShowBulkDeleteConfirm(false);

    triggerToast(`Removed ${count} recruit${count > 1 ? "s" : ""} from pipeline.`);
  };

  const handleStageChange = (id: string, newStage: CoachPipelineProspect["stage"]) => {
    setProspects(
      prospects.map((p) => (p.id === id ? { ...p, stage: newStage, lastActivity: "Just now — Stage Updated" } : p))
    );
  };

  const handleExportCSV = () => {
    if (filteredProspects.length === 0) return;

    const headers = [
      "ID",
      "Athlete Name",
      "Position",
      "High School / School",
      "State",
      "Class Year",
      "Stage",
      "Star Rating",
      "Notes",
      "Last Activity",
    ];

    const escapeCSV = (field: string | number | undefined) => {
      if (field === undefined || field === null) return '""';
      const val = String(field).replace(/"/g, '""');
      return `"${val}"`;
    };

    const csvRows = [
      headers.join(","),
      ...filteredProspects.map((p) =>
        [
          escapeCSV(p.id),
          escapeCSV(p.athleteName),
          escapeCSV(p.position),
          escapeCSV(p.highSchoolOrSchool),
          escapeCSV(p.state),
          escapeCSV(p.gradClass),
          escapeCSV(p.stage),
          escapeCSV(p.rating),
          escapeCSV(p.notes),
          escapeCSV(p.lastActivity),
        ].join(",")
      ),
    ];

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Recruitment_Pipeline_Export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    triggerToast(`Pipeline CSV downloaded! (${filteredProspects.length} recruits)`);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedPosition("ALL");
    setSelectedStage("ALL");
  };

  const handleAddProspect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProspect.athleteName) return;

    const created: CoachPipelineProspect = {
      id: `pip-${Date.now()}`,
      athleteName: newProspect.athleteName,
      position: newProspect.position as any,
      highSchoolOrSchool: newProspect.highSchoolOrSchool || "High School",
      state: newProspect.state,
      gradClass: newProspect.gradClass,
      stage: newProspect.stage,
      rating: 5,
      notes: newProspect.notes || "Added to recruiting board.",
      lastActivity: "Just now — Added to Pipeline",
      avatarUrl: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80",
    };

    setProspects([...prospects, created]);
    setShowAddModal(false);
    setNewProspect({
      athleteName: "",
      position: "QB",
      highSchoolOrSchool: "",
      state: "TX",
      gradClass: 2026,
      stage: "Identified",
      notes: "",
    });
    triggerToast(`Added ${created.athleteName} to pipeline board.`);
  };

  const hasActiveFilters = searchQuery !== "" || selectedPosition !== "ALL" || selectedStage !== "ALL";

  const selectedProspectObjects = useMemo(() => {
    return prospects.filter((p) => selectedIds.includes(p.id));
  }, [prospects, selectedIds]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-400 text-slate-950 font-black px-4 py-3 rounded-2xl shadow-2xl border border-emerald-300 flex items-center gap-2 text-xs animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-slate-950 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-950 border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xl">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30 mb-2">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            Coach Recruiting CRM & Pipeline Board
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white">Recruit Watchlist Pipeline</h1>
          <p className="text-xs md:text-sm text-slate-300">
            Private coach-facing Kanban board to track target prospects through recruiting stages.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
          <button
            onClick={handleExportCSV}
            disabled={filteredProspects.length === 0}
            title="Download CSV spreadsheet of current pipeline recruits"
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export to CSV ({filteredProspects.length})</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Target Prospect</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-md">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search recruits, school, state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
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

          {/* Position Filter */}
          <select
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="ALL">All Positions</option>
            {availablePositions.map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </select>

          {/* Stage Filter */}
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="ALL">All Stages</option>
            {stages.map((stg) => (
              <option key={stg} value={stg}>
                {stg}
              </option>
            ))}
          </select>
        </div>

        {/* Multi-select check all button & Filter Stats */}
        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs flex-wrap">
          <button
            onClick={toggleSelectAllVisible}
            className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-purple-500/40 text-xs font-semibold text-slate-300 flex items-center gap-2 transition-all cursor-pointer"
          >
            {isAllVisibleSelected ? (
              <CheckSquare className="w-4 h-4 text-purple-400 shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-slate-500 shrink-0" />
            )}
            <span>Select All ({filteredProspects.length})</span>
          </button>

          <span className="text-slate-400 font-mono text-[11px]">
            Showing <strong className="text-white">{filteredProspects.length}</strong> of {prospects.length}
          </span>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3 text-purple-400" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* MULTI-SELECT BULK OPERATIONS TOOLBAR */}
      {selectedIds.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/90 via-slate-900 to-slate-900 border-2 border-purple-500/60 shadow-2xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/40 shrink-0">
              <ListChecks className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-sm">
                  {selectedIds.length} Recruit{selectedIds.length > 1 ? "s" : ""} Selected
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                  {Math.round((selectedIds.length / prospects.length) * 100)}% of pipeline
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Perform bulk stage transitions, append scouting evaluation notes, or remove from board.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Bulk Change Status Selector */}
            <div className="relative">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkChangeStatus(e.target.value as CoachPipelineProspect["stage"]);
                    e.target.value = "";
                  }
                }}
                defaultValue=""
                className="px-3.5 py-2 rounded-xl bg-purple-900/80 hover:bg-purple-800 border border-purple-500/50 text-white text-xs font-bold focus:outline-none cursor-pointer transition-all shadow-md"
              >
                <option value="" disabled>
                  ⚡ Change Status ▾
                </option>
                {stages.map((stg) => (
                  <option key={stg} value={stg} className="bg-slate-900 text-white font-semibold">
                    Set Stage: {stg}
                  </option>
                ))}
              </select>
            </div>

            {/* Bulk Add Note Button */}
            <button
              onClick={() => setShowBulkNoteModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-purple-300 hover:text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <MessageSquarePlus className="w-4 h-4 text-purple-400" />
              <span>Add Note</span>
            </button>

            {/* Bulk Remove Button */}
            <button
              onClick={() => setShowBulkDeleteConfirm(true)}
              className="px-3.5 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-600/40 text-rose-300 hover:text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Remove ({selectedIds.length})</span>
            </button>

            {/* Clear Selection */}
            <button
              onClick={() => setSelectedIds([])}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Deselect All"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
        {stages.map((stage) => {
          const stageProspects = filteredProspects.filter((p) => p.stage === stage);
          const stageColors = {
            Identified: "border-slate-800 bg-slate-950/40 text-slate-400",
            Contacted: "border-blue-500/30 bg-blue-950/20 text-blue-400",
            Offered: "border-amber-500/30 bg-amber-950/20 text-amber-400",
            Committed: "border-emerald-500/30 bg-emerald-950/20 text-emerald-400",
          };

          const isStageAllSelected =
            stageProspects.length > 0 && stageProspects.every((p) => selectedIds.includes(p.id));

          return (
            <div
              key={stage}
              className={`p-4 rounded-xl border ${stageColors[stage]} flex flex-col min-h-[420px]`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleSelectStage(stage)}
                    title={`Select all recruits in ${stage}`}
                    className="text-slate-400 hover:text-purple-400 transition-colors cursor-pointer"
                  >
                    {isStageAllSelected ? (
                      <CheckSquare className="w-4 h-4 text-purple-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <span>{stage}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs text-slate-300 font-mono">
                      {stageProspects.length}
                    </span>
                  </h3>
                </div>
              </div>

              {/* Prospect Cards */}
              <div className="space-y-3 flex-1">
                {stageProspects.map((prospect) => {
                  const isSelected = selectedIds.includes(prospect.id);

                  return (
                    <div
                      key={prospect.id}
                      className={`p-4 rounded-xl bg-slate-900 border transition-all shadow-md group relative ${
                        isSelected
                          ? "border-purple-500 bg-purple-950/25 ring-1 ring-purple-500/50"
                          : "border-slate-800 hover:border-purple-500/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-3">
                          {/* Row Checkbox */}
                          <label
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center justify-center cursor-pointer select-none"
                            title="Select recruit for bulk operations"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(prospect.id)}
                              className="sr-only"
                            />
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-purple-400 shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-600 hover:text-slate-400 shrink-0" />
                            )}
                          </label>

                          <img
                            src={prospect.avatarUrl}
                            alt={prospect.athleteName}
                            className="w-10 h-10 rounded-lg object-cover border border-purple-500/30 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-purple-300 text-[10px] font-bold">
                                {prospect.position}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                '{prospect.gradClass}
                              </span>
                            </div>
                            <h4 className="font-bold text-white text-xs leading-tight">
                              {prospect.athleteName}
                            </h4>
                            <p className="text-[10px] text-slate-400">
                              {prospect.highSchoolOrSchool} ({prospect.state})
                            </p>
                          </div>
                        </div>

                        {/* Star Rating */}
                        <div className="flex items-center text-amber-400 text-[10px] font-bold">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                          <span>{prospect.rating}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-300 line-clamp-2 mb-2 bg-slate-950/50 p-2 rounded border border-slate-800/80">
                        "{prospect.notes}"
                      </p>

                      {/* Cognitive Scheme Match Badge */}
                      <div className="mb-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[9px] font-bold">
                        <span>🧠 Cognition Fit:</span>
                        <span className="text-emerald-400 font-mono">
                          {prospect.position === "QB" ? "98% Air Raid Fit" : prospect.position === "WR" ? "96% West Coast Fit" : "95% Zone Scheme Fit"}
                        </span>
                      </div>

                      <div className="text-[9px] text-slate-400 mb-3">{prospect.lastActivity}</div>

                      {/* Stage Move Controls */}
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-1 text-[10px]">
                        <span className="text-slate-400">Move:</span>
                        <div className="flex items-center gap-1">
                          {stages.map(
                            (s) =>
                              s !== prospect.stage && (
                                <button
                                  key={s}
                                  onClick={() => handleStageChange(prospect.id, s)}
                                  className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-300 text-[9px] font-medium transition-colors cursor-pointer"
                                >
                                  {s[0]}
                                </button>
                              )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {stageProspects.length === 0 && (
                  <div className="h-32 border border-dashed border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-500">
                    No recruits in {stage}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bulk Add Note Modal */}
      {showBulkNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquarePlus className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">
                  Bulk Add Scouting Note ({selectedIds.length} Recruits)
                </h3>
              </div>
              <button
                onClick={() => setShowBulkNoteModal(false)}
                className="text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selected Recruits Pills */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 max-h-24 overflow-y-auto space-y-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                Target Recruits ({selectedProspectObjects.length}):
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedProspectObjects.map((p) => (
                  <span
                    key={p.id}
                    className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30 text-purple-300 text-[10px] font-semibold"
                  >
                    {p.athleteName} ({p.position})
                  </span>
                ))}
              </div>
            </div>

            <form onSubmit={handleBulkAddNoteSubmit} className="space-y-4 text-xs">
              <div className="space-y-2">
                <label className="block text-slate-300 font-semibold">Note Action Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    onClick={() => setBulkNoteMode("append")}
                    className={`p-2.5 rounded-xl border cursor-pointer text-center font-bold transition-all ${
                      bulkNoteMode === "append"
                        ? "bg-purple-950/80 border-purple-500 text-purple-300"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Append to Existing
                  </label>
                  <label
                    onClick={() => setBulkNoteMode("overwrite")}
                    className={`p-2.5 rounded-xl border cursor-pointer text-center font-bold transition-all ${
                      bulkNoteMode === "overwrite"
                        ? "bg-purple-950/80 border-purple-500 text-purple-300"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Overwrite Note
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Scouting Note Content</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Verified 40-yard dash at Nike combine. Staff approved for official visit invitation."
                  value={bulkNoteText}
                  onChange={(e) => setBulkNoteText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500 placeholder-slate-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBulkNoteModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-colors shadow-lg shadow-purple-600/30"
                >
                  Apply Note to {selectedIds.length} Recruits
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-xl bg-rose-950/80 border border-rose-500/40">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirm Removal</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to remove <strong className="text-white">{selectedIds.length} recruits</strong> from your private recruiting pipeline?
            </p>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 max-h-32 overflow-y-auto space-y-1">
              {selectedProspectObjects.map((p) => (
                <div key={p.id} className="text-[11px] text-slate-300 font-medium flex justify-between">
                  <span>{p.athleteName} ({p.position})</span>
                  <span className="text-slate-500">{p.highSchoolOrSchool}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors shadow-lg shadow-rose-600/30"
              >
                Remove {selectedIds.length} Recruits
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Add Prospect to Board</h3>
            <form onSubmit={handleAddProspect} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Athlete Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Caden Carter"
                  value={newProspect.athleteName}
                  onChange={(e) => setNewProspect({ ...newProspect, athleteName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Position</label>
                  <select
                    value={newProspect.position}
                    onChange={(e) => setNewProspect({ ...newProspect, position: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="QB">QB</option>
                    <option value="WR">WR</option>
                    <option value="RB">RB</option>
                    <option value="EDGE">EDGE</option>
                    <option value="CB">CB</option>
                    <option value="OT">OT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Class Year</label>
                  <input
                    type="number"
                    value={newProspect.gradClass}
                    onChange={(e) => setNewProspect({ ...newProspect, gradClass: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">High School & State</label>
                <input
                  type="text"
                  placeholder="e.g. Allen High School (TX)"
                  value={newProspect.highSchoolOrSchool}
                  onChange={(e) => setNewProspect({ ...newProspect, highSchoolOrSchool: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Evaluation & Scouting Notes</label>
                <textarea
                  rows={3}
                  placeholder="Notes on film, athletic testing, coach feedback..."
                  value={newProspect.notes}
                  onChange={(e) => setNewProspect({ ...newProspect, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-500"
                >
                  Add Prospect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

