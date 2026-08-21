import React from "react";
import { Shield, Award, Calendar, UserCheck, Sparkles, GraduationCap, MessageSquare, Flame, Video, Users, RefreshCw, ListFilter, Code, ShieldCheck, Building2, FileCheck, Sun, Moon, GitBranch } from "lucide-react";
import { GridironLogo } from "./GridironLogo";
import type { AppTab, ChromeUserRole } from "../types";

interface NavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  userRole: ChromeUserRole;
  setUserRole: (role: ChromeUserRole) => void;
  athleteName?: string;
  gradClass?: number;
  position?: string;
  onOpenOnboarding?: () => void;
  theme?: "dark" | "light";
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  athleteName = "Caden Carter",
  gradClass = 2026,
  position = "QB",
  onOpenOnboarding,
  theme = "dark",
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-white">
      {/* Top Banner - Live Ticker / Role Bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-b border-emerald-500/20 px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden text-slate-300">
            <span className="flex items-center gap-1 font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider border border-emerald-500/30">
              <Flame className="w-3 h-3 text-amber-400 animate-pulse" /> Live Recruiting Feed
            </span>
            <span className="truncate text-slate-300">
              <strong className="text-white">5★ QB Julian Lewis</strong> committed to <span className="text-amber-300 font-medium">Colorado Bulldogs</span> • <strong className="text-white">4★ WR Dakorien Moore</strong> pledged to <span className="text-emerald-300 font-medium">Oregon Ducks</span>
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-slate-400 text-[11px]">Mode:</span>
            <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-800">
              <button
                type="button"
                onClick={() => setUserRole("Athlete")}
                className={`px-2.5 min-h-[44px] rounded-md text-[11px] font-medium transition-all ${
                  userRole === "Athlete"
                    ? "bg-emerald-500 text-slate-950 font-bold shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Athlete / Parent
              </button>
              <button
                type="button"
                onClick={() => setUserRole("Coach")}
                className={`px-2.5 min-h-[44px] rounded-md text-[11px] font-medium transition-all ${
                  userRole === "Coach"
                    ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                College Coach
              </button>
              <button
                type="button"
                onClick={() => setUserRole("Fan")}
                className={`px-2.5 min-h-[44px] rounded-md text-[11px] font-medium transition-all ${
                  userRole === "Fan"
                    ? "bg-cyan-500 text-slate-950 font-bold shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Fan / Scout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div
            onClick={() => setActiveTab("top250")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <GridironLogo size={44} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent">
                  GRIDIRON
                </span>
                <span className="text-emerald-400 font-extrabold text-xl">GATEWAY</span>
              </div>
              <p className="text-[10px] text-amber-400 font-semibold tracking-wider uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Diploma • Playbook • NCAA Hub
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("gateway_center")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "gateway_center"
                  ? "bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-inner"
                  : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Gateway Hub
            </button>

            <button
              onClick={() => setActiveTab("top250")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "top250"
                  ? "bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-inner"
                  : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Award className="w-4 h-4 text-emerald-400" />
              Top 250
            </button>

            <button
              onClick={() => setActiveTab("highlights")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "highlights"
                  ? "bg-slate-800 text-rose-400 border border-rose-500/30 shadow-inner"
                  : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Video className="w-4 h-4 text-rose-400" />
              Top 10 Plays
            </button>

            <button
              onClick={() => setActiveTab("coaches")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "coaches"
                  ? "bg-slate-800 text-blue-400 border border-blue-500/30 shadow-inner"
                  : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Users className="w-4 h-4 text-blue-400" />
              Coaches
            </button>

            <button
              onClick={() => setActiveTab("schools")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "schools"
                  ? "bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-inner"
                  : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Building2 className="w-4 h-4 text-emerald-400" />
              Schools
            </button>

            <button
              onClick={() => setActiveTab("camps")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "camps"
                  ? "bg-slate-800 text-amber-400 border border-amber-500/30 shadow-inner"
                  : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              Camps
            </button>

            <button
              type="button"
              onClick={() => (onOpenOnboarding ? onOpenOnboarding() : setActiveTab("profile"))}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all text-slate-300 hover:text-white hover:bg-slate-900"
            >
              <UserCheck className="w-4 h-4 text-cyan-400" />
              Profile Builder
            </button>

            <button
              onClick={() => setActiveTab("dossier")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "dossier"
                  ? "bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-inner"
                  : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <FileCheck className="w-4 h-4 text-emerald-400" />
              Scout Dossier
            </button>

            <button
              onClick={() => setActiveTab("ai_assistant")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "ai_assistant"
                  ? "bg-gradient-to-r from-purple-900/60 to-slate-800 text-purple-300 border border-purple-500/40 shadow-inner"
                  : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
              AI Pitcher
            </button>

            <button
              onClick={() => setActiveTab("ncaa")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "ncaa"
                  ? "bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-inner"
                  : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <GraduationCap className="w-4 h-4 text-blue-400" />
              Core GPA
            </button>

            <button
              onClick={() => setActiveTab("transfer_portal")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "transfer_portal"
                  ? "bg-slate-800 text-blue-300 border border-blue-500/30 shadow-inner"
                  : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <RefreshCw className="w-4 h-4 text-blue-400" />
              Transfer Portal
            </button>

            <button
              onClick={() => setActiveTab("coach_workspace")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "coach_workspace"
                  ? "bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-inner"
                  : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Coach Workspace
            </button>

            <button
              onClick={() => setActiveTab("coach_pipeline")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "coach_pipeline"
                  ? "bg-slate-800 text-purple-300 border border-purple-500/30 shadow-inner"
                  : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <ListFilter className="w-4 h-4 text-purple-400" />
              Coach Board
            </button>

            <button
              onClick={() => setActiveTab("coach_views")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all relative ${
                activeTab === "coach_views"
                  ? "bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-inner"
                  : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <MessageSquare className="w-4 h-4 text-rose-400" />
              Messaging
            </button>

            <button
              onClick={() => setActiveTab("compliance")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "compliance"
                  ? "bg-slate-800 text-amber-300 border border-amber-500/30 shadow-inner"
                  : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              NIL & Gate
            </button>

            <button
              onClick={() => setActiveTab("tech_docs")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "tech_docs"
                  ? "bg-slate-800 text-sky-300 border border-sky-500/30 shadow-inner"
                  : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Code className="w-4 h-4 text-sky-400" />
              Arch Specs
            </button>

            <button
              onClick={() => setActiveTab("source_control")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "source_control"
                  ? "bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-inner"
                  : "text-slate-300 hover:text-white hover:bg-slate-900"
              }`}
            >
              <GitBranch className="w-4 h-4 text-emerald-400" />
              Source Control
            </button>
          </nav>

          {/* Active Profile Badge & Theme Toggle */}
          <div className="flex items-center gap-2">
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                title={theme === "light" ? "Switch to Dark Sports-Tech View" : "Switch to Light Mode View"}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold transition-all border border-slate-700 text-amber-300 shadow-sm shrink-0"
              >
                {theme === "light" ? (
                  <>
                    <Moon className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                    <span className="hidden sm:inline text-amber-300">Dark View</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                    <span className="hidden sm:inline text-amber-300">Light View</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={() => setActiveTab("profile")}
              className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-700/80 transition-all text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400 text-xs">
                {position}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-white leading-none truncate max-w-[110px]">
                  {athleteName}
                </p>
                <p className="text-[10px] text-emerald-400 font-medium leading-tight">
                  Class of {gradClass} • Active
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex lg:hidden overflow-x-auto pb-2 gap-1.5 no-scrollbar text-xs border-t border-slate-800/80 pt-2 items-center">
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="px-2.5 py-1.5 rounded-md whitespace-nowrap font-bold bg-slate-900 border border-slate-700 text-amber-300 flex items-center gap-1 shrink-0"
            >
              {theme === "light" ? <Moon className="w-3.5 h-3.5 text-amber-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
              <span>{theme === "light" ? "Dark" : "Light"}</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab("top250")}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium ${
              activeTab === "top250" ? "bg-emerald-500 text-slate-950 font-bold" : "bg-slate-900 text-slate-300"
            }`}
          >
            Top 250
          </button>
          <button
            onClick={() => setActiveTab("highlights")}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium ${
              activeTab === "highlights" ? "bg-rose-500 text-slate-950 font-bold" : "bg-slate-900 text-slate-300"
            }`}
          >
            Top 10 Plays
          </button>
          <button
            onClick={() => setActiveTab("coaches")}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium ${
              activeTab === "coaches" ? "bg-blue-500 text-slate-950 font-bold" : "bg-slate-900 text-slate-300"
            }`}
          >
            Coaches
          </button>
          <button
            onClick={() => setActiveTab("schools")}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium ${
              activeTab === "schools" ? "bg-emerald-500 text-slate-950 font-bold" : "bg-slate-900 text-slate-300"
            }`}
          >
            Schools (D1-AA, D2, D3, NAIA, JUCO)
          </button>
          <button
            onClick={() => setActiveTab("transfer_portal")}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium ${
              activeTab === "transfer_portal" ? "bg-blue-600 text-white font-bold" : "bg-slate-900 text-slate-300"
            }`}
          >
            Transfer Portal
          </button>
          <button
            onClick={() => setActiveTab("coach_pipeline")}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium ${
              activeTab === "coach_pipeline" ? "bg-purple-600 text-white font-bold" : "bg-slate-900 text-slate-300"
            }`}
          >
            Coach Board
          </button>
          <button
            onClick={() => setActiveTab("camps")}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium ${
              activeTab === "camps" ? "bg-amber-500 text-slate-950 font-bold" : "bg-slate-900 text-slate-300"
            }`}
          >
            Camps
          </button>
          <button
            type="button"
            onClick={() => (onOpenOnboarding ? onOpenOnboarding() : setActiveTab("profile"))}
            className="px-3 py-1.5 min-h-[44px] rounded-md whitespace-nowrap font-medium bg-slate-900 text-slate-300"
          >
            Profile Builder
          </button>
          <button
            onClick={() => setActiveTab("ai_assistant")}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium ${
              activeTab === "ai_assistant" ? "bg-purple-600 text-white font-bold" : "bg-slate-900 text-slate-300"
            }`}
          >
            AI Pitcher
          </button>
          <button
            onClick={() => setActiveTab("ncaa")}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium ${
              activeTab === "ncaa" ? "bg-emerald-500 text-slate-950 font-bold" : "bg-slate-900 text-slate-300"
            }`}
          >
            Core GPA
          </button>
          <button
            onClick={() => setActiveTab("coach_views")}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium ${
              activeTab === "coach_views" ? "bg-emerald-500 text-slate-950 font-bold" : "bg-slate-900 text-slate-300"
            }`}
          >
            Messaging
          </button>
          <button
            onClick={() => setActiveTab("compliance")}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium ${
              activeTab === "compliance" ? "bg-amber-500 text-slate-950 font-bold" : "bg-slate-900 text-slate-300"
            }`}
          >
            NIL & Gate
          </button>
          <button
            onClick={() => setActiveTab("tech_docs")}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap font-medium ${
              activeTab === "tech_docs" ? "bg-sky-500 text-slate-950 font-bold" : "bg-slate-900 text-slate-300"
            }`}
          >
            Arch Specs
          </button>
        </div>
      </div>
    </header>
  );
};
