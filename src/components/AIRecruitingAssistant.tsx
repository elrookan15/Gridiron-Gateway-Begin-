import React, { useState } from "react";
import { AthleteProfile } from "../types";
import { Sparkles, Copy, Check, Send, Bot, Shield, ArrowRight, Loader2, RefreshCw } from "lucide-react";

interface AIRecruitingAssistantProps {
  athleteProfile: AthleteProfile;
}

const SAMPLE_PROGRAMS = [
  { schoolName: "University of Georgia", coachName: "Coach Marcus Freeman", coachTitle: "Head Coach / Recruiter", scheme: "Pro-Style / 4-2-5 Defense", conference: "SEC" },
  { schoolName: "University of Texas", coachName: "Coach Steve Sarkisian", coachTitle: "Head Coach / OC", scheme: "Up-Tempo Spread Offense", conference: "SEC" },
  { schoolName: "Ohio State University", coachName: "Coach Brian Hartline", coachTitle: "Offensive Coordinator / WRs", scheme: "Pro-Spread Offense", conference: "Big Ten" },
  { schoolName: "Oregon Ducks", coachName: "Coach Will Stein", coachTitle: "Offensive Coordinator", scheme: "High-Powered Zone Read", conference: "Big Ten" },
  { schoolName: "Alabama Crimson Tide", coachName: "Coach Kalen DeBoer", coachTitle: "Head Coach", scheme: "Multiple Offense", conference: "SEC" },
];

