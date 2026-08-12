import React, { useState } from "react";
import { AthleteProfile, Position, GradYear, CollegeOffer, CollegeDivision } from "../types";
import { CheckCircle2, ChevronRight, ChevronLeft, Sparkles, Plus, Trash2, ShieldCheck, Dumbbell, BookOpen, Video, Award, Target, User } from "lucide-react";

import { X } from "lucide-react";
import { INITIAL_ATHLETE_PROFILE } from "../data/mockData";

export interface OnboardingWizardProps {
  profile?: AthleteProfile;
  initialProfile?: AthleteProfile;
  onSaveProfile?: (updated: AthleteProfile) => void;
  onComplete?: (updated: AthleteProfile) => void;
  onNavigateToProfile?: () => void;
  onClose?: () => void;
}

const STEPS = [
  { id: 1, title: "Basic & Contact", icon: User, questions: "Q1-Q4" },
  { id: 2, title: "Physical & Athletic", icon: Dumbbell, questions: "Q5-Q9" },
  { id: 3, title: "Verified Stats", icon: ShieldCheck, questions: "Q10-Q14" },
  { id: 4, title: "Academic Credentials", icon: BookOpen, questions: "Q15-Q18" },
  { id: 5, title: "Film & Social Media", icon: Video, questions: "Q19-Q21" },
  { id: 6, title: "Season Stats & Honors", icon: Award, questions: "Q22-Q25" },
  { id: 7, title: "Recruiting & Preferences", icon: Target, questions: "Q26-Q30" },
];

