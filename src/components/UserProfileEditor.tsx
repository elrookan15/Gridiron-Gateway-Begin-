/**
 * UserProfileEditor — modular composition for editable AthleteProfile sections.
 * Mirrors the deep-dive evaluation workspace pattern: one section = one job.
 */
import React, { useEffect, useId, useRef, useState } from "react";
import {
  type AthleteProfile,
  type GradYear,
  type Position,
} from "../types";
import { GraduationCap, Ruler, Timer, Link2, User, X, Save } from "lucide-react";

type EditorSection = "identity" | "physical" | "combine" | "academics" | "media";

interface UserProfileEditorProps {
  isOpen: boolean;
  profile: AthleteProfile;
  onClose: () => void;
  onSave: (updated: AthleteProfile) => void;
}

const POSITIONS: Position[] = [
  "QB",
  "RB",
  "WR",
  "TE",
  "OT",
  "OG",
  "C",
  "DE",
  "DT",
  "EDGE",
  "LB",
  "CB",
  "S",
  "ATH",
  "K",
  "P",
  "LS",
];

const GRAD_YEARS: GradYear[] = [2025, 2026, 2027, 2028, 2029];

const SECTION_META: { id: EditorSection; label: string; icon: React.ReactNode }[] = [
  { id: "identity", label: "Identity", icon: <User className="w-3.5 h-3.5 shrink-0" /> },
  { id: "physical", label: "Physical", icon: <Ruler className="w-3.5 h-3.5 shrink-0" /> },
  { id: "combine", label: "Combine", icon: <Timer className="w-3.5 h-3.5 shrink-0" /> },
  { id: "academics", label: "Academics", icon: <GraduationCap className="w-3.5 h-3.5 shrink-0" /> },
  { id: "media", label: "Media", icon: <Link2 className="w-3.5 h-3.5 shrink-0" /> },
];

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
      {children}
    </label>
  );
}

function FieldInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & { id: string },
) {
  const { className, ...rest } = props;
  return (
    <input
      {...rest}
      className={`w-full min-h-[44px] bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500 ${className ?? ""}`}
    />
  );
}

function FieldSelect(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & { id: string },
) {
  const { className, children, ...rest } = props;
  return (
    <select
      {...rest}
      className={`w-full min-h-[44px] bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-sm text-white focus:outline-none focus:border-emerald-500 ${className ?? ""}`}
    >
      {children}
    </select>
  );
}

