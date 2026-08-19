# Gridiron Gateway — Product Overview, Feature Manual & Codebase Map

**Audience:** operators, coaches, compliance staff, recruits/parents, and engineers onboarding to this repository.  
**Canonical product guide:** [`README.md`](../README.md)  
**Live-data SPA spec:** [`docs/dashboard-spec.md`](./dashboard-spec.md)  
**Architecture rules:** [`AGENTS.md`](../AGENTS.md)  
**Types source of truth:** [`src/types.ts`](../src/types.ts)

This document is a full inventory of **what Gridiron Gateway is**, **every implemented surface**, **how to use each feature**, and **how the codebase is structured**. Implementation status is labeled honestly: **Live (Supabase/RLS)**, **Server-authoritative (Express)**, **Client demo / seed data**, or **Hybrid**.

---

## Table of contents

1. [What Gridiron Gateway is](#1-what-gridiron-gateway-is)
2. [Who it is for](#2-who-it-is-for)
3. [How to launch and navigate](#3-how-to-launch-and-navigate)
4. [Feature catalog (with instructions)](#4-feature-catalog-with-instructions)
5. [Codebase architecture](#5-codebase-architecture)
6. [Data models (`src/types.ts`)](#6-data-models-srctypests)
7. [Database & RLS](#7-database--rls)
8. [APIs, webhooks & edge functions](#8-apis-webhooks--edge-functions)
9. [Security, compliance & money math](#9-security-compliance--money-math)
10. [Ingestion pipeline](#10-ingestion-pipeline)
11. [Tests, CI & local setup](#11-tests-ci--local-setup)
12. [Implementation status matrix](#12-implementation-status-matrix)

---

## 1. What Gridiron Gateway is

Gridiron Gateway is an enterprise **collegiate football recruiting, sports analytics, team operations, and NCAA compliance** platform built for the **2026 House v. NCAA landscape**:

- **$20.5M** institutional revenue-share hard cap (`CAP_GM_HARD_CAP_CENTS = 2_050_000_000` in [`src/types.ts`](../src/types.ts))
- **105-man** roster limits
- **Transfer portal** volatility (hour-scale roster risk)
- **Third-party NIL** (CSC NIL Go / RallySafe) vs **institutional CAPS** (CapGM) — two separate regulatory planes
- **COPPA/FERPA** minor-protection and parental consent
- **Verified** combine / film / GPS metrics instead of self-reported highlight fraud

It is **not** a Next.js App Router product. It is a **Vite + React 19 SPA** with:

| Plane | Technology | Role |
|---|---|---|
| Presentation | React 19, Tailwind, shadcn `Slider` | Dark sports-tech UI |
| Live data | `@supabase/supabase-js` + PostgreSQL RLS | Schools, athletes, pipeline, NIL ledger, portal, consent |
| FinTech / telemetry | Express (`server.ts`) + WebSockets | RallySafe REST, BioScan stream, laser webhooks, compliance send |
| AI | Gemini (`@google/genai`) + Edge Function `gemini-assistant` | Recruiting letters, school generation |
| Computer vision | MediaPipe PoseLandmarker | TrueSpeed velocity authenticity |
| Web3 (adjacent) | Anchor program `programs/roundblock` | Exploding dynasty trade escrow (Solana) |

**Product thesis:** recruitment and performance evaluation are being reshaped by verified scouting data, automated NCAA gating, and real-time NIL valuation. Adjacent class-leading signals include S2 Cognition–style sports IQ, Catapult-class GPS wearables, and AI-doctored highlight reels (countered by TrueSpeed). AI **triages and verifies**; it never auto-approves compliance or NIL payouts.

### Design system (dark sports-tech)

| Token | Hex / class | Meaning |
|---|---|---|
| Backdrop | `#09090b` / `bg-slate-950` | App chrome |
| Surfaces | `bg-slate-900` + `border-slate-800` | Cards |
| Emerald | `#10b981` | Action, verified, positive cap/NIL |
| Cyan | `#06b6d4` | Physical speed, BioScan, TrueSpeed, laser |
| Amber | `#f59e0b` | Stars, camps, Top 250 |
| Purple | `#a855f7` | Academics, Cognition, film tags |
| Rose | `#f43f5e` | Compliance locks, portal blocks, legal |

Touch targets are specified at **≥ 44px** (`min-h-[44px]`). Money is **integer cents only**. Missing coach emails render **Contact not verified** — never a hallucinated `@university.edu`.

---

## 2. Who it is for

| Persona | Navbar / RBAC | What they do |
|---|---|---|
| **HS / JUCO recruit (and parent)** | Athlete / Parent | Build a 30-question dossier, claim offers, film, eligibility, NIL estimator, parent consent |
| **Head Coach / Roster GM** | College Coach + Gateway Center `HEAD_COACH_GM` | CapGM $20.5M, RallySafe, full film, pipeline |
| **Position Coach** | College Coach + `POSITION_COACH` | Position-filtered workspace, film, scouting alerts — **no CapGM mutation** |
| **Compliance Officer** | Compliance tab + `COMPLIANCE_OFFICER` | Audit logs, recruiting calendar, portal/NIL gates |
| **Fan / Scout** | Fan / Scout mode | Leaderboard, highlights, directories (read-oriented) |

Two RBAC layers exist:

1. **Global chrome** in [`Navbar.tsx`](../src/components/Navbar.tsx): Athlete / Coach / Fan.
2. **Command-center personas** in [`MultiTenantRoleSelector.tsx`](../src/components/MultiTenantRoleSelector.tsx): Head Coach/GM, Position Coach, Compliance Officer, Athlete Recruit (`MultiTenantUser` / `RolePermissionConfig` in [`src/types.ts`](../src/types.ts)).

**Security boundary:** school-scoped pipeline and NIL rows are filtered by **Postgres RLS + JWT**, not by hiding UI tabs. UI isolation is UX; RLS is the lock.

---

## 3. How to launch and navigate

### Local run

```bash
npm install
cp .env.example .env
# Set GEMINI_API_KEY, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY for live modules
npm run dev          # Express + Vite middleware on PORT (default 3000)
```

Production:

```bash
npx tsc --noEmit
npm run build
npm start            # serves dist/ + bundled Express
```

### Two navigation shells

1. **Top Navbar** ([`src/App.tsx`](../src/App.tsx) + [`Navbar.tsx`](../src/components/Navbar.tsx)) — primary SPA tabs.
2. **Gateway Command Center** — Navbar item **Gateway Center** → [`GridironGatewayDashboard.tsx`](../src/components/GridironGatewayDashboard.tsx). This is the front-office module rack (CapGM, Film, RallySafe, Laser, Parent Portal, RoundBlock, etc.).

### Navbar tabs (from `App.tsx`)

| Tab id | Label (typical) | Component |
|---|---|---|
| `gateway_center` | Gateway Center | `GridironGatewayDashboard` |
| `profile` | My Profile | `AthleteProfileCard` |
| `dossier` | Dossier | `AthleteDossier` |
| `top250` | Top 250 | `LeaderboardTop250` + `TopWeeklyHighlights` |
| `highlights` | Highlights | `TopWeeklyHighlights` |
| `coaches` | Coaches | `CoachesDirectory` |
| `schools` | Schools | `SchoolsDirectory` |
| `transfer_portal` | Transfer Portal | `TransferPortalModule` |
| `coach_pipeline` | Pipeline | `AuthManager` + `RecruitingPipeline` (+ legacy `CoachPipelineBoard`) |
| `coach_workspace` | Coach Workspace | `CoachWorkspace` |
| `camps` | Camps | `CampSearchEngine` |
| `ai_assistant` | AI Assistant | `AIRecruitingAssistant` |
| `ncaa` | NCAA Eligibility | `NcaaEligibilityTracker` |
| `coach_views` | Coach Views / Messages | `CoachMessagingFeed` |
| `compliance` | Compliance | `ComplianceDashboard` |
| `tech_docs` | Tech Docs | `TechDocsView` |
| `source_control` | Source Control | `SourceControlPanel` |

Theme toggle (dark/light) persists to `localStorage` key `gg_theme`.

### Gateway Center sub-tabs

| Sub-tab | Modules |
|---|---|
| Collegiate Directory | In-dashboard school search (seed) |
| Athlete Dossier | Printable scout package |
| NIL Estimator | `NILCalculator` + `NILValuationChart` |
| CapGM $20.5M | `CapGMRosterSimulator` (RBAC: `canAccessCapGM`) |
| AI Film Tagging | `AIFilmStudio` + legacy `AiFilmTaggingStudio` |
| Auto Scouting | `AutonomousScoutingAgent` + `CombineLaserApiModule` |
| Laser Combine | `CombineLaserApiModule` |
| Parent Portal | `ParentConsentPortal` |
| CSV Import | `SchoolsCsvImporter` |
| Cognition IQ | `CognitiveSchemeMatcher` |
| Gameplan AI | `AiGameplanGeneratorModule` |
| RoundBlock Trade | `RoundBlockTradeEscrowModule` |
| Tech Hub | `TrueSpeedModule` + `BioScanTelemetryModule` + `RallySafeEscrowModule` |

---

## 4. Feature catalog (with instructions)

Each feature lists **what it does**, **where it lives**, **data/types**, **how to use it**, and **status**.

---

### 4.1 Athlete profile builder & public card

**Status:** Client demo (React state in `App.tsx`; seed `INITIAL_ATHLETE_PROFILE` from [`src/data/mockData.ts`](../src/data/mockData.ts))  
**Types:** `AthleteProfile`, `CollegeOffer`, `Position`, `GradYear`  
**Files:** [`OnboardingWizard.tsx`](../src/components/OnboardingWizard.tsx), [`AthleteProfileCard.tsx`](../src/components/AthleteProfileCard.tsx), [`UserProfileEditor.tsx`](../src/components/UserProfileEditor.tsx)

**What it is:** 7-step, 25–30 question recruiting questionnaire covering contact, measurables, verified combine stats, academics, Hudl/social, honors, and school preferences.

**How to use:**

1. Open the app → **My Profile**, or click **25-30 Question Profile Builder** in the footer / **Onboarding** in the nav.
2. Complete steps:
   - Q1–4 Basic & Contact (`fullName`, `highSchool`, `cityState`, `gradClass`, emails/phones, parent)
   - Q5–9 Physical (`primaryPosition`, height/weight, hand/arm)
   - Q10–14 Verified Stats (40, shuttle, vertical, bench, squat; laser vs hand-timed)
   - Q15–18 Academics (GPA, core GPA, SAT/ACT, major)
   - Q19–21 Film & social (`hudlUrl`, YouTube, Twitter/IG)
   - Q22–25 Season stats, honors, captain years
   - Q26–30 NCAA ID, offers, target schools, campus preference, commitment
3. Save. The profile hydrates `AthleteProfileCard`.
4. On the card: share link, export PDF, open **Video Pitch Recorder**, **Endorsements**, **Timeline**, **Recruit Comparison**, or jump to the AI assistant.

**Nested profile tools:**

| Tool | File | Instructions |
|---|---|---|
| Video pitch | `VideoPitchRecorder.tsx` | Record a short intro; fields map to `videoIntroBio` (`whoIAm`, `strengths`, `whyRecruitMe`, …) |
| Social showcase | `SocialMediaShowcase.tsx` | Renders `SocialPost` feed tied to athlete handles |
| Endorsements | `EndorsementSection.tsx` | Qualitative coach endorsements (`CoachEndorsement`) — reputational only, not NIL pay |
| Timeline | `UnifiedRecruitingTimeline.tsx` | Offers, camps, rankings (`TimelineEvent`) |
| Compare | `RecruitComparisonModal.tsx` | Side-by-side measurables vs another recruit |

---

### 4.2 Verified athlete dossier

**Status:** Hybrid — Navbar dossier is client `AthleteProfile`; Gateway Center dossier is a printable seed package; live full join is `getAthleteProfileFull` → `AthleteFullProfile`  
**Files:** [`AthleteDossier.tsx`](../src/components/AthleteDossier.tsx), [`AthleteProfileModal.tsx`](../src/components/AthleteProfileModal.tsx)

**How to use (SPA dossier):** Navbar → **Dossier**. Copy scout package, print, review offers and measurables.

**How to use (live modal):** Navbar → **Top 250** → click a recruit row. Modal loads `AthleteFullProfile` (biometrics + `athlete_media` + `scholarship_offers`→`schools`). Close with **Escape** or outside click; body scroll locks while open.

---

### 4.3 Top 250 leaderboard & weekly highlights

**Status:** Live (Supabase `schools` + `athlete_profiles`) with empty/error shells  
**Types:** `LeaderboardRecruit` (service), `TopRecruit`, `WeeklyHighlight`  
**Files:** [`LeaderboardTop250.tsx`](../src/components/LeaderboardTop250.tsx), [`TopWeeklyHighlights.tsx`](../src/components/TopWeeklyHighlights.tsx), [`src/services/schoolsApi.ts`](../src/services/schoolsApi.ts)

**What it is:** National composite ranking grid. Composite score from `computeCompositeScore` (stars, TrueSpeed MPH, Cognition). Early Signing Day countdown is display-only.

**How to use:**

1. Navbar → **Top 250**.
2. Filter by position (`QB`…`ATH`) and class year (2025–2027).
3. Search name/school/state.
4. Click a row → `AthleteProfileModal`.
5. Scroll to **Top Weekly Highlights** (or Navbar → **Highlights**) to vote categories: TD, pick-6, juke, pancake, special teams.

Requires `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`. If unset, the grid shows a reserved-height error — it does **not** silently fall back to `mockData.ts` as the product database.

---

### 4.4 Multi-division schools directory

**Status:** Hybrid — static [`src/data/schoolsData.ts`](../src/data/schoolsData.ts) + optional Gemini school generator; production fetch is `fetchSchools`  
**Types:** `SchoolEntry`, `DatabaseSchool`, `DivisionTierEnum`  
**Files:** [`SchoolsDirectory.tsx`](../src/components/SchoolsDirectory.tsx), [`lib/geminiSchoolGeneratorEngine.ts`](../src/lib/geminiSchoolGeneratorEngine.ts)

**How to use:**

1. Navbar → **Schools**.
2. Filter division (FBS P4/G5, FCS, DII, DIII, NAIA, JUCO/Prep), state, conference; search name/mascot/city.
3. **Add to targets** / **Claim offer** writes into the in-session `AthleteProfile.offers` / `topTargetSchools` (does not mutate Postgres from this screen).
4. Optional: generate a school card via Gemini (`generateSchoolWithGemini`) — validated by `validateSchoolEntry` so invented emails are rejected.

Gateway Center → **Collegiate Directory** is a second, seed-based directory with copy-email and print utilities.

---

### 4.5 Coaches directory

**Status:** Client demo (`MOCK_COLLEGE_COACHES`)  
**Type:** `CollegeCoachProfile`  
**File:** [`CoachesDirectory.tsx`](../src/components/CoachesDirectory.tsx)

**How to use:** Navbar → **Coaches**. Filter conference / division / position group. Open a coach card. If `email` is missing, UI must show **Contact not verified**. Do not invent athletics addresses. Production contacts come from Sidearm/CSV into `college_coaches` (`DatabaseCoach.email` nullable).

---

### 4.6 Camp / showcase search

**Status:** Client demo (`MOCK_CAMPS`)  
**Type:** `CampEntry`  
**File:** [`CampSearchEngine.tsx`](../src/components/CampSearchEngine.tsx)

**How to use:** Navbar → **Camps**. Filter Mega Camp / Position Skills / Combine / Specialist. Bookmark, share, open `registerUrl`. Top-performer leaderboards show camp 40s, bench, broad jump, shuttle.

---

### 4.7 NCAA academic eligibility tracker

**Status:** Client calculator  
**Type:** `NcaaCourse`  
**File:** [`NcaaEligibilityTracker.tsx`](../src/components/NcaaEligibilityTracker.tsx)

**How to use:**

1. Navbar → **NCAA Eligibility**.
2. Maintain 16 NCAA core courses (English, Math, Natural/Social Science, extras).
3. Add/remove courses; set grade A–F or In Progress and credits (1.0 / 0.5).
4. Enter SAT/ACT. Core GPA uses 4.0 scale × credits (In Progress excluded).
5. Read DI / DII qualifier vs sliding-scale guidance. This is a **product calculator**, not an NCAA Eligibility Center filing.

---

### 4.8 Gemini AI recruiting assistant

**Status:** Live when Gemini + optional Edge Function configured  
**Types:** `PitchTone`, `GeminiOutreachRequest`  
**Files:** [`AIRecruitingAssistant.tsx`](../src/components/AIRecruitingAssistant.tsx), [`src/services/geminiAssistantApi.ts`](../src/services/geminiAssistantApi.ts), [`supabase/functions/gemini-assistant`](../supabase/functions/gemini-assistant/index.ts)

**How to use:**

1. Complete the athlete profile.
2. Navbar → **AI Assistant** (or **Open AI Assistant** from the profile card).
3. Choose tone: `IMMEDIATE_IMPACT` | `NFL_DEVELOPMENT` | `ACADEMIC_EXCELLENCE` | `HOMETOWN_HERO`.
4. Generate a coach-introduction draft. Copy. **Human review is required** before send — the assistant is scoped to general recruiting copy, not NIL negotiation (athlete-agent statutes).
5. Express also exposes `POST /api/ai/draft-email` and `POST /api/ai/scout-evaluation` (rate-limited).

---

### 4.9 Coach views & compliance-gated messaging

**Status:** Hybrid — UI seed messages; send path hits `dispatchComplianceGate`  
**Types:** `CoachView`, `ComplianceGateDispatchRequest`, `ComplianceEvaluation`  
**Files:** [`CoachMessagingFeed.tsx`](../src/components/CoachMessagingFeed.tsx), [`src/complianceEngine.ts`](../src/complianceEngine.ts), [`src/services/complianceGateApi.ts`](../src/services/complianceGateApi.ts)

**How to use:**

1. Navbar → **Coach Views**.
2. **Views** tab: who watched the profile / Hudl / downloaded stats (`CoachView.action`).
3. **Messages** tab: compose a reply. Dead period (`getCurrentNcaaPeriod` → `DEAD`) locks the composer.
4. Send calls the fail-closed gate: recruiting calendar + minor consent + inducement keyword scan. Blocked attempts are logged; they are **not** delivered.

Authoritative REST: `POST /api/messages/send` and `POST /api/v1/compliance/messaging-clearance`.

---

### 4.10 NCAA compliance dashboard

**Status:** Hybrid — in-memory engine ledger + optional `communication_audit_logs`  
**Types:** `ComplianceAuditLog`, `ClearanceStatus`, `NcaaRecruitingPeriod`  
**Files:** [`ComplianceDashboard.tsx`](../src/components/ComplianceDashboard.tsx), [`src/complianceEngine.ts`](../src/complianceEngine.ts)

**How to use:** Navbar → **Compliance** (or footer **NIL & Compliance Gate**). Review current NCAA period (Dead / Quiet / Contact / Evaluation). Search audit rows. Status badges: `CLEARED`, `BLOCKED_CALENDAR`, `BLOCKED_MINOR_CONSENT`, `BLOCKED_INDUCEMENT`, NIL flags.

`executeAndLogComplianceGate` persists to Postgres `compliance_audit_logs` when configured (`src/lib/complianceAuditPersist.ts`); production **fails closed** if the writer is missing.

---

### 4.11 Parent / guardian COPPA–FERPA consent portal

**Status:** Live (Supabase `parental_consents` + session bind)  
**Types:** `ParentConsentRecord`, `GuardianRelationship`, `MinorSafetyStatus`  
**Files:** [`ParentConsentPortal.tsx`](../src/components/ParentConsentPortal.tsx), [`src/lib/parentalConsentBind.ts`](../src/lib/parentalConsentBind.ts), [`src/services/parentalConsentApi.ts`](../src/services/parentalConsentApi.ts), migration `20260816120000_parental_consents.sql`

**What it is:** Legal consent for recruits under 18. Minors stay `contact_authorized = FALSE` until a consent row is inserted (Postgres trigger). Consent `athlete_id` **must equal** the authenticated athlete JWT (`bindConsentAthleteIdToSession`) — coaches cannot sign for a labeled dossier id.

**How to use:**

1. Sign in as the **athlete** (not a coach).
2. Gateway Center → **Parent Portal**.
3. Guardian enters name, email, relationship (`MOTHER` | `FATHER` | `LEGAL_GUARDIAN`).
4. Check **all three**: COPPA, messaging, biometric. Payload validator requires all `true`.
5. Type a digital signature. Submit.
6. Success flips messaging/biometric authorization for that athlete. RallySafe NIL disclosures remain a separate milestone acknowledgment.

REST mirror: `POST /api/v1/compliance/parent-consent`.

---

### 4.12 Transfer portal tracker

**Status:** Live (`public.transfer_portal_entries`)  
**Types:** `TransferPortalAthlete`, `PortalStatus`, `TransferType`  
**Files:** [`TransferPortalModule.tsx`](../src/components/TransferPortalModule.tsx), [`src/services/transferPortalApi.ts`](../src/services/transferPortalApi.ts), migration `20260816140000_transfer_portal_entries.sql`

**How to use:**

1. Navbar → **Transfer Portal**.
2. Filter `ACTIVE` / `WITHDRAWN` / `MATRICULATED` (default ACTIVE).
3. Search name/school/position. Read remaining eligibility, undergrad vs graduate transfer, origin (and optional destination) school colors.
4. Portal membership is also a **RallySafe hard lock**: `athleteInTransferPortal` blocks escrow release (HTTP 403 on `transfer.created` Stripe events).

---

### 4.13 Coach recruiting pipeline (live Kanban)

**Status:** Live (JWT + `school_staff_roles` RLS)  
**Types:** `PipelineOffer`, `RecruitingPipelineStage` (`Evaluating` → `Offered` → `Official Visit` → `Committed`)  
**Files:** [`RecruitingPipeline.tsx`](../src/components/RecruitingPipeline.tsx), [`AuthManager.tsx`](../src/components/AuthManager.tsx)

**How to use:**

1. Navbar → **Pipeline**.
2. Sign in via `AuthManager` (email/password; session persisted, JWT auto-attached to PostgREST). Dev fixtures exist for RLS testing only.
3. Board loads `getPipelineOffers(schoolId)` — **only that school’s rows** leave Postgres.
4. Advance/regress with chevrons (`updatePipelineOfferStage`). Client columns are UX; RLS is the security boundary.

Legacy drag board [`CoachPipelineBoard.tsx`](../src/components/CoachPipelineBoard.tsx) (`CoachPipelineProspect` stages Identified→Committed) is folded under **Legacy mock pipeline board**.

---

### 4.14 Coach workspace (target list CRM)

**Status:** Client demo  
**File:** [`CoachWorkspace.tsx`](../src/components/CoachWorkspace.tsx)

**How to use:** Navbar → **Coach Workspace**. Search/filter recruits by position, class, division, pipeline status (`High Priority` | `Watching` | `Offered` | `Cold`). Add notes, copy scout blurbs, open Hudl. This is the position-coach day board; the live Kanban is §4.13.

---

### 4.15 Multi-tenant RBAC switcher

**Status:** Client permission mask over Gateway Center  
**Types:** `MultiTenantUser`, `RolePermissionConfig`, `UserRole`  
**File:** [`MultiTenantRoleSelector.tsx`](../src/components/MultiTenantRoleSelector.tsx)

**How to use:** Open **Gateway Center**. Use the persona switcher:

| Role | CapGM | Film | Escrow | Messaging |
|---|---|---|---|---|
| Head Coach / GM | Yes | Yes | Yes | Yes |
| Position Coach | No | Yes | No | Position-filtered |
| Compliance Officer | No | Audit | View/lock | Gatekeeper |
| Athlete Recruit | No | Own film | Own milestones | Inbound |

`GET /api/v1/auth/permissions/:role` returns the same flags from Express.

---

### 4.16 CapGM $20.5M roster salary-cap simulator

**Status:** Client math engine + seed roster (integer cents)  
**Types:** `CapGmPlayer`, `CapGmState`, `CapGMRosterModel`, `CAP_GM_HARD_CAP_CENTS`  
**Files:** [`CapGMRosterSimulator.tsx`](../src/components/CapGMRosterSimulator.tsx), [`src/lib/capGmMath.ts`](../src/lib/capGmMath.ts)

**What it is:** Front-office allocator for House settlement **institutional revenue share (CAPS)**. This is **not** third-party NIL Go and **must not** write `nil_transactions`.

**How to use:**

1. Gateway Center → switch to **Head Coach / GM** → **CapGM $20.5M**.
2. Read remaining cap (`formatCapCents`) and usage tenths (`formatCapUsagePercent`).
3. Drag per-player sliders (`shadcn` Slider). UI dollars convert at the boundary via `dollarsToAllocatedCents` — roster state stays cents.
4. Watch EPA / retention risk. Under-market allocations raise `HIGH` / `CRITICAL` flight risk (`isPlayerCriticallyUnderfunded`).
5. Toggle retain vs cut. Hard cap is `2_050_000_000` cents. Step size `CAP_ALLOCATION_STEP_CENTS = 2_500_000` ($25k).

Tests: `npm run test:capgm`.

---

### 4.17 NIL valuation estimator (not escrow)

**Status:** Client integer-cents estimator — **decoupled from RallySafe**  
**Types:** `NilValuationInput`, `NilValuationCents`, `NilMarketDivision`  
**Files:** [`NILCalculator.tsx`](../src/components/NILCalculator.tsx), [`NILValuationChart.tsx`](../src/components/NILValuationChart.tsx), [`src/lib/nilValuation.ts`](../src/lib/nilValuation.ts)

**How to use:** Gateway Center → **NIL Estimator**. Set division (FBS P4 … PREP), position group, stars, followers, engagement tenths. Output splits athletic vs social cents (`estimateNilValuationCents`). **This never writes `nil_transactions` and never authorizes capital.**

Division multipliers live in `NIL_DIVISION_BPS` (P4 = 5.00x). Star baselines e.g. 5★ = `7_500_000` cents.

---

### 4.18 RallySafe NIL escrow & CSC NIL Go

**Status:** Hybrid — SPA ledger via Supabase; Express in-memory campaigns; Edge Function HMAC from CSC  
**Types:** `NilTransaction`, `NilEscrowCampaign`, `ClearinghouseStatus`, `NilRegulatoryPlane`  
**Files:** [`RallySafeEscrowModule.tsx`](../src/components/RallySafeEscrowModule.tsx), [`src/lib/rallySafeReleaseGate.ts`](../src/lib/rallySafeReleaseGate.ts), [`src/stripe-webhook-verification.ts`](../src/stripe-webhook-verification.ts), Edge Function `csc-nil-go-sync`

**Regulatory split:**

| Plane | System | Where money lives |
|---|---|---|
| `THIRD_PARTY_NIL_GO` | RallySafe + CSC NIL Go | `public.nil_transactions` |
| `INSTITUTIONAL_CAPS` | CapGM | Cap simulator only — **not** `nil_transactions` |

**Release predicate (`canReleaseNilEscrow`):** plane = NIL Go **AND** `clearinghouseStatus === CLEARED` **AND** Stripe milestone HMAC verified **AND** athlete **not** in transfer portal **AND** not already released. `NOT_CLEARED` is an eligibility crisis — UI hides **Release Funds**; Postgres `enforce_cleared_payout` CHECK + trigger `fn_lock_nil_clearinghouse_status` make the SPA unable to flip clearance.

**How to use (SPA):**

1. Gateway Center → **Tech Hub** (or RallySafe card).
2. Review deals: sponsor, cents, `PENDING` / `CLEARED` / `NOT_CLEARED` / `FLAGGED_FOR_REVIEW`.
3. **Release Funds** appears only when the gate passes. Call `releaseNilEscrowPayout`.
4. CSC posts to `POST /functions/v1/csc-nil-go-sync` with `x-csc-signature` (HMAC-SHA256 of raw body). Function uses **service role on the server only**.

**How to use (Express):**

- `POST /api/v1/rallysafe/campaigns` — create campaign (integer cents)
- `GET /api/v1/rallysafe/campaigns`
- `POST /api/v1/rallysafe/campaigns/:id/release` — same fail-closed gate
- `POST /api/v1/rallysafe/webhooks/stripe` — raw-buffer HMAC (`STRIPE_WEBHOOK_SECRET`)
- Reporting floor: `NIL_GO_REPORTING_THRESHOLD_CENTS = 60_000` ($600)

Tests: `npm run test:rallysafe`.

---

### 4.19 BioScan GPS wearable telemetry

**Status:** Server-authoritative ingest + WS egress; UI seeds then overlays live frames  
**Type:** `BioScanTelemetry`  
**Files:** [`BioScanTelemetryModule.tsx`](../src/components/BioScanTelemetryModule.tsx), [`server.ts`](../server.ts)

**How to use (UI):** Gateway Center → **Tech Hub**. Watch max MPH, accel/decel, player load, recovery, hardware (`Catapult Vector` | `WHOOP 4.0` | `Garmin Pro`). Module opens `ws(s)://{host}/api/v1/bioscan/stream/:athleteId`.

**How to use (hardware webhook):**

```http
POST /api/v1/bioscan/webhooks/catapult
Header: x-bioscan-secret: <BIOSCAN_WEBHOOK_SECRET>
```

Payload is stored in-memory (`BIOSCAN_TELEMETRY_DB`) and broadcast to WS clients. `GET /api/v1/bioscan/telemetry/:athleteId` reads last packet.

---

### 4.20 TrueSpeed film authenticity

**Status:** Client computer vision (MediaPipe)  
**Types:** `TrueSpeedTelemetry`, `TrueSpeedVerificationStatus`, `TrueSpeedAnalysis`  
**Files:** [`TrueSpeedModule.tsx`](../src/components/TrueSpeedModule.tsx), [`src/lib/trueSpeedPoseEngine.ts`](../src/lib/trueSpeedPoseEngine.ts), [`src/lib/trueSpeedKinematics.ts`](../src/lib/trueSpeedKinematics.ts)

**What it is:** Detects sped-up / framerate-tampered highlight reels by tracking hip/ankle landmarks, calibrating stride, and estimating peak MPH + 40 time.

**How to use:**

1. Gateway Center → **Tech Hub**.
2. Upload a clip. Pose landmarker runs (`initializePoseLandmarkerHeavy`).
3. Status: `UNVERIFIED` → `PROCESSING` → `AUTHENTICATED` | `REJECTED`.
4. Read `peakVelocityMph`, `verifiedFortyTime`, `averageStrideLengthInches`, `confidenceScore`.

---

### 4.21 Cognition / scheme-fit IQ

**Status:** Client demo profiles  
**Type:** `CognitiveProfile`  
**File:** [`CognitiveSchemeMatcher.tsx`](../src/components/CognitiveSchemeMatcher.tsx)

**How to use:** Gateway Center → **Cognition IQ**. Select an athlete. Review perception ms, tracking efficiency, pressure decision speed, and scheme match % (Air Raid, West Coast, Spread Option, 3-4 Blitz, Cover 3 Match). This is the S2-style sports-IQ surface; live scores belong on `athlete_profiles.cognition_score`.

---

### 4.22 AI HUDL film tagging studio

**Status:** Client session + Express auto-tag endpoint  
**Types:** `FilmAnalysisSession`, `FilmTag`, `FilmTagItem`, `PlayTagCategory`  
**Files:** [`AIFilmStudio.tsx`](../src/components/AIFilmStudio.tsx), [`AiFilmTaggingStudio.tsx`](../src/components/AiFilmTaggingStudio.tsx), [`src/lib/filmSeek.ts`](../src/lib/filmSeek.ts)

**How to use:**

1. Gateway Center → **AI Film Tagging**.
2. Upload tape. Play/pause; **Scan** to generate temporal tags (`ROUTE_TREE`, `COVERAGE`, `BLOCKING_SCHEME`, `PENALTY`).
3. Click a tag → `seekVideoToTimestamp`.
4. Legacy accordion **HUDL play-card studio** shows coverage shells (Cover 1/2/3/4) and route tree (Post-Corner, Dig, Go, Slant) with D&D filters.

REST: `POST /api/v1/film/auto-tag`.

---

### 4.23 Autonomous scheme-fit scouting agent

**Status:** Client engine + seed alerts  
**Types:** `SchemeFitScoutAlert`  
**Files:** [`AutonomousScoutingAgent.tsx`](../src/components/AutonomousScoutingAgent.tsx), [`src/lib/autonomousScoutingEngine.ts`](../src/lib/autonomousScoutingEngine.ts)

**How to use:** Gateway Center → **Auto Scouting**. Agent scores TrueSpeed MPH + Cognition + laser shuttle against playbooks. `calculateSchemeConfidence` is deterministic (capped 0–100). Alerts (`SchemeFitScoutAlert`) are triage — they do **not** auto-offer or auto-pay.

Tests: `npm run test:scouting`.

---

### 4.24 Verified combine laser ingestion

**Status:** Hybrid — UI seed + webhook validation engine  
**Type:** `VerifiedLaserCombineEntry`  
**Files:** [`CombineLaserApiModule.tsx`](../src/components/CombineLaserApiModule.tsx), [`src/lib/combineLaserEngine.ts`](../src/lib/combineLaserEngine.ts)

**How to use (UI):** Gateway Center → **Laser Combine**. Refresh to show laser 40 / shuttle / 3-cone / vertical / broad with **Laser Verified** badges (`verifiedBy` hardware string).

**How to use (hardware):**

```http
POST /api/v1/combines/webhooks/laser
Header: x-laser-secret: <LASER_WEBHOOK_SECRET>
```

`validateAndIngestLaserPacket` rejects incomplete IDs and out-of-range times. List: `GET /api/v1/combines/laser-entries`.

Tests: `npm run test:laser`.

---

### 4.25 AI gameplan / opponent call sheet

**Status:** Client demo  
**Types:** `OpponentScoutingDossier`, `OpponentTendency`, `PlaycallWristbandCard`  
**File:** [`AiGameplanGeneratorModule.tsx`](../src/components/AiGameplanGeneratorModule.tsx)

**How to use:** Gateway Center → **Gameplan AI**. Pick an opponent (e.g. Georgia). Review base front, blitz %, down-and-distance tendencies, vulnerable routes. Export wristband cards (`PlaycallWristbandCard`). Film-session counts are seed metrics until wired to tagged film.

---

### 4.26 Schools CSV importer

**Status:** Server-authoritative in-memory directory (until Supabase upsert)  
**File:** [`SchoolsCsvImporter.tsx`](../src/components/SchoolsCsvImporter.tsx), [`src/schoolsCsvImport.ts`](../src/schoolsCsvImport.ts)

**How to use:** Gateway Center → **CSV Import**. Upload a verified JUCO/Prep CSV (template under `data/ingestion/templates/`). POST `/api/v1/admin/import-schools-csv`. Missing emails stay null. CLI equivalent: `npm run ingest:juco-csv`.

---

### 4.27 RoundBlock exploding trade escrow (Web3)

**Status:** UI demo + Anchor program  
**Types:** `ExplodingTradeEscrow`, `TokenizedAssetAssetPointer`, `TradeEscrowStatus`  
**Files:** [`RoundBlockTradeEscrowModule.tsx`](../src/components/RoundBlockTradeEscrowModule.tsx), [`programs/roundblock/src/lib.rs`](../programs/roundblock/src/lib.rs), IDL [`src/idl/roundblock.json`](../src/idl/roundblock.json)

**What it is:** Dynasty-league exploding offers: player-card NFTs + future picks, optional USDC collateral in a PDA vault, expiry, accept / reclaim.

**How to use (UI):** Gateway Center → **RoundBlock Trade**. Inspect mock proposals (`PENDING` / `ACCEPTED` / `EXPIRED` / `RECLAIMED`), collateral cents, expiry countdown.

**On-chain:** `propose_trade`, accept-before-expiry, reclaim-after-expiry. Amounts use checked integer math; signer + PDA `has_one` constraints are mandatory. This is **not** NCAA NIL escrow (that is RallySafe/Stripe).

---

### 4.28 GCS signed media URLs (COPPA gate)

**Status:** Server helper + Terraform  
**Types:** `GcsSignedUrlRequest`, `GcsSignedUrlResponse`  
**Files:** [`src/services/gcsSignedUrlService.ts`](../src/services/gcsSignedUrlService.ts), [`terraform/gcs_media_storage.tf`](../terraform/gcs_media_storage.tf)

Minors without parental consent receive `MINOR_CONSENT_REQUIRED_FAIL_CLOSED`. Tests: `npm run test:gcs-signed-url`.

---

### 4.29 Tech docs, brand, NIL legal guide

**File:** [`TechDocsView.tsx`](../src/components/TechDocsView.tsx)

**How to use:** Navbar → **Tech Docs**.

- **Logo & Brand** — `LogoBrandShowcase` / `GridironLogo`
- **NIL Guide (Aug 2026)** — House settlement, CSC NIL Go, inducement / HS-state matrix (not legal advice)
- **System Architecture** — schema and API notes

---

### 4.30 Source control command panel

**File:** [`SourceControlPanel.tsx`](../src/components/SourceControlPanel.tsx)

**How to use:** Navbar → **Source Control**. Operator UI for conventional commits, pre-commit gates, and compliance footnotes. Actual git remains CLI (`npm run test:pre-commit`).

---

### 4.31 Auth session manager

**File:** [`AuthManager.tsx`](../src/components/AuthManager.tsx)  
**Client:** [`src/lib/supabaseClient.ts`](../src/lib/supabaseClient.ts)

**How to use:** Pipeline tab. If `VITE_SUPABASE_*` missing → misconfigured state (no silent mock auth). Sign in persists JWT (`persistSession`, `autoRefreshToken`). Anon/publishable key only in the browser — **never** `SUPABASE_SERVICE_ROLE_KEY` in the Vite bundle.

---

### 4.32 Error boundary & layout safety

[`ErrorBoundary.tsx`](../src/components/ErrorBoundary.tsx) wraps the tree in [`main.tsx`](../src/main.tsx). Wallet/MetaMask rejection noise is swallowed so browser extensions cannot white-screen the SPA. Async grids reserve height (CLS < 0.1).

---

## 5. Codebase architecture

### 5.1 Runtime topology

```text
Browser (Vite React 19 SPA)
  ├─ src/lib/supabaseClient.ts  ──anon JWT──► Supabase Postgres + RLS
  ├─ src/services/*             ──PostgREST──► public.* tables
  └─ fetch / WebSocket          ────────────► Express server.ts
                                                ├─ REST FinTech / compliance / ingest
                                                ├─ WS BioScan
                                                └─ Vite middleware (dev) or dist/ (prod)

Supabase Edge Functions (Deno)
  ├─ gemini-assistant
  ├─ csc-nil-go-sync          (HMAC, service_role server-side)
  └─ cfbd-schools-seeder

Anchor
  └─ programs/roundblock
```

### 5.2 Repository map

```text
Gridiron-Gateway/
├── src/
│   ├── main.tsx / App.tsx / index.css
│   ├── types.ts                         # All domain contracts
│   ├── complianceEngine.ts              # Calendar + inducement + consent gate
│   ├── serverSecurity.ts                # Bearer auth, HMAC, rate limits
│   ├── stripe-webhook-verification.ts
│   ├── cfbdIngestionPipeline.ts
│   ├── sidearmDirectoryScraper.ts
│   ├── schoolsCsvImport.ts
│   ├── ingestionUtils.ts
│   ├── *TestSuite.ts                    # Statutory / math gates
│   ├── data/                            # Seed / migration-debt datasets
│   ├── services/                        # Typed Supabase + Gemini clients
│   ├── lib/                             # Pure engines (cap, NIL, pose, laser, scouting)
│   ├── components/                      # SPA modules (see §4)
│   ├── components/ui/slider.tsx         # shadcn primitive
│   ├── utils/supabase/                  # SSR-shaped helpers (not App Router)
│   └── idl/roundblock.json
├── server.ts                            # Express + WS + Vite
├── schema.sql                           # MVP auth/compliance + directory (evolving)
├── schema.production.sql                # CFBD schools / coaches / lean athletes
├── supabase/migrations/                 # Incremental fail-closed DDL
├── supabase/functions/
├── scripts/ingestion/                   # CFBD, Sidearm, JUCO CSV, monthly
├── programs/roundblock/                 # Anchor exploding escrow
├── terraform/gcs_media_storage.tf
├── docs/
│   ├── dashboard-spec.md
│   └── GRIDIRON_GATEWAY_OVERVIEW.md     # this file
├── AGENTS.md / README.md / ANTIGRAVITY_BLUEPRINT.md
└── .github/workflows/ci.yml
```

### 5.3 Frontend module groups

| Group | Components |
|---|---|
| Shell | `App`, `Navbar`, `GridironGatewayDashboard`, `ErrorBoundary`, `GridironLogo` |
| Recruit surfaces | `AthleteProfileCard`, `OnboardingWizard`, `AthleteDossier`, `AthleteProfileModal` |
| Directories | `LeaderboardTop250`, `SchoolsDirectory`, `CoachesDirectory`, `CampSearchEngine` |
| Coach ops | `CoachWorkspace`, `RecruitingPipeline`, `CoachPipelineBoard`, `CoachMessagingFeed`, `AuthManager` |
| Front office | `CapGMRosterSimulator`, `NILCalculator`, `RallySafeEscrowModule`, `TransferPortalModule` |
| Verified athletic | `TrueSpeedModule`, `BioScanTelemetryModule`, `CombineLaserApiModule`, `CognitiveSchemeMatcher` |
| Film / AI | `AIFilmStudio`, `AiFilmTaggingStudio`, `AutonomousScoutingAgent`, `AiGameplanGeneratorModule`, `AIRecruitingAssistant` |
| Legal | `ParentConsentPortal`, `ComplianceDashboard`, `NcaaEligibilityTracker` |
| Adjacent | `RoundBlockTradeEscrowModule`, `SchoolsCsvImporter`, `SourceControlPanel`, `TechDocsView` |

### 5.4 `src/lib` engines (pure logic)

| File | Responsibility |
|---|---|
| `capGmMath.ts` | Integer-cents cap, EPA/retention helpers |
| `nilValuation.ts` | Estimator BPS/cents (no ledger writes) |
| `rallySafeReleaseGate.ts` | Fail-closed payout predicate |
| `parentalConsentBind.ts` | JWT athlete_id bind |
| `complianceAuditPersist.ts` | Audit log writer |
| `autonomousScoutingEngine.ts` | Scheme confidence |
| `combineLaserEngine.ts` | Laser packet validation |
| `trueSpeedPoseEngine.ts` / `trueSpeedKinematics.ts` | Pose → MPH/40 |
| `filmSeek.ts` | Video timestamp seek |
| `geminiSchoolGeneratorEngine.ts` | School card validation |
| `supabaseClient.ts` | Anon client singleton |

### 5.5 `src/services` (network)

| File | Exports |
|---|---|
| `schoolsApi.ts` | `fetchSchools`, `fetchAthleteProfiles`, `fetchLeaderboardRecruits`, `getAthleteProfileFull`, `getPipelineOffers`, `updatePipelineOfferStage` |
| `transferPortalApi.ts` | `getTransferPortalAthletes` |
| `nilTransactionsApi.ts` | `fetchNilTransactionsForAthlete`, `releaseNilEscrowPayout` |
| `parentalConsentApi.ts` | `submitParentalConsent`, `isParentalConsentPayloadValid` |
| `complianceGateApi.ts` | `dispatchComplianceGate` |
| `geminiAssistantApi.ts` | `generateRecruitingOutreachDraft`, `generateSchoolWithGemini` |
| `gcsSignedUrlService.ts` | `generateGcsV4SignedUrl` |

### 5.6 Data seeds (migration debt)

[`src/data/mockData.ts`](../src/data/mockData.ts), [`schoolsData.ts`](../src/data/schoolsData.ts), [`collegeProgramsData.ts`](../src/data/collegeProgramsData.ts) exist for UI placeholders. **New product features must fetch live data.** Never LLM-fill coach emails into these files.

### 5.7 Duplicate / transitional paths

The repo still contains **two school identity models**: UUID MVP `schools` in parts of `schema.sql` vs production `school_id VARCHAR` in `schema.production.sql`. Client mappers exist in both `src/lib/supabaseClient.ts` and `src/types.ts` (`DatabaseSchool`). Prefer production ingest ids (`cfbd-{id}`).

`utils/supabase/*` and `src/utils/supabase/*` are SSR-shaped helpers; the running app is the Vite SPA.

---

## 6. Data models (`src/types.ts`)

Do not invent properties. If a field is missing, add the interface first.

| Cluster | Key types |
|---|---|
| Identity | `UserRole`, `Position`, `GradYear`, `CollegeDivision`, `DivisionTier` / `DivisionTierEnum` |
| Recruit dossier | `AthleteProfile`, `CollegeOffer`, `AthleteFullProfile`, `DatabaseAthleteProfile` |
| Rankings | `TopRecruit`, `WeeklyHighlight`, `CoachEndorsement`, `SocialPost` |
| Programs / staff | `SchoolEntry`, `CollegeProgram`, `CanonicalProgramRecord`, `DatabaseSchool`, `DatabaseCoach`, `CanonicalCoachStaffRecord` |
| Portal / pipeline | `TransferPortalAthlete`, `PipelineOffer`, `RecruitingPipelineStage`, `CoachPipelineProspect` |
| CapGM | `CapGmPlayer`, `CapGmState`, `CapGMRosterModel`, `RosterPlayerCapItem` |
| Cognition / speed | `CognitiveProfile`, `TrueSpeedTelemetry`, `BioScanTelemetry` |
| NIL | `NilTransaction`, `NilEscrowCampaign`, `ClearinghouseStatus`, `NilValuationCents` |
| Film | `FilmTag`, `FilmAnalysisSession`, `FilmTagItem` |
| RBAC | `MultiTenantUser`, `RolePermissionConfig` |
| Phase 4 | `SchemeFitScoutAlert`, `VerifiedLaserCombineEntry`, `ParentConsentRecord` |
| Compliance | `ComplianceEvaluation`, `ComplianceAuditLog`, `NcaaClearanceRequest`, `ClearanceStatus` |
| Gameplan | `OpponentScoutingDossier`, `PlaycallWristbandCard` |
| RoundBlock | `ExplodingTradeEscrow`, `TokenizedAssetAssetPointer` |
| GCS | `GcsSignedUrlRequest` / `GcsSignedUrlResponse` |

Helpers in the same file: `toDatabaseCoach`, `toDatabaseSchool`, `classificationToDivisionTier`, `mapFbsConferenceToTier`.

---

## 7. Database & RLS

### Production directory (`schema.production.sql`)

- `schools` — CFBD/CSV institutions (`division_tier_enum`)
- `college_coaches` — nullable `email` / `office_phone`
- `athlete_profiles` — lean scouting facts (`true_speed_mph`, `cognition_score`)

### MVP / compliance (`schema.sql`)

- `users` ↔ `auth.users`, `guardian_id` self-FK
- `athlete_profiles`, `athlete_media`, `scholarship_offers`
- `messages`, `communication_audit_logs` (client INSERT/UPDATE/DELETE **denied**)
- `compliance_rules`
- `program_directory` / `coaching_staff` (ingest targets)

RLS enabled on core tables. Typical policies: authenticated read of directories; athletes update own profile/media; compliance officers manage rules and read audit logs; messages visible to sender, receiver, or compliance.

### Incremental migrations (`supabase/migrations/`)

| Migration | Purpose |
|---|---|
| `20260814120000_nil_transactions.sql` | Integer-cents ledger, `enforce_cleared_payout`, RLS |
| `20260814130000_nil_transactions_failclosed.sql` | Hardening |
| `20260816120000_parental_consents.sql` | COPPA lock, `contact_authorized` |
| `20260816140000_transfer_portal_entries.sql` | Portal ticker |
| `20260817090000_parental_consents_bind_session.sql` | Session bind |
| `20260817120000_compliance_audit_logs.sql` | Statutory audit |
| `20260817140000_csc_nil_go_clearinghouse_lock.sql` | SPA cannot flip CSC status |

`school_staff_roles (user_id, school_id, role_tier)` is the multi-tenant join for pipeline RLS.

---

## 8. APIs, webhooks & edge functions

Protected Express routes require `Authorization: Bearer <API_ACCESS_TOKEN>` when configured (**required in production**). Webhooks use shared secrets, not the Bearer token.

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/health` | GET | open | Health + timestamp |
| `/api/compliance/status` | GET | Bearer | Pre-compose gate |
| `/api/compliance/audit-logs` | GET | Bearer | Audit ledger |
| `/api/compliance/recruiting-periods` | GET | Bearer | Calendar rows |
| `/api/compliance/run-tests` | POST | Bearer + rate | Suite runner |
| `/api/messages/send` | POST | Bearer + rate | Fail-closed send |
| `/api/v1/compliance/messaging-clearance` | POST | Bearer | Clearance dispatch |
| `/api/v1/compliance/parent-consent` | POST/GET | Bearer | Consent record |
| `/api/v1/bioscan/webhooks/catapult` | POST | `x-bioscan-secret` | GPS ingress |
| `/api/v1/bioscan/telemetry/:athleteId` | GET | Bearer | Last packet |
| `/api/v1/bioscan/stream/:athleteId` | WS | optional `?token=` | Live egress |
| `/api/v1/rallysafe/campaigns` | POST/GET | Bearer | Escrow campaigns |
| `/api/v1/rallysafe/campaigns/:id/release` | POST | Bearer | Gated release |
| `/api/v1/rallysafe/webhooks/stripe` | POST | Stripe HMAC | Connect events |
| `/api/v1/rallysafe/escrow/audit-log` | GET | Bearer | Escrow audit |
| `/api/v1/film/auto-tag` | POST | Bearer | Film tags |
| `/api/v1/auth/permissions/:role` | GET | Bearer | RBAC flags |
| `/api/v1/combines/webhooks/laser` | POST | `x-laser-secret` | Laser ingest |
| `/api/v1/combines/laser-entries` | GET | Bearer | Laser list |
| `/api/ai/draft-email` | POST | Bearer + AI rate | Gemini letter |
| `/api/ai/scout-evaluation` | POST | Bearer + AI rate | Scout writeup |
| `/api/v1/admin/sync-cfbd` | POST | Bearer + admin rate | CFBD teams |
| `/api/v1/admin/scrape-sidearm` | POST | Bearer + admin rate | Staff HTML |
| `/api/v1/admin/import-schools-csv` | POST | Bearer + admin rate | CSV upsert |
| `/api/v1/admin/directory-snapshot` | GET | Bearer | In-memory snapshot |

**Edge Functions**

| Function | Invoke | Notes |
|---|---|---|
| `gemini-assistant` | `POST /functions/v1/gemini-assistant` | Tones allowlist; clamps text |
| `csc-nil-go-sync` | `POST /functions/v1/csc-nil-go-sync` | `x-csc-signature`; `verify_jwt = false`; replay window 5 min |
| `cfbd-schools-seeder` | scheduled/manual | Directory seed |

Rate limiters: mutate, AI, admin (`createRateLimiter` in `serverSecurity.ts`). Stripe verification is timing-safe HMAC on the **raw body**.

---

## 9. Security, compliance & money math

| Rule | Enforcement |
|---|---|
| Zero-trust frontend | RLS + JWT; UI filters are not the lock |
| No service role in SPA | Anon key only (`supabaseClient.ts`) |
| Fail-closed NCAA messaging | Calendar + COPPA + inducement keywords |
| Fail-closed NIL | CHECK + trigger + `canReleaseNilEscrow` |
| Integer cents | CapGM, RallySafe, NIL estimator |
| Coach contacts | CFBD + Sidearm + verified CSV only |
| XSS | React text nodes; no untrusted `dangerouslySetInnerHTML` |
| Webhooks | HMAC + shared secrets; Stripe raw buffer |
| Production API | `API_ACCESS_TOKEN` or 503 |
| Minors | `contact_authorized` default false; GCS deny without consent |

Compliance periods: Dead, Quiet, Contact, Evaluation (`NcaaRecruitingPeriod`). Inducement scanner flags signing-bonus / pay-to-commit language.

---

## 10. Ingestion pipeline

College football has 900+ programs and extreme staff turnover. **Never generate coach emails.**

| Step | Command | Source | Output |
|---|---|---|---|
| 1 | `npm run ingest:cfbd` | CFBD `GET /teams` (`COLLEGE_FOOTBALL_API_KEY`) | Programs |
| 2 | `npm run ingest:sidearm` | Rate-limited staff HTML (`mailto`/`tel` only) | Coaches (email may be null) |
| 3 | `npm run ingest:juco-csv` | Verified CSV template | JUCO/Prep |
| 4 | `npm run ingest:monthly` | 1→3; `SKIP_SIDEARM_SCRAPE=1` skips HTML | Orchestrated |

Artifacts: `data/ingestion/output/` (gitignored). Seeds: `data/ingestion/seeds/`. Delay: `SIDEARM_SCRAPE_DELAY_MS` (default 2500).

---

## 11. Tests, CI & local setup

### Scripts (`package.json`)

| Script | What |
|---|---|
| `npm run dev` | `tsx server.ts` |
| `npm run build` | Vite + esbuild `server.ts` → `dist/server.cjs` |
| `npm run lint` | `tsc --noEmit` |
| `npm run test:pre-commit` | Full statutory gate (`scripts/runAllPreCommitChecks.ts`) |
| `test:compliance` / `test:rallysafe` / `test:capgm` / `test:parental-consent` / `test:scouting` / `test:laser` / `test:gemini-school` / `test:gcs-signed-url` | Individual suites |

CI (`.github/workflows/ci.yml`) runs the same gates plus `npm run build` on `main` and `cursor/**`.

### Environment (`.env.example`)

`GEMINI_API_KEY`, `APP_URL`, `API_ACCESS_TOKEN`, `BIOSCAN_WEBHOOK_SECRET`, `LASER_WEBHOOK_SECRET`, `STRIPE_WEBHOOK_SECRET`, `COLLEGE_FOOTBALL_API_KEY`, `PORT`.  
SPA also needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. CSC function secret: `CSC_WEBHOOK_SECRET`.

### Stack versions

Node 18+ (CI uses 20). React 19, Vite 6, Tailwind 4, Express 4, `ws` 8, `@supabase/supabase-js` 2, MediaPipe Tasks Vision, Recharts, Motion, Lucide.

---

## 12. Implementation status matrix

| Feature | UI | Authoritative data |
|---|---|---|
| Profile / onboarding | Yes | Client state |
| Top 250 + athlete modal | Yes | Supabase |
| Schools directory (nav) | Yes | Static + Gemini validate |
| Schools fetch API | Yes | Supabase `schools` |
| Coaches directory | Yes | Mock (ingest → `college_coaches`) |
| Camps | Yes | Mock |
| NCAA eligibility | Yes | Client calculator |
| AI recruiting letters | Yes | Gemini / Edge |
| Messaging + compliance | Yes | Engine + Express + optional Postgres |
| Parent consent | Yes | Supabase + JWT bind |
| Transfer portal | Yes | Supabase |
| Recruiting pipeline Kanban | Yes | Supabase RLS |
| Coach workspace | Yes | Mock |
| CapGM | Yes | Client cents engine |
| NIL estimator | Yes | Client cents (no ledger) |
| RallySafe | Yes | Supabase + Express + CSC HMAC |
| BioScan | Yes | Express WS + webhook |
| TrueSpeed | Yes | On-device CV |
| Cognition | Yes | Mock / column on profiles |
| Film studio | Yes | Client + `/film/auto-tag` |
| Autonomous scout | Yes | Deterministic engine |
| Combine laser | Yes | Webhook engine + seed UI |
| Gameplan AI | Yes | Mock dossiers |
| CSV import | Yes | Express memory |
| RoundBlock | Yes | Mock UI + Anchor source |
| GCS COPPA URLs | Helper | Terraform + tests |
| Auth | Yes | Supabase Auth |

---

## Quick start for each persona

**Recruit:** Profile builder → Dossier → Top 250 (see market) → Schools (targets/offers) → Camps → NCAA tracker → AI letter (review before send) → Parent Portal if under 18.

**Position coach:** Sign in → Pipeline Kanban → Coach Workspace → Film tagging → Auto Scouting alerts → Laser / TrueSpeed / Cognition on Tech Hub. Do not open CapGM (hidden without GM persona).

**Head Coach / GM:** Same as position coach plus CapGM allocation and RallySafe review. Never treat NIL estimator output as a cleared deal.

**Compliance:** Compliance dashboard + recruiting period. Confirm parent consent before contact. Confirm CSC `CLEARED` before any RallySafe release. Portal-flagged athletes cannot be paid.

**Engineer:** Read this doc + `docs/dashboard-spec.md`. Types in `src/types.ts`. Live reads in `src/services/`. Money in `src/lib/capGmMath.ts` and `rallySafeReleaseGate.ts`. Run `npm run test:pre-commit` before push.

---

*Gridiron Gateway — verified scouting, fail-closed compliance, integer-cents FinTech. AI verifies; humans and Postgres authorize.*