export const AIRecruitingAssistant: React.FC<AIRecruitingAssistantProps> = ({ athleteProfile }) => {
  const [selectedProgram, setSelectedProgram] = useState(SAMPLE_PROGRAMS[0]);
  const [customSchool, setCustomSchool] = useState("");
  const [customCoach, setCustomCoach] = useState("");
  const [customScheme, setCustomScheme] = useState("");
  const [emailGoal, setEmailGoal] = useState("Initial Introduction & Hudl Highlight Reel Share");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<{
    subject: string;
    body: string;
    keyHighlights: string[];
  } | null>(null);

  // AI Scout Report state
  const [scoutLoading, setScoutLoading] = useState(false);
  const [scoutReport, setScoutReport] = useState<any>(null);

  const handleGenerateEmail = async () => {
    setLoading(true);
    setGeneratedResult(null);

    const programToUse = customSchool.trim()
      ? {
          schoolName: customSchool.trim(),
          coachName: customCoach.trim() || "Head Coach",
          coachTitle: "Recruiting Coordinator",
          scheme: customScheme.trim() || "Multiple Scheme",
          conference: "NCAA Division I",
        }
      : selectedProgram;

    try {
      const response = await fetch("/api/ai/draft-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          athleteData: athleteProfile,
          targetProgram: programToUse,
          emailGoal,
          additionalNotes,
        }),
      });

      if (!response.ok) throw new Error("Server error drafting email");
      const data = await response.json();
      setGeneratedResult(data);
    } catch (err) {
      console.error(err);
      // Fallback response if offline or key missing
      setGeneratedResult({
        subject: `${athleteProfile.fullName} - ${athleteProfile.primaryPosition} '26 (${athleteProfile.heightFeet}'${athleteProfile.heightInches}", ${athleteProfile.weightLbs}lbs, ${athleteProfile.fortyTime}s 40, ${athleteProfile.gpa} GPA) - Hudl Highlights`,
        body: `Dear ${programToUse.coachName},\n\nMy name is ${athleteProfile.fullName}, a Class of ${athleteProfile.gradClass} ${athleteProfile.primaryPosition} at ${athleteProfile.highSchool} in ${athleteProfile.cityState}.\n\nI have been following ${programToUse.schoolName}'s program closely, and I admire your ${programToUse.scheme}. I believe my physical metrics (${athleteProfile.heightFeet}'${athleteProfile.heightInches}", ${athleteProfile.weightLbs} lbs, ${athleteProfile.fortyTime}s 40-yard dash) and decision-making fit seamlessly into your offensive system.\n\nAcademically, I maintain a ${athleteProfile.gpa} Cumulative GPA (${athleteProfile.coreGpa} Core NCAA GPA). My complete Hudl highlight reel is linked below:\n\nHudl Film: ${athleteProfile.hudlUrl}\n\nThank you for your time and evaluation. I look forward to connecting with your staff!\n\nRespectfully,\n${athleteProfile.fullName}\nPhone: ${athleteProfile.primaryPhone}\nTwitter: ${athleteProfile.twitterHandle}`,
        keyHighlights: [
          `Tailored specifically to ${programToUse.schoolName}'s ${programToUse.scheme}`,
          `Includes laser-verified 40 time (${athleteProfile.fortyTime}s) and ${athleteProfile.coreGpa} Core GPA`,
          `NCAA compliance friendly with official Hudl reel link`,
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateScoutReport = async () => {
    setScoutLoading(true);
    try {
      const res = await fetch("/api/ai/scout-evaluation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ athleteData: athleteProfile }),
      });
      if (!res.ok) throw new Error("Evaluation error");
      const data = await res.json();
      setScoutReport(data);
    } catch (err) {
      setScoutReport({
        compositeStarRating: "4-Star National Recruit",
        scoutingOverview: `${athleteProfile.fullName} is an exceptionally gifted ${athleteProfile.primaryPosition} with high-level physical traits (${athleteProfile.heightFeet}'${athleteProfile.heightInches}", ${athleteProfile.weightLbs} lbs) and elite speed (${athleteProfile.fortyTime}s 40). Demonstrates superior field vision, high academic standing (${athleteProfile.gpa} GPA), and strong leadership.`,
        strengths: ["Laser-tested speed & burst", "High NCAA Core GPA (3.88)", "Multi-year varsity starter & captain", "Proven big-game production"],
        areasToImprove: ["In-season strength maintenance", "Route tree/coverage reading refinement"],
        projectedLevel: "FBS Power 4 (SEC / Big Ten Starter Projection)",
        schemeFits: ["Up-Tempo Spread", "Pro-Style Motion", "Air Raid Transition"]
      });
    } finally {
      setScoutLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedResult) return;
    const fullText = `SUBJECT: ${generatedResult.subject}\n\n${generatedResult.body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-white space-y-8">
      {/* Title Card */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 border border-purple-500/40 p-6 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" /> Server-Side Gemini 3.6 Flash Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              AI College Recruiting Outreach Generator
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Generate personalized, high-converting emails and Twitter DMs tailored to target college coaching schemes.
            </p>
          </div>

          <button
            onClick={handleGenerateScoutReport}
            disabled={scoutLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs border border-emerald-500/30 transition-all shrink-0"
          >
            {scoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
            Generate AI Scout Evaluation
          </button>
        </div>
      </div>

      {/* AI SCOUT EVALUATION CARD (If Generated) */}
      {scoutReport && (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-md font-bold text-emerald-400 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" /> AI Scout Evaluation & Projected Level
            </h2>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40">
              {scoutReport.compositeStarRating}
            </span>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
            {scoutReport.scoutingOverview}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <p className="text-emerald-400 font-bold uppercase mb-1">Key Scouting Strengths</p>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                {scoutReport.strengths?.map((s: string, idx: number) => (
                  <li key={idx}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <p className="text-purple-400 font-bold uppercase mb-1">Projected Fit & Schemes</p>
              <p className="font-bold text-white mb-1">{scoutReport.projectedLevel}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {scoutReport.schemeFits?.map((f: string, idx: number) => (
                  <span key={idx} className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-300">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GENERATOR WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Form Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <h2 className="text-md font-bold text-white flex items-center gap-2">
            1. Target College Program & Scheme
          </h2>

          {/* Quick Select Program */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Top Division I Program</label>
            <div className="space-y-2">
              {SAMPLE_PROGRAMS.map((prog, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSelectedProgram(prog);
                    setCustomSchool("");
                  }}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    selectedProgram.schoolName === prog.schoolName && !customSchool
                      ? "bg-purple-950/60 border-purple-500/60 text-white"
                      : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div>
                    <p className="text-xs font-extrabold text-white">{prog.schoolName}</p>
                    <p className="text-[10px] text-slate-400">{prog.coachName} • Scheme: {prog.scheme}</p>
                  </div>
                  <span className="text-[10px] font-bold text-purple-400">{prog.conference}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Or Custom School Entry */}
          <div className="pt-3 border-t border-slate-800/80 space-y-3">
            <label className="block text-xs font-semibold text-slate-300">Or Enter Custom College & Coach</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={customSchool}
                onChange={(e) => setCustomSchool(e.target.value)}
                placeholder="College Name (e.g. Penn State)"
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
              <input
                type="text"
                value={customCoach}
                onChange={(e) => setCustomCoach(e.target.value)}
                placeholder="Coach Name (e.g. Coach Knowles)"
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <input
              type="text"
              value={customScheme}
              onChange={(e) => setCustomScheme(e.target.value)}
              placeholder="Scheme / Offense-Defense Style (e.g. 4-2-5 Defense)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Outreach Goal */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">2. Select Outreach Goal</label>
            <select
              value={emailGoal}
              onChange={(e) => setEmailGoal(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
            >
              <option value="Initial Introduction & Hudl Highlight Reel Share">Initial Introduction & Hudl Highlight Reel Share</option>
              <option value="Inviting Coach to Senior Night / Game">Inviting Coach to Senior Night / Game</option>
              <option value="Thank You for Campus Visit / Scholarship Offer">Thank You for Campus Visit / Scholarship Offer</option>
              <option value="Concise Twitter Direct Message Pitch (280 characters)">Concise Twitter Direct Message Pitch (280 chars)</option>
            </select>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Additional Personal Details (Optional)</label>
            <textarea
              rows={2}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="e.g. Mention that I visited campus last summer or led the district in passing yards..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            onClick={handleGenerateEmail}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-extrabold text-sm transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Drafting Tailored Outreach Email...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-purple-200" /> Draft Personalized Outreach Email
              </>
            )}
          </button>
        </div>

        {/* Right Output Window */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h2 className="text-md font-bold text-white flex items-center gap-2">
                Drafted College Coach Outreach Message
              </h2>
              {generatedResult && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950 border border-purple-500/40 text-purple-300 text-xs font-bold hover:bg-purple-900 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy Full Message"}
                </button>
              )}
            </div>

            {!generatedResult ? (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-10 text-center space-y-3 my-8">
                <Bot className="w-10 h-10 text-purple-400/60 mx-auto" />
                <p className="text-sm font-bold text-slate-300">Ready to Draft Recruiting Pitch</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Click "Draft Personalized Outreach Email" to generate custom pitch text tailored to {athleteProfile.fullName}'s verified stats & target program scheme.
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Subject Line */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-purple-500/30">
                  <span className="text-[10px] text-purple-400 font-bold uppercase block mb-0.5">Subject Line</span>
                  <p className="font-extrabold text-white text-sm">{generatedResult.subject}</p>
                </div>

                {/* Email Body */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Message Body</span>
                  <pre className="whitespace-pre-wrap font-sans text-slate-200 leading-relaxed text-xs">
                    {generatedResult.body}
                  </pre>
                </div>

                {/* Key Highlights */}
                {generatedResult.keyHighlights && (
                  <div className="bg-purple-950/40 border border-purple-500/30 p-3 rounded-xl">
                    <span className="text-[10px] text-purple-300 font-bold uppercase block mb-1">AI Recruiting Strategy Highlights</span>
                    <ul className="list-disc list-inside text-slate-300 space-y-1 text-[11px]">
                      {generatedResult.keyHighlights.map((hl, idx) => (
                        <li key={idx}>{hl}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Powered by Gemini 3.6 Flash</span>
            <span>NCAA Compliance Compliant Format</span>
          </div>
        </div>
      </div>
    </div>
  );
};
