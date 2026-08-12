import React, { useState } from "react";
import { AthleteProfile, CollegeOffer } from "../types";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileCheck,
  FileText,
  GraduationCap,
  Globe,
  MapPin,
  Printer,
  Ruler,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Video,
  Activity,
  Check,
  X,
  Zap,
} from "lucide-react";

// Mock Athlete Profile for out-of-the-box preview and fallback
export const MOCK_DOSSIER_ATHLETE: AthleteProfile = {
  fullName: "Caden Carter",
  highSchool: "Westlake High School",
  cityState: "Austin, TX",
  gradClass: 2026,
  primaryEmail: "caden.carter2026@gmail.com",
  primaryPhone: "(512) 555-0194",
  parentName: "Marcus Carter",
  parentEmailPhone: "m.carter@gmail.com | (512) 555-0198",

  primaryPosition: "QB",
  secondaryPosition: "ATH",
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
  weightedGpa: 4.35,
  coreGpa: 3.88,
  satScore: 1340,
  actScore: 29,
  intendedMajor: "Business Administration / Sports Management",

  hudlUrl: "https://hudl.com/profile/caden-carter-qb",
  youtubeFilmUrl: "https://youtube.com/watch?v=caden-carter-junior-season",
  twitterHandle: "@CadenCarterQB",
  instagramHandle: "@caden_carter_12",
  facebookHandle: "Caden Carter QB",

  seasonStats: "3,420 Passing Yds, 38 TDs, 5 INTs, 540 Rushing Yds, 8 Rushing TDs",
  honors: "Texas 6A District MVP, 1st Team All-State QB, Elite 11 Regional Finalist, 2x Team Captain",
  isTeamCaptain: true,
  varsityStarterYears: 3,

  ncaaEligibilityId: "2408912048",
  starRating: 5,
  commitmentStatus: "Uncommitted",
  committedSchool: undefined,

  topTargetSchools: ["University of Texas", "Ohio State University", "University of Alabama", "University of Oregon", "LSU"],

  preferredEnvironment: "Suburban",
  preferredCampusSize: "Large (15,000+)",

  offers: [
    {
      id: "off-1",
      schoolName: "University of Texas",
      division: "FBS",
      conference: "SEC",
      offerDate: "2025-09-15",
      status: "Offered",
      schoolColor: "#bf5700",
    },
    {
      id: "off-2",
      schoolName: "Ohio State University",
      division: "FBS",
      conference: "Big Ten",
      offerDate: "2025-10-02",
      status: "Offered",
      schoolColor: "#bb0000",
    },
    {
      id: "off-3",
      schoolName: "University of Alabama",
      division: "FBS",
      conference: "SEC",
      offerDate: "2025-11-12",
      status: "Offered",
      schoolColor: "#9e1b32",
    },
    {
      id: "off-4",
      schoolName: "University of Oregon",
      division: "FBS",
      conference: "Big Ten",
      offerDate: "2026-01-20",
      status: "Offered",
      schoolColor: "#154734",
    },
    {
      id: "off-5",
      schoolName: "Appalachian State University",
      division: "FBS",
      conference: "Sun Belt",
      offerDate: "2025-06-10",
      status: "Offered",
      schoolColor: "#000000",
    },
  ],
};

interface AthleteDossierProps {
  athleteProfile?: AthleteProfile;
}