export const UserProfileEditor: React.FC<UserProfileEditorProps> = ({
  isOpen,
  profile,
  onClose,
  onSave,
}) => {
  const [draft, setDraft] = useState<AthleteProfile>(profile);
  const [activeSection, setActiveSection] = useState<EditorSection>("identity");
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (isOpen) {
      setDraft(profile);
      setActiveSection("identity");
    }
  }, [isOpen, profile]);

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const patch = <K extends keyof AthleteProfile>(key: K, value: AthleteProfile[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(draft);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-slate-800 shrink-0">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg sm:text-xl font-black text-white truncate">
              Edit Athlete Profile
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 truncate">
              Modular workspace — update one section at a time before saving.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 shrink-0"
            aria-label="Close editor"
          >
            <X className="w-5 h-5 shrink-0" />
          </button>
        </div>

        <div className="flex gap-1.5 overflow-x-auto p-3 border-b border-slate-800 bg-slate-950/60 shrink-0">
          {SECTION_META.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shrink-0 transition-colors ${
                activeSection === section.id
                  ? "bg-emerald-500 text-slate-950"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
              }`}
            >
              {section.icon}
              {section.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
            {activeSection === "identity" && (
              <SectionShell title="Identity & Contact">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
                    <FieldInput
                      id="fullName"
                      value={draft.fullName}
                      onChange={(e) => patch("fullName", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="highSchool">High School / JUCO</FieldLabel>
                    <FieldInput
                      id="highSchool"
                      value={draft.highSchool}
                      onChange={(e) => patch("highSchool", e.target.value)}
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="cityState">City, State</FieldLabel>
                    <FieldInput
                      id="cityState"
                      value={draft.cityState}
                      onChange={(e) => patch("cityState", e.target.value)}
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="gradClass">Grad Class</FieldLabel>
                    <FieldSelect
                      id="gradClass"
                      value={draft.gradClass}
                      onChange={(e) => patch("gradClass", Number(e.target.value) as GradYear)}
                    >
                      {GRAD_YEARS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </FieldSelect>
                  </div>
                  <div>
                    <FieldLabel htmlFor="primaryPosition">Primary Position</FieldLabel>
                    <FieldSelect
                      id="primaryPosition"
                      value={draft.primaryPosition}
                      onChange={(e) => patch("primaryPosition", e.target.value as Position)}
                    >
                      {POSITIONS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </FieldSelect>
                  </div>
                  <div>
                    <FieldLabel htmlFor="primaryEmail">Primary Email</FieldLabel>
                    <FieldInput
                      id="primaryEmail"
                      type="email"
                      value={draft.primaryEmail}
                      onChange={(e) => patch("primaryEmail", e.target.value)}
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="primaryPhone">Primary Phone</FieldLabel>
                    <FieldInput
                      id="primaryPhone"
                      value={draft.primaryPhone}
                      onChange={(e) => patch("primaryPhone", e.target.value)}
                    />
                  </div>
                </div>
              </SectionShell>
            )}

            {activeSection === "physical" && (
              <SectionShell title="Physical Measurables">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <FieldLabel htmlFor="heightFeet">Height (ft)</FieldLabel>
                    <FieldInput
                      id="heightFeet"
                      type="number"
                      min={4}
                      max={8}
                      value={draft.heightFeet}
                      onChange={(e) => patch("heightFeet", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="heightInches">Height (in)</FieldLabel>
                    <FieldInput
                      id="heightInches"
                      type="number"
                      min={0}
                      max={11}
                      value={draft.heightInches}
                      onChange={(e) => patch("heightInches", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="weightLbs">Weight (lbs)</FieldLabel>
                    <FieldInput
                      id="weightLbs"
                      type="number"
                      min={100}
                      max={400}
                      value={draft.weightLbs}
                      onChange={(e) => patch("weightLbs", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="handSizeInches">Hand Size</FieldLabel>
                    <FieldInput
                      id="handSizeInches"
                      type="number"
                      step="0.1"
                      value={draft.handSizeInches}
                      onChange={(e) => patch("handSizeInches", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="armLengthInches">Arm Length</FieldLabel>
                    <FieldInput
                      id="armLengthInches"
                      type="number"
                      step="0.1"
                      value={draft.armLengthInches}
                      onChange={(e) => patch("armLengthInches", Number(e.target.value))}
                    />
                  </div>
                </div>
              </SectionShell>
            )}

            {activeSection === "combine" && (
              <SectionShell title="Verified Combine / Speed">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <FieldLabel htmlFor="fortyTime">40-Yard (s)</FieldLabel>
                    <FieldInput
                      id="fortyTime"
                      type="number"
                      step="0.01"
                      value={draft.fortyTime}
                      onChange={(e) => patch("fortyTime", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="fortyTimingType">Timing Type</FieldLabel>
                    <FieldSelect
                      id="fortyTimingType"
                      value={draft.fortyTimingType}
                      onChange={(e) =>
                        patch("fortyTimingType", e.target.value as AthleteProfile["fortyTimingType"])
                      }
                    >
                      <option value="Laser">Laser</option>
                      <option value="Hand-timed">Hand-timed</option>
                    </FieldSelect>
                  </div>
                  <div>
                    <FieldLabel htmlFor="shuttleTime">5-10-5 Shuttle</FieldLabel>
                    <FieldInput
                      id="shuttleTime"
                      type="number"
                      step="0.01"
                      value={draft.shuttleTime}
                      onChange={(e) => patch("shuttleTime", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="verticalJump">Vertical (in)</FieldLabel>
                    <FieldInput
                      id="verticalJump"
                      type="number"
                      step="0.1"
                      value={draft.verticalJump}
                      onChange={(e) => patch("verticalJump", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="benchPress">Bench (lbs)</FieldLabel>
                    <FieldInput
                      id="benchPress"
                      type="number"
                      value={draft.benchPress}
                      onChange={(e) => patch("benchPress", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="squatMax">Squat (lbs)</FieldLabel>
                    <FieldInput
                      id="squatMax"
                      type="number"
                      value={draft.squatMax}
                      onChange={(e) => patch("squatMax", Number(e.target.value))}
                    />
                  </div>
                </div>
              </SectionShell>
            )}

            {activeSection === "academics" && (
              <SectionShell title="Academics & Eligibility">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <FieldLabel htmlFor="gpa">Unweighted GPA</FieldLabel>
                    <FieldInput
                      id="gpa"
                      type="number"
                      step="0.01"
                      min={0}
                      max={4}
                      value={draft.gpa}
                      onChange={(e) => patch("gpa", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="coreGpa">Core NCAA GPA</FieldLabel>
                    <FieldInput
                      id="coreGpa"
                      type="number"
                      step="0.01"
                      min={0}
                      max={4}
                      value={draft.coreGpa}
                      onChange={(e) => patch("coreGpa", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="satScore">SAT</FieldLabel>
                    <FieldInput
                      id="satScore"
                      type="number"
                      min={400}
                      max={1600}
                      value={draft.satScore ?? ""}
                      onChange={(e) =>
                        patch("satScore", e.target.value === "" ? undefined : Number(e.target.value))
                      }
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="actScore">ACT</FieldLabel>
                    <FieldInput
                      id="actScore"
                      type="number"
                      min={1}
                      max={36}
                      value={draft.actScore ?? ""}
                      onChange={(e) =>
                        patch("actScore", e.target.value === "" ? undefined : Number(e.target.value))
                      }
                    />
                  </div>
                  <div className="md:col-span-2">
                    <FieldLabel htmlFor="intendedMajor">Intended Major</FieldLabel>
                    <FieldInput
                      id="intendedMajor"
                      value={draft.intendedMajor}
                      onChange={(e) => patch("intendedMajor", e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <FieldLabel htmlFor="ncaaEligibilityId">NCAA Eligibility ID</FieldLabel>
                    <FieldInput
                      id="ncaaEligibilityId"
                      value={draft.ncaaEligibilityId}
                      onChange={(e) => patch("ncaaEligibilityId", e.target.value)}
                    />
                  </div>
                </div>
              </SectionShell>
            )}

            {activeSection === "media" && (
              <SectionShell title="Film & Social Media">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <FieldLabel htmlFor="hudlUrl">Hudl URL</FieldLabel>
                    <FieldInput
                      id="hudlUrl"
                      type="url"
                      value={draft.hudlUrl}
                      onChange={(e) => patch("hudlUrl", e.target.value)}
                      placeholder="https://www.hudl.com/..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <FieldLabel htmlFor="youtubeFilmUrl">YouTube Film</FieldLabel>
                    <FieldInput
                      id="youtubeFilmUrl"
                      type="url"
                      value={draft.youtubeFilmUrl ?? ""}
                      onChange={(e) => patch("youtubeFilmUrl", e.target.value || undefined)}
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="twitterHandle">X / Twitter</FieldLabel>
                    <FieldInput
                      id="twitterHandle"
                      value={draft.twitterHandle}
                      onChange={(e) => patch("twitterHandle", e.target.value)}
                      placeholder="@handle"
                    />
                  </div>
                  <div>
                    <FieldLabel htmlFor="instagramHandle">Instagram</FieldLabel>
                    <FieldInput
                      id="instagramHandle"
                      value={draft.instagramHandle ?? ""}
                      onChange={(e) => patch("instagramHandle", e.target.value || undefined)}
                      placeholder="@handle"
                    />
                  </div>
                </div>
              </SectionShell>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 p-4 sm:p-5 border-t border-slate-800 bg-slate-900 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[44px] px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black inline-flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4 shrink-0" />
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SectionShell: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section className="space-y-4">
    <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{title}</h3>
    {children}
  </section>
);