const POSITIONS: Position[] = ["QB", "RB", "WR", "TE", "OT", "OG", "C", "DE", "DT", "EDGE", "LB", "CB", "S", "ATH", "K", "P", "LS"];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  profile,
  initialProfile,
  onSaveProfile,
  onComplete,
  onNavigateToProfile,
  onClose,
}) => {
  const baseProfile = initialProfile || profile || INITIAL_ATHLETE_PROFILE;
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<AthleteProfile>(baseProfile);
  const [newOfferSchool, setNewOfferSchool] = useState("");
  const [newOfferDivision, setNewOfferDivision] = useState<CollegeDivision>("FBS");
  const [newOfferConf, setNewOfferConf] = useState("SEC");
  const [targetSchoolInput, setTargetSchoolInput] = useState("");

  const updateField = (field: keyof AthleteProfile, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddOffer = () => {
    if (!newOfferSchool.trim()) return;
    const newOffer: CollegeOffer = {
      id: Date.now().toString(),
      schoolName: newOfferSchool.trim(),
      division: newOfferDivision,
      conference: newOfferConf,
      offerDate: new Date().toISOString().split("T")[0],
      status: "Offered",
      schoolColor: "#BF5700",
    };
    setFormData((prev) => ({
      ...prev,
      offers: [...prev.offers, newOffer],
    }));
    setNewOfferSchool("");
  };

  const handleRemoveOffer = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      offers: prev.offers.filter((o) => o.id !== id),
    }));
  };

  const handleAddTargetSchool = () => {
    if (!targetSchoolInput.trim()) return;
    if (formData.topTargetSchools.length >= 5) return;
    setFormData((prev) => ({
      ...prev,
      topTargetSchools: [...prev.topTargetSchools, targetSchoolInput.trim()],
    }));
    setTargetSchoolInput("");
  };

  const handleRemoveTargetSchool = (school: string) => {
    setFormData((prev) => ({
      ...prev,
      topTargetSchools: prev.topTargetSchools.filter((s) => s !== school),
    }));
  };

  const handleFillDemoData = () => {
    const demo: AthleteProfile = {
      fullName: "Marcus 'Thunder' Jackson",
      highSchool: "Duncanville High School",
      cityState: "Duncanville, TX",
      gradClass: 2026,
      primaryEmail: "marcus.jackson2026@gmail.com",
      primaryPhone: "(214) 555-0819",
      parentName: "Derrick Jackson",
      parentEmailPhone: "derrick.j@gmail.com | (214) 555-0820",

      primaryPosition: "EDGE",
      secondaryPosition: "LB",
      heightFeet: 6,
      heightInches: 4,
      weightLbs: 235,
      handSizeInches: 10.25,
      armLengthInches: 34.0,

      fortyTime: 4.54,
      fortyTimingType: "Laser",
      shuttleTime: 4.18,
      verticalJump: 38.0,
      benchPress: 315,
      squatMax: 485,

      gpa: 3.85,
      weightedGpa: 4.25,
      coreGpa: 3.78,
      satScore: 1260,
      actScore: 27,
      intendedMajor: "Kinesiology / Sports Medicine",

      hudlUrl: "https://hudl.com/profile/marcus-jackson-edge",
      youtubeFilmUrl: "https://youtube.com/watch?v=marcus_jackson_senior_highlights",
      twitterHandle: "@MarcusJacksonEDGE",
      instagramHandle: "@m.jackson_99",

      seasonStats: "14.5 Sacks, 24 TFLs, 68 Total Tackles, 4 Forced Fumbles, 2 Defensive TDs",
      honors: "6A All-State 1st Team EDGE | District Defensive Player of the Year | MaxPreps All-American",
      isTeamCaptain: true,
      varsityStarterYears: 3,

      ncaaEligibilityId: "2509182311",
      offers: [
        { id: "d1", schoolName: "Georgia Bulldogs", division: "FBS", conference: "SEC", offerDate: "2025-02-10", status: "Offered", schoolColor: "#BA0C2F" },
        { id: "d2", schoolName: "Oregon Ducks", division: "FBS", conference: "Big Ten", offerDate: "2025-02-18", status: "Offered", schoolColor: "#154734" },
        { id: "d3", schoolName: "Texas Longhorns", division: "FBS", conference: "SEC", offerDate: "2025-03-01", status: "Offered", schoolColor: "#BF5700" },
        { id: "d4", schoolName: "Ohio State Buckeyes", division: "FBS", conference: "Big Ten", offerDate: "2025-03-15", status: "Offered", schoolColor: "#BB0000" }
      ],
      topTargetSchools: ["Georgia", "Oregon", "Texas", "Ohio State", "Alabama"],
      preferredEnvironment: "College Town",
      preferredCampusSize: "Large (15,000+)",
      commitmentStatus: "Uncommitted",
      starRating: 5,
    };
    setFormData(demo);
  };

  const handleFinish = () => {
    if (onComplete) onComplete(formData);
    if (onSaveProfile) onSaveProfile(formData);
    if (onNavigateToProfile) onNavigateToProfile();
    if (onClose) onClose();
  };

  const progressPercent = Math.round((currentStep / STEPS.length) * 100);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-white">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 p-6 rounded-2xl border border-slate-800 shadow-xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> 25-30 Question Recruiting Wizard
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Student-Athlete Onboarding Builder
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Build your NCAA-compliant recruiting profile with verified metrics, academics, and film.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleFillDemoData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-semibold text-xs transition-all shadow-md shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Auto-Fill 5★ Recruit Demo
          </button>
          {(onClose || onNavigateToProfile) && (
            <button
              onClick={() => {
                if (onClose) onClose();
                else if (onNavigateToProfile) onNavigateToProfile();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Close Wizard"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar & Step Tracker */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 mb-8">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
          <span>STEP {currentStep} OF 7: {STEPS[currentStep - 1].title.toUpperCase()}</span>
          <span className="text-emerald-400">{progressPercent}% COMPLETE</span>
        </div>
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>

        {/* Step Tabs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isDone = currentStep > step.id;

            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex flex-col items-center p-2.5 rounded-xl border text-center transition-all ${
                  isActive
                    ? "bg-emerald-950/80 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/10"
                    : isDone
                    ? "bg-slate-800/80 border-slate-700 text-slate-300"
                    : "bg-slate-950/40 border-slate-800/60 text-slate-500 hover:text-slate-400"
                }`}
              >
                <div className="flex items-center justify-center w-7 h-7 rounded-lg mb-1 bg-slate-800 border border-slate-700">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                  )}
                </div>
                <span className="text-[11px] font-bold truncate w-full">{step.title}</span>
                <span className="text-[9px] text-slate-500">{step.questions}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP CONTENT FORMS */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl mb-8">
        {/* STEP 1: Basic & Contact Info (Q1-4) */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-400" /> 1. Basic & Contact Information (Q1-Q4)
              </h2>
              <p className="text-xs text-slate-400 mt-1">Provide accurate contact info so college scouts & compliance officers can reach you.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Q1. Full Student-Athlete Name *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  placeholder="e.g. Caden Carter"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Q2. High School Name & City/State *</label>
                <input
                  type="text"
                  value={formData.highSchool}
                  onChange={(e) => updateField("highSchool", e.target.value)}
                  placeholder="e.g. Allen High School"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 mb-2"
                />
                <input
                  type="text"
                  value={formData.cityState}
                  onChange={(e) => updateField("cityState", e.target.value)}
                  placeholder="City, State (e.g. Allen, TX)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Q3. Graduation Class Year *</label>
                <select
                  value={formData.gradClass}
                  onChange={(e) => updateField("gradClass", Number(e.target.value) as GradYear)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value={2025}>Class of 2025 (Senior)</option>
                  <option value={2026}>Class of 2026 (Junior)</option>
                  <option value={2027}>Class of 2027 (Sophomore)</option>
                  <option value={2028}>Class of 2028 (Freshman)</option>
                  <option value={2029}>Class of 2029</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Q4. Primary Athlete Email & Phone *</label>
                <input
                  type="email"
                  value={formData.primaryEmail}
                  onChange={(e) => updateField("primaryEmail", e.target.value)}
                  placeholder="athlete@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 mb-2"
                />
                <input
                  type="tel"
                  value={formData.primaryPhone}
                  onChange={(e) => updateField("primaryPhone", e.target.value)}
                  placeholder="(555) 000-0000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="sm:col-span-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Parent / Guardian Contact Info (NCAA Compliance Requirement)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={formData.parentName}
                    onChange={(e) => updateField("parentName", e.target.value)}
                    placeholder="Parent Name (e.g. Marcus Carter)"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    value={formData.parentEmailPhone}
                    onChange={(e) => updateField("parentEmailPhone", e.target.value)}
                    placeholder="Parent Email / Phone"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Physical & Athletic Metrics (Q5-9) */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-emerald-400" /> 2. Physical & Athletic Metrics (Q5-Q9)
              </h2>
              <p className="text-xs text-slate-400 mt-1">Enter your exact height, weight, and frame measurements evaluated by scouts.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Q5. Primary Football Position *</label>
                <select
                  value={formData.primaryPosition}
                  onChange={(e) => updateField("primaryPosition", e.target.value as Position)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {POSITIONS.map((pos) => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Q6. Secondary Position (Optional)</label>
                <select
                  value={formData.secondaryPosition || ""}
                  onChange={(e) => updateField("secondaryPosition", e.target.value ? (e.target.value as Position) : undefined)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">None / Single Position</option>
                  {POSITIONS.map((pos) => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Q7. Height (Feet & Inches) *</label>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2">
                    <input
                      type="number"
                      min={5}
                      max={7}
                      value={formData.heightFeet}
                      onChange={(e) => updateField("heightFeet", Number(e.target.value))}
                      className="w-full bg-transparent text-sm font-bold text-white focus:outline-none"
                    />
                    <span className="text-xs text-slate-400 font-semibold ml-1">ft</span>
                  </div>
                  <div className="flex-1 flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2">
                    <input
                      type="number"
                      min={0}
                      max={11}
                      value={formData.heightInches}
                      onChange={(e) => updateField("heightInches", Number(e.target.value))}
                      className="w-full bg-transparent text-sm font-bold text-white focus:outline-none"
                    />
                    <span className="text-xs text-slate-400 font-semibold ml-1">in</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Q8. Body Weight (lbs) *</label>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2">
                  <input
                    type="number"
                    value={formData.weightLbs}
                    onChange={(e) => updateField("weightLbs", Number(e.target.value))}
                    className="w-full bg-transparent text-sm font-bold text-white focus:outline-none"
                  />
                  <span className="text-xs text-slate-400 font-semibold">lbs</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Q9. Hand Size (Inches)</label>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2">
                  <input
                    type="number"
                    step={0.125}
                    value={formData.handSizeInches}
                    onChange={(e) => updateField("handSizeInches", Number(e.target.value))}
                    className="w-full bg-transparent text-sm text-white focus:outline-none"
                  />
                  <span className="text-xs text-slate-400">in</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Q9b. Arm Length (Inches)</label>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2">
                  <input
                    type="number"
                    step={0.25}
                    value={formData.armLengthInches}
                    onChange={(e) => updateField("armLengthInches", Number(e.target.value))}
                    className="w-full bg-transparent text-sm text-white focus:outline-none"
                  />
                  <span className="text-xs text-slate-400">in</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Verified Performance Stats (Q10-14) */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> 3. Verified Combine Performance (Q10-Q14)
              </h2>
              <p className="text-xs text-slate-400 mt-1">Laser-timed or combine-verified athletic performance testing numbers.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Q10. 40-Yard Dash Time (Seconds) *</label>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2">
                    <input
                      type="number"
                      step={0.01}
                      value={formData.fortyTime}
                      onChange={(e) => updateField("fortyTime", Number(e.target.value))}
                      className="w-full bg-transparent text-sm font-bold text-amber-400 focus:outline-none"
                    />
                    <span className="text-xs text-slate-400 font-semibold ml-1">sec</span>
                  </div>
                  <select
                    value={formData.fortyTimingType}
                    onChange={(e) => updateField("fortyTimingType", e.target.value as "Laser" | "Hand-timed")}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Laser">Laser-Timed (Official)</option>
                    <option value="Hand-timed">Hand-Timed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Q11. 5-10-5 Pro Shuttle Time (Seconds)</label>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2">
                  <input
                    type="number"
                    step={0.01}
                    value={formData.shuttleTime}
                    onChange={(e) => updateField("shuttleTime", Number(e.target.value))}
                    className="w-full bg-transparent text-sm text-white focus:outline-none"
                  />
                  <span className="text-xs text-slate-400 font-semibold">sec</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Q12. Vertical Jump (Inches)</label>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2">
                  <input
                    type="number"
                    step={0.5}
                    value={formData.verticalJump}
                    onChange={(e) => updateField("verticalJump", Number(e.target.value))}
                    className="w-full bg-transparent text-sm text-white focus:outline-none"
                  />
                  <span className="text-xs text-slate-400 font-semibold">in</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Q13. Bench Press Max (lbs)</label>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2">
                  <input
                    type="number"
                    value={formData.benchPress}
                    onChange={(e) => updateField("benchPress", Number(e.target.value))}
                    className="w-full bg-transparent text-sm text-white focus:outline-none"
                  />
                  <span className="text-xs text-slate-400 font-semibold">lbs</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Q14. Squat Max (lbs)</label>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2">
                  <input
                    type="number"
                    value={formData.squatMax}
                    onChange={(e) => updateField("squatMax", Number(e.target.value))}
                    className="w-full bg-transparent text-sm text-white focus:outline-none"
                  />
                  <span className="text-xs text-slate-400 font-semibold">lbs</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Academic Credentials (Q15-18) */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" /> 4. Academic Credentials & NCAA Eligibility (Q15-Q18)
              </h2>
              <p className="text-xs text-slate-400 mt-1">Colleges require core GPA standards for NCAA Division I & II qualifying status.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Q15. Unweighted Cumulative GPA *</label>
                <input
                  type="number"
                  step={0.01}
                  min={0.0}
                  max={4.0}
                  value={formData.gpa}
                  onChange={(e) => updateField("gpa", Number(e.target.value))}
                  placeholder="3.85"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Q15b. Weighted GPA</label>
                <input
                  type="number"
                  step={0.01}
                  value={formData.weightedGpa}
                  onChange={(e) => updateField("weightedGpa", Number(e.target.value))}
                  placeholder="4.25"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Q16. Core NCAA GPA (16 Core Courses)</label>
                <input
                  type="number"
                  step={0.01}
                  value={formData.coreGpa}
                  onChange={(e) => updateField("coreGpa", Number(e.target.value))}
                  placeholder="3.75"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Q17. Test Scores (SAT / ACT)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={formData.satScore || ""}
                    onChange={(e) => updateField("satScore", e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="SAT (e.g. 1280)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                  <input
                    type="number"
                    value={formData.actScore || ""}
                    onChange={(e) => updateField("actScore", e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="ACT (e.g. 28)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Q18. Intended College Major / Academic Field</label>
                <input
                  type="text"
                  value={formData.intendedMajor}
                  onChange={(e) => updateField("intendedMajor", e.target.value)}
                  placeholder="e.g. Business Administration, Kinesiology, Engineering"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Film & Social Media (Q19-21) */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-emerald-400" /> 5. Game Film & Social Handles (Q19-Q21)
              </h2>
              <p className="text-xs text-slate-400 mt-1">Film is currency in football recruiting. Provide your Hudl and social links.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Q19. Hudl Highlight Reel URL *</label>
                <input
                  type="url"
                  value={formData.hudlUrl}
                  onChange={(e) => updateField("hudlUrl", e.target.value)}
                  placeholder="https://hudl.com/profile/123456/your-name"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-cyan-400 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Q20. Full Game Film Link (YouTube / Vimeo)</label>
                <input
                  type="url"
                  value={formData.youtubeFilmUrl || ""}
                  onChange={(e) => updateField("youtubeFilmUrl", e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Q21. X (Twitter) Handle *</label>
                  <input
                    type="text"
                    value={formData.twitterHandle}
                    onChange={(e) => updateField("twitterHandle", e.target.value)}
                    placeholder="@YourTwitterHandle"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-cyan-400 focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">College coaches heavily use X for recruiting DM communication.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Q21b. Instagram Handle</label>
                  <input
                    type="text"
                    value={formData.instagramHandle || ""}
                    onChange={(e) => updateField("instagramHandle", e.target.value)}
                    placeholder="@YourInstagramHandle"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-pink-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Q21c. Facebook Handle / Link</label>
                  <input
                    type="text"
                    value={formData.facebookHandle || ""}
                    onChange={(e) => updateField("facebookHandle", e.target.value)}
                    placeholder="facebook.com/yourname"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-blue-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Season Stats & Honors (Q22-25) */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" /> 6. On-Field Season Stats & Honors (Q22-Q25)
              </h2>
              <p className="text-xs text-slate-400 mt-1">Key production numbers, awards, and team leadership credentials.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Q22. Key Season Performance Stats *</label>
                <textarea
                  rows={2}
                  value={formData.seasonStats}
                  onChange={(e) => updateField("seasonStats", e.target.value)}
                  placeholder="e.g. 3,840 Passing Yds, 42 TDs, 4 INTs, 510 Rushing Yds, 8 Rushing TDs"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Q23. Accolades & All-State / All-Conference Honors *</label>
                <textarea
                  rows={2}
                  value={formData.honors}
                  onChange={(e) => updateField("honors", e.target.value)}
                  placeholder="e.g. 1st Team All-State, District MVP, All-Metro 1st Team, Rivals Camp Top Performer"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    id="teamCaptain"
                    checked={formData.isTeamCaptain}
                    onChange={(e) => updateField("isTeamCaptain", e.target.checked)}
                    className="w-5 h-5 rounded accent-emerald-500"
                  />
                  <label htmlFor="teamCaptain" className="text-xs font-semibold text-white cursor-pointer">
                    Q24. Voted Team Captain?
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Q25. Years as Varsity Starter</label>
                  <select
                    value={formData.varsityStarterYears}
                    onChange={(e) => updateField("varsityStarterYears", Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value={1}>1 Year Starter</option>
                    <option value={2}>2 Years Starter</option>
                    <option value={3}>3 Years Starter</option>
                    <option value={4}>4 Years Varsity Starter</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: Recruiting & Preferences (Q26-30) */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" /> 7. Recruiting Status, Offers & Target Schools (Q26-Q30)
              </h2>
              <p className="text-xs text-slate-400 mt-1">Manage college offers, NCAA ID, and top target program preferences.</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Q26. NCAA Eligibility ID #</label>
                  <input
                    type="text"
                    value={formData.ncaaEligibilityId}
                    onChange={(e) => updateField("ncaaEligibilityId", e.target.value)}
                    placeholder="e.g. 2408912349"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Q30. Current Commitment Status</label>
                  <select
                    value={formData.commitmentStatus}
                    onChange={(e) => updateField("commitmentStatus", e.target.value as "Uncommitted" | "Committed" | "Decommitted")}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Uncommitted">Uncommitted (Open Recruiting)</option>
                    <option value="Committed">Committed to Program</option>
                    <option value="Decommitted">Decommitted</option>
                  </select>
                </div>
              </div>

              {/* Q27. College Offers List */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <label className="block text-xs font-semibold text-slate-300 mb-2">Q27. College Offers Received ({formData.offers.length})</label>
                
                {formData.offers.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                    {formData.offers.map((offer) => (
                      <div key={offer.id} className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
                        <div>
                          <p className="text-xs font-bold text-white">{offer.schoolName}</p>
                          <p className="text-[10px] text-slate-400">{offer.division} • {offer.conference}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveOffer(offer.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newOfferSchool}
                    onChange={(e) => setNewOfferSchool(e.target.value)}
                    placeholder="School Name (e.g. Alabama)"
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                  <select
                    value={newOfferDivision}
                    onChange={(e) => setNewOfferDivision(e.target.value as CollegeDivision)}
                    className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="FBS">FBS (D1)</option>
                    <option value="FCS">FCS (D1AA)</option>
                    <option value="DII">Division II</option>
                    <option value="DIII">Division III</option>
                    <option value="NAIA">NAIA (D4)</option>
                    <option value="JUCO">JUCO (NJCAA)</option>
                    <option value="PREP">PREP / Post-Grad</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddOffer}
                    className="flex items-center justify-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs"
                  >
                    <Plus className="w-4 h-4" /> Add Offer
                  </button>
                </div>
              </div>

              {/* Q28. Top 5 Target Programs */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <label className="block text-xs font-semibold text-slate-300 mb-2">Q28. Top 5 Target Programs / Colleges</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.topTargetSchools.map((school) => (
                    <span key={school} className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-emerald-500/30 rounded-full text-xs font-medium text-emerald-300">
                      {school}
                      <button type="button" onClick={() => handleRemoveTargetSchool(school)} className="hover:text-rose-400">
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {formData.topTargetSchools.length < 5 && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={targetSchoolInput}
                      onChange={(e) => setTargetSchoolInput(e.target.value)}
                      placeholder="e.g. Georgia Bulldogs"
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddTargetSchool}
                      className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-xl text-xs font-semibold"
                    >
                      Add Target
                    </button>
                  </div>
                )}
              </div>

              {/* Q29. Preferred Environment & Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Q29. Preferred Campus Environment</label>
                  <select
                    value={formData.preferredEnvironment}
                    onChange={(e) => updateField("preferredEnvironment", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                  >
                    <option value="College Town">College Town Environment</option>
                    <option value="Urban">Urban / Major City</option>
                    <option value="Suburban">Suburban</option>
                    <option value="Any">No Preference / Any</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Q29b. Preferred Campus Size</label>
                  <select
                    value={formData.preferredCampusSize}
                    onChange={(e) => updateField("preferredCampusSize", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none"
                  >
                    <option value="Large (15,000+)">Large University (15,000+ Students)</option>
                    <option value="Medium (5,000-15,000)">Medium Campus (5,000 - 15,000)</option>
                    <option value="Small (<5,000)">Small College (&lt; 5,000)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-800">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold text-white transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Previous Step
          </button>

          {currentStep < STEPS.length ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.min(STEPS.length, prev + 1))}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/20"
            >
              Next Step <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm transition-all shadow-xl shadow-emerald-500/30"
            >
              Save & Launch Recruiting Profile <CheckCircle2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
