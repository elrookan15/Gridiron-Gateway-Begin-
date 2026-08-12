import React from "react";
import { MultiTenantUser, UserRole } from "../types";
import { ShieldCheck, UserCheck, Briefcase, Award, Lock, Sparkles, ChevronDown } from "lucide-react";

export const MOCK_MULTI_TENANT_USERS: MultiTenantUser[] = [
  {
    id: "user-hc",
    name: "Coach Steve Sarkisian",
    role: "HEAD_COACH_GM",
    title: "Head Football Coach & Roster GM",
    school: "University of Texas",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    permissions: {
      role: "HEAD_COACH_GM",
      roleTitle: "Head Coach / Roster GM",
      canAccessCapGM: true,
      canAccessFilmStudio: true,
      canAccessEscrow: true,
      canSendMessages: true,
      dashboardBadgeText: "Full Front-Office & CapGM Authority",
    },
  },
  {
    id: "user-wr",
    name: "Coach AJ Milwee",
    role: "POSITION_COACH",
    title: "Passing Game Coordinator & WR Coach",
    school: "University of Texas",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    permissions: {
      role: "POSITION_COACH",
      roleTitle: "WR Position Coach",
      canAccessCapGM: false,
      canAccessFilmStudio: true,
      canAccessEscrow: false,
      canSendMessages: true,
      positionGroupFilter: "WR",
      dashboardBadgeText: "Position View: WR Film & Targeted DMs",
    },
  },
  {
    id: "user-comp",
    name: "Sarah Jenkins",
    role: "COMPLIANCE_OFFICER",
    title: "Director of Collegiate Compliance",
    school: "University of Texas Compliance Office",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
    permissions: {
      role: "COMPLIANCE_OFFICER",
      roleTitle: "Compliance Officer",
      canAccessCapGM: false,
      canAccessFilmStudio: false,
      canAccessEscrow: true,
      canSendMessages: false,
      dashboardBadgeText: "Fail-Closed Recruiting Calendar & NIL Gatekeeper",
    },
  },
  {
    id: "user-rec",
    name: "Caden 'Rocket' Carter",
    role: "ATHLETE_RECRUIT",
    title: "5-Star QB Recruit ('26)",
    school: "Allen High School (TX)",
    avatarUrl: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&auto=format&fit=crop&q=80",
    permissions: {
      role: "ATHLETE_RECRUIT",
      roleTitle: "High School Athlete",
      canAccessCapGM: false,
      canAccessFilmStudio: false,
      canAccessEscrow: false,
      canSendMessages: true,
      dashboardBadgeText: "Verified Recruiter Dossier & Offer Tracker",
    },
  },
];

interface MultiTenantRoleSelectorProps {
  activeUser: MultiTenantUser;
  onSelectUser: (user: MultiTenantUser) => void;
}

export const MultiTenantRoleSelector: React.FC<MultiTenantRoleSelectorProps> = ({
  activeUser,
  onSelectUser,
}) => {
  return (
    <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Active Role Info */}
        <div className="flex items-center gap-3">
          <img
            src={activeUser.avatarUrl}
            alt={activeUser.name}
            className="w-7 h-7 rounded-full object-cover border border-purple-500/40"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white">{activeUser.name}</span>
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[9px] font-black uppercase">
                {activeUser.permissions.roleTitle}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              {activeUser.permissions.dashboardBadgeText}
            </span>
          </div>
        </div>

        {/* Persona Switcher Selector */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider hidden sm:inline">
            Switch Persona:
          </span>
          <div className="relative">
            <select
              value={activeUser.id}
              onChange={(e) => {
                const found = MOCK_MULTI_TENANT_USERS.find((u) => u.id === e.target.value);
                if (found) onSelectUser(found);
              }}
              className="bg-slate-950 border border-purple-500/40 text-purple-200 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer shadow-md"
            >
              {MOCK_MULTI_TENANT_USERS.map((user) => (
                <option key={user.id} value={user.id} className="bg-slate-900 text-white font-semibold">
                  {user.name} ({user.permissions.roleTitle})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