export const AthleteDossier: React.FC<AthleteDossierProps> = ({
  athleteProfile = MOCK_DOSSIER_ATHLETE,
}) => {
  const profile = athleteProfile || MOCK_DOSSIER_ATHLETE;
  const [copyNotice, setCopyNotice] = useState<string | null>(null);

  // Formatted Scout Package String for Clipboard
  const scoutPackageText = `Scout Package: ${profile.fullName} | ${profile.starRating || 5}-Star ${profile.primaryPosition} (${profile.gradClass}) | GPA: ${profile.gpa} (Core: ${profile.coreGpa}) | 40-Yard: ${profile.fortyTime}s (${profile.fortyTimingType}) | Height/Weight: ${profile.heightFeet}'${profile.heightInches}" ${profile.weightLbs}lbs | Film: ${profile.hudlUrl}`;

  const handleCopyScoutPackage = () => {
    navigator.clipboard.writeText(scoutPackageText);
    setCopyNotice("Scout Package copied to clipboard!");
    setTimeout(() => setCopyNotice(null), 3000);
  };

  const handlePrintDossier = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-slate-100 space-y-8 antialiased print:p-0 print:m-0 print:max-w-full print:bg-white print:text-slate-900">
      {/* Toast Notification */}
      {copyNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-400 text-slate-950 font-black px-4 py-3 rounded-2xl shadow-2xl border border-emerald-300 flex items-center gap-2.5 text-xs animate-bounce print:hidden">
          <CheckCircle2 className="w-4 h-4 text-slate-950 shrink-0" />
          <span>{copyNotice}</span>
        </div>
      )}

      {/* TOP ACTION BAR (Hidden in Print) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:px-6 print:hidden shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <FileCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              Verified Recruiting Dossier
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] border border-emerald-500/40 font-bold">
                NCAA Verified
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Official player dossier formatted for college coaching staff evaluations & export.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleCopyScoutPackage}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <Copy className="w-4 h-4" />
            <span>Copy Scout Package</span>
          </button>

          <button
            onClick={handlePrintDossier}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 font-extrabold text-xs transition-all flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Print Profile</span>
          </button>
        </div>
      </div>

      {/* ATHLETE HERO HEADER CARD */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden print:border-b-2 print:border-black print:rounded-none print:shadow-none print:bg-none print:p-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none print:hidden"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar / Photo Placeholder */}
          <div className="relative shrink-0">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl border-2 border-emerald-500/50 bg-slate-950 flex flex-col items-center justify-center overflow-hidden shadow-2xl relative print:border-black print:bg-slate-100">
              <div className="w-full h-full bg-gradient-to-tr from-slate-950 to-slate-900 flex flex-col items-center justify-center text-slate-400 print:from-slate-200 print:to-slate-100 print:text-slate-800">
                <span className="text-3xl sm:text-4xl font-black text-emerald-400 print:text-black">
                  {profile.primaryPosition}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 print:text-slate-700">
                  Class {profile.gradClass}
                </span>
              </div>
            </div>
            {/* Captain Badge */}
            {profile.isTeamCaptain && (
              <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider border border-amber-300 shadow-md print:bg-black print:text-white">
                Team Captain
              </span>
            )}
          </div>

          {/* Bio Info */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              {/* Star Rating Display */}
              <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full print:bg-slate-100 print:border-slate-300">
                {Array.from({ length: profile.starRating || 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400 print:fill-black print:text-black" />
                ))}
                <span className="text-amber-300 font-extrabold text-xs ml-1 print:text-black">
                  {profile.starRating || 5}-Star National Prospect
                </span>
              </div>

              {/* Commitment Status Badge */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                  profile.commitmentStatus === "Committed"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 print:bg-slate-200 print:text-black"
                    : "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 print:bg-slate-100 print:text-black"
                }`}
              >
                {profile.commitmentStatus === "Committed"
                  ? `Committed: ${profile.committedSchool}`
                  : "Status: Uncommitted"}
              </span>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight print:text-black">
                {profile.fullName}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-slate-300 text-xs sm:text-sm font-medium mt-1 print:text-slate-800">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 print:text-black" />
                  {profile.highSchool} ({profile.cityState})
                </span>
                <span>•</span>
                <span className="text-emerald-400 font-bold print:text-black">
                  NCAA ID: {profile.ncaaEligibilityId}
                </span>
              </div>
            </div>

            {/* Quick Contact & Social Handles (Screen and Print) */}
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs">
              <a
                href={profile.hudlUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 font-bold hover:border-amber-400/50 transition-all flex items-center gap-1.5 print:bg-slate-100 print:text-black print:border-slate-300"
              >
                <Video className="w-3.5 h-3.5 text-amber-400 print:text-black" />
                <span>HUDL Film</span>
                <ExternalLink className="w-3 h-3 text-slate-500 print:hidden" />
              </a>

              {profile.youtubeFilmUrl && (
                <a
                  href={profile.youtubeFilmUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-red-400 font-bold hover:border-red-400/50 transition-all flex items-center gap-1.5 print:bg-slate-100 print:text-black print:border-slate-300"
                >
                  <Video className="w-3.5 h-3.5 text-red-400 print:text-black" />
                  <span>Full Season Tape</span>
                  <ExternalLink className="w-3 h-3 text-slate-500 print:hidden" />
                </a>
              )}

              {profile.twitterHandle && (
                <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 font-bold flex items-center gap-1.5 print:bg-slate-100 print:text-black print:border-slate-300">
                  <Globe className="w-3.5 h-3.5 text-cyan-400 print:text-black" />
                  <span>X: {profile.twitterHandle}</span>
                </span>
              )}

              {profile.instagramHandle && (
                <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-pink-400 font-bold flex items-center gap-1.5 print:bg-slate-100 print:text-black print:border-slate-300">
                  <span>IG: {profile.instagramHandle}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* METRICS & CREDENTIALS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* VERIFIED COMBINE & PHYSICAL METRICS CARD */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 print:border-slate-300 print:bg-white print:text-black print:shadow-none print:rounded-none">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 print:border-slate-300">
            <h3 className="font-black text-white text-base uppercase tracking-wider flex items-center gap-2 print:text-black">
              <Activity className="w-5 h-5 text-emerald-400 print:text-black" />
              Verified Physical & Combine Metrics
            </h3>
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider print:bg-slate-100 print:text-black">
              Laser Measured
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Height & Weight */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1 print:bg-slate-50 print:border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block print:text-slate-600">
                Height / Weight
              </span>
              <p className="text-lg font-black text-white print:text-black">
                {profile.heightFeet}'{profile.heightInches}" / {profile.weightLbs} lbs
              </p>
            </div>

            {/* 40-Yard Dash */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1 relative overflow-hidden print:bg-slate-50 print:border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block print:text-slate-600">
                  40-Yard Dash
                </span>
                <span
                  className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                    profile.fortyTimingType === "Laser"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 print:bg-slate-200 print:text-black"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/40 print:bg-slate-200 print:text-black"
                  }`}
                >
                  {profile.fortyTimingType}
                </span>
              </div>
              <p className="text-lg font-black text-emerald-400 print:text-black">
                {profile.fortyTime}s
              </p>
            </div>

            {/* 5-10-5 Shuttle */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1 print:bg-slate-50 print:border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block print:text-slate-600">
                5-10-5 Shuttle
              </span>
              <p className="text-lg font-black text-white print:text-black">
                {profile.shuttleTime}s
              </p>
            </div>

            {/* Vertical Jump */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1 print:bg-slate-50 print:border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block print:text-slate-600">
                Vertical Jump
              </span>
              <p className="text-lg font-black text-cyan-400 print:text-black">
                {profile.verticalJump}"
              </p>
            </div>

            {/* Bench Press */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1 print:bg-slate-50 print:border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block print:text-slate-600">
                Bench Max
              </span>
              <p className="text-lg font-black text-white print:text-black">
                {profile.benchPress} lbs
              </p>
            </div>

            {/* Squat Max */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1 print:bg-slate-50 print:border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block print:text-slate-600">
                Squat Max
              </span>
              <p className="text-lg font-black text-white print:text-black">
                {profile.squatMax} lbs
              </p>
            </div>

            {/* Hand Size */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1 print:bg-slate-50 print:border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block print:text-slate-600">
                Hand Size
              </span>
              <p className="text-base font-extrabold text-slate-200 print:text-black">
                {profile.handSizeInches}"
              </p>
            </div>

            {/* Arm Length */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1 print:bg-slate-50 print:border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block print:text-slate-600">
                Arm Length
              </span>
              <p className="text-base font-extrabold text-slate-200 print:text-black">
                {profile.armLengthInches}"
              </p>
            </div>

            {/* Varsity Starter */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1 print:bg-slate-50 print:border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block print:text-slate-600">
                Varsity Starter
              </span>
              <p className="text-base font-extrabold text-amber-400 print:text-black">
                {profile.varsityStarterYears} Years
              </p>
            </div>
          </div>

          {/* On-Field Season Accolades */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80 print:border-slate-300">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 print:text-slate-700">
              <Trophy className="w-3.5 h-3.5 text-amber-400 print:text-black" /> Key Season Stats & Accolades
            </span>
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1.5 text-xs text-slate-300 print:bg-slate-50 print:border-slate-200 print:text-black">
              <p className="font-semibold text-white print:text-black">{profile.seasonStats}</p>
              <p className="text-emerald-400 font-bold print:text-black">{profile.honors}</p>
            </div>
          </div>
        </div>

        {/* ACADEMIC CREDENTIALS CARD */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 print:border-slate-300 print:bg-white print:text-black print:shadow-none print:rounded-none">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 print:border-slate-300">
            <h3 className="font-black text-white text-base uppercase tracking-wider flex items-center gap-2 print:text-black">
              <GraduationCap className="w-5 h-5 text-cyan-400 print:text-black" />
              NCAA Academic Credentials
            </h3>
            <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-[10px] font-black uppercase tracking-wider print:bg-slate-100 print:text-black">
              NCAA Qualifier
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Cumulative Unweighted GPA */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1 print:bg-slate-50 print:border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block print:text-slate-600">
                Unweighted GPA
              </span>
              <p className="text-xl font-black text-emerald-400 print:text-black">
                {profile.gpa} / 4.0
              </p>
            </div>

            {/* Core NCAA GPA */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1 print:bg-slate-50 print:border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block print:text-slate-600">
                NCAA Core GPA
              </span>
              <p className="text-xl font-black text-cyan-400 print:text-black">
                {profile.coreGpa}
              </p>
            </div>

            {/* SAT Score */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1 print:bg-slate-50 print:border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block print:text-slate-600">
                SAT Score
              </span>
              <p className="text-lg font-black text-white print:text-black">
                {profile.satScore || "N/A"}
              </p>
            </div>

            {/* ACT Score */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-1 print:bg-slate-50 print:border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block print:text-slate-600">
                ACT Composite
              </span>
              <p className="text-lg font-black text-white print:text-black">
                {profile.actScore || "N/A"}
              </p>
            </div>
          </div>

          {/* Intended College Majors */}
          <div className="space-y-1.5 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 print:bg-slate-50 print:border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block print:text-slate-600">
              Intended Academic Majors:
            </span>
            <p className="text-xs font-bold text-slate-200 print:text-black">
              {profile.intendedMajor}
            </p>
          </div>

          {/* Parent & Contact Verification */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80 print:border-slate-300">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5 print:text-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 print:text-black" /> Parent / Guardian & Recruiting Contacts
            </span>
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-xs text-slate-300 print:bg-slate-50 print:border-slate-200 print:text-black">
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-slate-600">Athlete Email:</span>
                <span className="font-semibold text-white print:text-black">{profile.primaryEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 print:text-slate-600">Athlete Phone:</span>
                <span className="font-semibold text-white print:text-black">{profile.primaryPhone}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800/80 pt-2 print:border-slate-300">
                <span className="text-slate-400 print:text-slate-600">Parent/Guardian:</span>
                <span className="font-semibold text-amber-300 print:text-black">{profile.parentName} ({profile.parentEmailPhone})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SCHOLARSHIP OFFERS HISTORY TIMELINE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 print:border-slate-300 print:bg-white print:text-black print:shadow-none print:rounded-none">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 print:border-slate-300">
          <div>
            <h3 className="font-black text-white text-lg uppercase tracking-wider flex items-center gap-2 print:text-black">
              <Award className="w-5 h-5 text-amber-400 print:text-black" />
              Scholarship Offers & Timeline ({profile.offers?.length || 0})
            </h3>
            <p className="text-xs text-slate-400 print:text-slate-700">
              Verified Division I, II, III & NAIA collegiate offers extended to this student-athlete.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-black print:bg-slate-100 print:text-black">
            {profile.offers?.length || 0} Total Offers
          </span>
        </div>

        {!profile.offers || profile.offers.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No official scholarship offers logged yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.offers.map((offer) => (
              <div
                key={offer.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 relative overflow-hidden print:bg-slate-50 print:border-slate-300"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-slate-900 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider print:bg-slate-200 print:text-black">
                    {offer.division} • {offer.conference}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 print:text-slate-600">
                    {offer.offerDate}
                  </span>
                </div>

                <h4 className="font-extrabold text-white text-base leading-snug print:text-black">
                  {offer.schoolName}
                </h4>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs print:border-slate-300">
                  <span className="text-slate-400 text-[11px] print:text-slate-600">Status:</span>
                  <span className="font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[11px] print:bg-slate-200 print:text-black">
                    Official Offer
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PRINT-ONLY FOOTER SIGNATURE BLOCK */}
      <div className="hidden print:block pt-8 text-xs text-slate-700 border-t-2 border-slate-900 space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <p className="font-bold text-black">Gridiron Gateway Compliance & Recruiting Service</p>
            <p>Verified Student-Athlete Scouting Dossier • Generated {new Date().toLocaleDateString()}</p>
          </div>
          <div className="text-right border-t border-black pt-1 w-48">
            <p className="text-[10px] uppercase font-bold text-slate-600">Head Coach Verification Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AthleteDossier;
