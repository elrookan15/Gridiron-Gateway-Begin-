import React, { useState, useEffect } from "react";
import { AthleteProfile, UserRole } from "./types";
import { INITIAL_ATHLETE_PROFILE } from "./data/mockData";
import { Navbar } from "./components/Navbar";
import { OnboardingWizard } from "./components/OnboardingWizard";
import { AthleteProfileCard } from "./components/AthleteProfileCard";
import { LeaderboardTop250 } from "./components/LeaderboardTop250";
import { CampSearchEngine } from "./components/CampSearchEngine";
import { AIRecruitingAssistant } from "./components/AIRecruitingAssistant";
import { NcaaEligibilityTracker } from "./components/NcaaEligibilityTracker";
import { CoachMessagingFeed } from "./components/CoachMessagingFeed";
import { TechDocsView } from "./components/TechDocsView";
import { TopWeeklyHighlights } from "./components/TopWeeklyHighlights";
import { CoachesDirectory } from "./components/CoachesDirectory";
import { SchoolsDirectory } from "./components/SchoolsDirectory";
import { TransferPortalModule } from "./components/TransferPortalModule";
import { CoachPipelineBoard } from "./components/CoachPipelineBoard";
import { RecruitingPipeline } from "./components/RecruitingPipeline";
import { AuthManager } from "./components/AuthManager";
import { CoachWorkspace } from "./components/CoachWorkspace";
import { ComplianceDashboard } from "./components/ComplianceDashboard";
import { AthleteDossier } from "./components/AthleteDossier";
import { GridironGatewayDashboard } from "./components/GridironGatewayDashboard";

export function App() {
  const [profile, setProfile] = useState<AthleteProfile>(INITIAL_ATHLETE_PROFILE);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("gg_theme") as "dark" | "light") || "dark";
  });

  useEffect(() => {
    localStorage.setItem("gg_theme", theme);
    if (theme === "light") {
      document.documentElement.classList.add("light-theme");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.remove("light-theme");
      document.documentElement.classList.add("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const [activeTab, setActiveTab] = useState<
    | "gateway_center"
    | "profile"
    | "dossier"
    | "top250"
    | "highlights"
    | "coaches"
    | "schools"
    | "transfer_portal"
    | "coach_pipeline"
    | "coach_workspace"
    | "camps"
    | "ai_assistant"
    | "ncaa"
    | "coach_views"
    | "compliance"
    | "tech_docs"
  >("profile");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>("Athlete");

  const handleCompleteOnboarding = (updatedProfile: AthleteProfile) => {
    setProfile(updatedProfile);
    setShowOnboarding(false);
    setActiveTab("profile");
  };

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors duration-300 ${
      theme === "light"
        ? "light-theme bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-slate-950"
        : "bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950"
    }`}>
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={setUserRole}
        onOpenOnboarding={() => setShowOnboarding(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Render Area */}
      <main className="pb-16">
        {activeTab === "gateway_center" && <GridironGatewayDashboard />}

        {activeTab === "profile" && (
          <AthleteProfileCard
            profile={profile}
            onEditProfile={() => setShowOnboarding(true)}
            onOpenAiAssistant={() => setActiveTab("ai_assistant")}
            onUpdateProfile={(updated) => setProfile(updated)}
          />
        )}

        {activeTab === "dossier" && (
          <AthleteDossier athleteProfile={profile} />
        )}

        {activeTab === "top250" && (
          <div className="space-y-8">
            <LeaderboardTop250 />
            <div className="max-w-6xl mx-auto px-4">
              <TopWeeklyHighlights />
            </div>
          </div>
        )}

        {activeTab === "highlights" && (
          <div className="max-w-6xl mx-auto px-4 py-8">
            <TopWeeklyHighlights />
          </div>
        )}

        {activeTab === "coaches" && <CoachesDirectory />}

        {activeTab === "schools" && (
          <SchoolsDirectory
            onSelectSchoolForTarget={(schoolName) => {
              if (!profile.topTargetSchools.includes(schoolName)) {
                setProfile((prev) => ({
                  ...prev,
                  topTargetSchools: [...prev.topTargetSchools, schoolName],
                }));
              }
            }}
            onAddOfferSchool={(schoolName, division, conference) => {
              const offerExists = profile.offers.some((o) => o.schoolName === schoolName);
              if (!offerExists) {
                setProfile((prev) => ({
                  ...prev,
                  offers: [
                    ...prev.offers,
                    {
                      id: `offer-${Date.now()}`,
                      schoolName,
                      division,
                      conference,
                      offerDate: "2026-08-01",
                      status: "Offered",
                    },
                  ],
                }));
              }
            }}
          />
        )}

        {activeTab === "transfer_portal" && (
          <div className="max-w-6xl mx-auto px-4 py-8">
            <TransferPortalModule />
          </div>
        )}

        {activeTab === "coach_pipeline" && (
          <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
            <AuthManager />
            <RecruitingPipeline schoolId="fbs-texas" />
            <details className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <summary className="cursor-pointer text-xs font-bold text-slate-400 uppercase tracking-wider min-h-[44px] flex items-center">
                Legacy mock pipeline board
              </summary>
              <div className="mt-4">
                <CoachPipelineBoard />
              </div>
            </details>
          </div>
        )}

        {activeTab === "coach_workspace" && (
          <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6">
            <CoachWorkspace />
          </div>
        )}

        {activeTab === "camps" && <CampSearchEngine />}

        {activeTab === "ai_assistant" && (
          <AIRecruitingAssistant athleteProfile={profile} />
        )}

        {activeTab === "ncaa" && <NcaaEligibilityTracker />}

        {activeTab === "coach_views" && <CoachMessagingFeed />}

        {activeTab === "compliance" && <ComplianceDashboard />}

        {activeTab === "tech_docs" && <TechDocsView />}
      </main>

      {/* 25-30 QUESTION ONBOARDING WIZARD MODAL OVERLAY */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md overflow-y-auto p-4 sm:p-6 flex justify-center items-start">
          <div className="w-full max-w-5xl my-auto">
            <OnboardingWizard
              initialProfile={profile}
              onComplete={handleCompleteOnboarding}
              onClose={() => setShowOnboarding(false)}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Gridiron Gateway Recruiting Network. Built for High School Student-Athletes & College Coaches.</p>
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setActiveTab("compliance")}
              className="hover:text-amber-400 underline font-semibold flex items-center gap-1"
            >
              NIL & Compliance Gate
            </button>
            <button
              onClick={() => setActiveTab("tech_docs")}
              className="hover:text-emerald-400 underline font-semibold"
            >
              System Architecture & Schema
            </button>
            <button
              onClick={() => setShowOnboarding(true)}
              className="hover:text-emerald-400 underline font-semibold"
            >
              25-30 Question Profile Builder
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
