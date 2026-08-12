import React, { useState } from "react";
import { RefreshCw, Search, ShieldCheck, Filter, ExternalLink, Calendar, Award, CheckCircle2, AlertCircle, DollarSign, TrendingUp } from "lucide-react";
import { MOCK_TRANSFER_PORTAL_ATHLETES } from "../data/mockData";
import { Position, CollegeDivision } from "../types";

export const TransferPortalModule: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosition, setSelectedPosition] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const filteredAthletes = MOCK_TRANSFER_PORTAL_ATHLETES.filter((athlete) => {
    const matchesSearch =
      athlete.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      athlete.formerSchool.toLowerCase().includes(searchTerm.toLowerCase()) ||
      athlete.conference.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPosition = selectedPosition === "ALL" || athlete.position === selectedPosition;
    const matchesStatus = selectedStatus === "ALL" || athlete.status === selectedStatus;

    return matchesSearch && matchesPosition && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="relative rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 p-6 md:p-8 border border-blue-500/30 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <RefreshCw className="w-64 h-64 text-blue-400" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/40">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
            NCAA Transfer Portal Live Feed • Real-Time Eligibility Pipeline
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            NCAA College Transfer Portal Directory
          </h1>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            Parallel pipeline tracking active college portal entries, remaining years of eligibility, former school stats, and committed portal destinations across all divisions.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-300 font-medium">
            <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>NCAA Compliance Verified</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <Calendar className="w-4 h-4 text-sky-400" />
              <span>2025-2026 Portal Windows</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center shadow-lg">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, former school, SEC, etc..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            <span>Position:</span>
          </div>
          <select
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Positions</option>
            <option value="QB">QB</option>
            <option value="WR">WR</option>
            <option value="RB">RB</option>
            <option value="EDGE">EDGE</option>
            <option value="CB">CB</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Portal Statuses</option>
            <option value="Active in Portal">Active in Portal</option>
            <option value="Committed / Transferred">Committed / Transferred</option>
          </select>
        </div>
      </div>

      {/* Athlete Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredAthletes.map((athlete) => (
          <div
            key={athlete.id}
            className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 transition-all shadow-xl flex flex-col justify-between"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={athlete.avatarUrl}
                    alt={athlete.fullName}
                    className="w-14 h-14 rounded-xl object-cover border border-blue-500/30 shadow-md"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
                        {athlete.position}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {athlete.height} • {athlete.weight} lbs
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-1">{athlete.fullName}</h3>
                    <p className="text-xs text-slate-400">
                      Former School: <strong className="text-slate-200">{athlete.formerSchool}</strong> ({athlete.conference})
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                {athlete.status === "Active in Portal" ? (
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                    Active Portal
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {athlete.destinationSchool}
                  </span>
                )}
              </div>

              {/* Stats & Highlights */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800/80 mb-4 text-center">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Eligibility</div>
                  <div className="text-sm font-bold text-sky-400 font-mono">
                    {athlete.yearsEligibilityRemaining} {athlete.yearsEligibilityRemaining === 1 ? "Year" : "Years"} Left
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">40-Yard Speed</div>
                  <div className="text-sm font-bold text-emerald-400 font-mono">
                    {athlete.fortyTime}s
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">GPA / Academics</div>
                  <div className="text-sm font-bold text-purple-400 font-mono">
                    {athlete.gpa.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Production Stats Summary */}
              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60 mb-3 text-xs">
                <div className="text-slate-400 text-[10px] uppercase font-semibold mb-1">
                  On-Field College Stats & Film
                </div>
                <div className="text-slate-200 font-medium">{athlete.statsHighlights}</div>
              </div>

              {/* CapGM $20.5M Roster Impact Strip */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-slate-950 to-emerald-950/40 border border-emerald-500/30 mb-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-emerald-400 font-extrabold text-[11px]">
                  <DollarSign className="w-3.5 h-3.5" /> CapGM Win Impact:
                  <span className="text-amber-400 font-mono font-bold">+1.25 Wins</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Cap Value: <strong className="text-lime-400 font-bold">$850,000 / yr</strong>
                </div>
              </div>
            </div>

            {/* Card Footer Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-400">
                Entered Portal: <strong className="text-slate-300">{athlete.portalEntryDate}</strong>
              </span>
              <a
                href={athlete.hudlUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-blue-600/20"
              >
                <span>College Hudl Film</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
