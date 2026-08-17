import React, { useMemo, useState } from "react";
import { Bot, Copy, GraduationCap, Loader2, Mail, Sparkles, Target, Trophy } from "lucide-react";

import { isSupabaseConfigured } from "../lib/supabaseClient";
import { generateRecruitingOutreachDraft } from "../services/geminiAssistantApi";
import type { AthleteProfile, PitchTone } from "../types";

interface AIRecruitingAssistantProps {
  athleteProfile: AthleteProfile;
}

const TONES: PitchTone[] = [
  "IMMEDIATE_IMPACT",
  "NFL_DEVELOPMENT",
  "ACADEMIC_EXCELLENCE",
  "HOMETOWN_HERO",
];

function originStateFromCityState(cityState: string): string {
  const parts = cityState.split(",").map((part) => part.trim());
  return parts[1] ?? parts[0] ?? "";
}

function getToneIcon(tone: PitchTone) {
  if (tone === "NFL_DEVELOPMENT") return <Trophy className="w-4 h-4 shrink-0" />;
  if (tone === "IMMEDIATE_IMPACT") return <Target className="w-4 h-4 shrink-0" />;
  if (tone === "ACADEMIC_EXCELLENCE") return <GraduationCap className="w-4 h-4 shrink-0" />;
  return <Sparkles className="w-4 h-4 shrink-0" />;
}

export const AIRecruitingAssistant: React.FC<AIRecruitingAssistantProps> = ({ athleteProfile }) => {
  const targetAthlete = useMemo(
    () => ({
      athleteName: athleteProfile.fullName,
      position: athleteProfile.primaryPosition,
      starRating: Math.min(5, Math.max(1, athleteProfile.starRating ?? 3)),
      originState: originStateFromCityState(athleteProfile.cityState),
    }),
    [athleteProfile],
  );

  const [selectedTone, setSelectedTone] = useState<PitchTone>("IMMEDIATE_IMPACT");
  const [coachName, setCoachName] = useState("");
  const [programName, setProgramName] = useState("");
  const [generatedDraft, setGeneratedDraft] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const canGenerate = Boolean(coachName.trim() && programName.trim()) && !isGenerating;

  const requestDraft = async () => {
    setIsGenerating(true);
    setGeneratedDraft("");
    setErrorMessage(null);
    setCopied(false);

    if (!isSupabaseConfigured()) {
      setErrorMessage("Supabase is not configured. Gemini stays off the browser.");
      setIsGenerating(false);
      return;
    }

    try {
      const { draft } = await generateRecruitingOutreachDraft({
        athleteName: targetAthlete.athleteName,
        position: targetAthlete.position,
        starRating: targetAthlete.starRating,
        originState: targetAthlete.originState,
        tone: selectedTone,
        coachName: coachName.trim(),
        programName: programName.trim(),
      });
      setGeneratedDraft(draft);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Unable to generate outreach draft.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyDraftForReview = async () => {
    if (!generatedDraft.trim()) return;
    try {
      await navigator.clipboard.writeText(generatedDraft);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setErrorMessage("Clipboard blocked. Copy the draft from the editor manually.");
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col lg:flex-row min-h-[500px]">
      <div className="lg:w-96 bg-slate-950 p-6 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col gap-6">
        <div>
          <h2 className="text-xl font-black text-slate-100 uppercase tracking-tight flex items-center gap-2">
            <Bot className="w-5 h-5 shrink-0 text-purple-500" />
            Gemini Assistant
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">AI-driven recruiting outreach · draft only</p>
        </div>

        <div className="space-y-4 flex-1">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Target Prospect</span>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded bg-slate-950 border border-slate-800 flex items-center justify-center font-black text-slate-200 shrink-0">
                {targetAthlete.position}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-100 truncate">{targetAthlete.athleteName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-amber-400 tracking-widest shrink-0">
                    {"★".repeat(targetAthlete.starRating)}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono truncate">{targetAthlete.originState}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="program-name" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Program
            </label>
            <input
              id="program-name"
              value={programName}
              onChange={(event) => setProgramName(event.target.value)}
              placeholder="Verified program name"
              className="w-full min-h-[44px] bg-slate-900 border border-slate-800 rounded-lg px-3 text-sm font-mono text-slate-200 focus:border-purple-500 focus:outline-none"
            />
            <label htmlFor="coach-name" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Coach (from verified staff)
            </label>
            <input
              id="coach-name"
              value={coachName}
              onChange={(event) => setCoachName(event.target.value)}
              placeholder="Contact not verified — type staff name"
              className="w-full min-h-[44px] bg-slate-900 border border-slate-800 rounded-lg px-3 text-sm font-mono text-slate-200 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Strategic Pitch Angle</label>
            <div className="grid grid-cols-1 gap-2">
              {TONES.map((tone) => (
                <button
                  key={tone}
                  type="button"
                  onClick={() => setSelectedTone(tone)}
                  className={`min-h-[44px] w-full text-left px-4 flex items-center gap-3 rounded-lg border text-xs font-bold transition-colors ${
                    selectedTone === tone
                      ? "bg-purple-500/10 border-purple-500/50 text-purple-400"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  {getToneIcon(tone)}
                  {tone.replaceAll("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void requestDraft()}
          disabled={!canGenerate}
          className={`w-full min-h-[44px] rounded-xl text-sm font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${
            isGenerating
              ? "bg-slate-800 text-slate-500 cursor-wait border border-slate-700"
              : "bg-purple-600 text-white hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Drafting Pitch...
            </>
          ) : (
            <>
              <Mail className="w-4 h-4" /> Generate Draft
            </>
          )}
        </button>
      </div>

      <div className="flex-1 bg-slate-900 p-6 flex flex-col min-h-[320px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Mail className="w-4 h-4 shrink-0" /> Outreach Draft Editor
          </h3>
        </div>
        {errorMessage && (
          <div className="mb-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs font-mono">
            {errorMessage}
          </div>
        )}
        <div className="flex-1 relative min-h-[240px]">
          <textarea
            value={generatedDraft}
            onChange={(event) => setGeneratedDraft(event.target.value)}
            placeholder="Generated draft will appear here for coach review..."
            aria-label="Outreach draft editor"
            className="w-full h-full min-h-[240px] bg-slate-950 border border-slate-800 rounded-xl p-5 text-sm font-mono text-slate-300 focus:border-purple-500 focus:outline-none resize-none leading-relaxed shadow-inner"
          />
          {isGenerating && (
            <div className="absolute inset-0 bg-slate-950/50 flex items-center justify-center rounded-xl backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-2xl">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Gemini 2.5 Flash Processing
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            disabled={!generatedDraft || isGenerating}
            onClick={() => void copyDraftForReview()}
            className="min-h-[44px] px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold uppercase tracking-widest rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            <Copy className="w-4 h-4" /> {copied ? "Copied" : "Copy for Compliance Review"}
          </button>
        </div>
      </div>
    </div>
  );
};
