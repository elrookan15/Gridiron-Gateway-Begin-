# 🏈 Gridiron Gateway — Next-Gen Collegiate Football Recruiting, Team Operations & NCAA Compliance Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Stripe Connect](https://img.shields.io/badge/Stripe_Connect-6772E5?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)

Gridiron Gateway is an enterprise-grade college football recruiting, sports analytics, team collaboration, and NCAA compliance platform built for the **2026 collegiate landscape** ($20.5M revenue-sharing hard salary cap, 105-man roster limits, NIL collectives, and transfer portal volatility).

Synthesizing verified game film, composite prospect intelligence, sports IQ diagnostics, GPS wearable telemetry, automated NCAA compliance gating, and Stripe Connect NIL escrow, Gridiron Gateway provides a unified ecosystem for **High School & JUCO Recruits**, **Coaching Staffs across all collegiate divisions (FBS P4/G5, FCS, DII, DIII, NAIA, JUCO, Prep)**, and **NCAA Compliance Officers**.

---

## 📋 Table of Contents

1. [Executive Summary & Core Identity](#-executive-summary--core-identity)
2. [Comprehensive Feature Breakdown](#-comprehensive-feature-breakdown)
   - [CapGM $20.5M Roster Salary Cap Simulator](#1-gateway-capgm-205m-roster-salary-cap-simulator)
   - [AI HUDL Play-by-Play Film Tagging Studio](#2-ai-hudl-play-by-play-automated-film-tagging-studio)
   - [Autonomous Scheme-Fit Scouting Agent](#3-autonomous-scheme-fit-scouting-agent)
   - [Verified Combine Laser API Ingestion Hub](#4-verified-combine-laser-api-ingestion-hub)
   - [Parent & Guardian COPPA/FERPA Consent Portal](#5-parent--guardian-coppaferpa-compliance-consent-portal)
   - [Multi-Tenant RBAC Workspace Switcher](#6-multi-tenant-rbac-coaching-staff--recruit-workspace)
   - [RallySafe NIL Escrow & Stripe Webhook Engine](#7-rallysafe-nil-escrow--stripe-connect-webhook-engine)
   - [BioScan GPS Wearable Telemetry Hub](#8-bioscan-gps-wearable-telemetry-hub)
   - [TrueSpeed Max MPH Authenticator](#9-truespeed-max-mph--video-authenticator)
   - [Cognitive Scheme Matcher & S2 Sports IQ](#10-cognitive-scheme-matcher--s2-style-sports-iq-diagnostics)
   - [Real-Time NCAA Compliance Engine](#11-real-time-ncaa-compliance-engine--audit-dashboard)
   - [NCAA Academic Eligibility Tracker](#12-ncaa-academic-eligibility-tracker--qualifier-calculator)
   - [Top 250 Leaderboard & Scouting Intelligence](#13-top-250-prospect-leaderboard--scouting-intelligence)
   - [Transfer Portal Real-Time Tracker](#14-transfer-portal-real-time-scouting-module)
   - [College Coach CRM Pipeline Kanban Board](#15-college-coach-crm-kanban-pipeline-board)
   - [Multi-Division Directory & Offer Claiming](#16-multi-division-college--prep-school-directory)
   - [Showcase & Combine Search Engine](#17-regional-showcase--combine-search-engine)
   - [Gemini AI Recruiting Letter Generator](#18-gemini-ai-recruiting-assistant)
3. [Codebase Architecture & Directory Structure](#-codebase-architecture--directory-structure)
4. [API Architecture & Endpoints](#-api-architecture--endpoints)
5. [Design System & Aesthetics](#-design-system--aesthetics)
6. [Getting Started & Local Setup](#-getting-started--local-setup)

---

## 🏛️ Executive Summary & Core Identity

Collegiate football recruitment has shifted into a data-driven enterprise. Gridiron Gateway replaces disconnected spreadsheets, unverified Hudl links, and manual recruiting logs with an instrumented platform:

* **Verified Film & Breakdown:** Computer-vision coverage shell classification (*Cover 1*, *Cover 2 Man*, *Cover 3 Match*, *Cover 4 Quarters*) and receiver route tree indexing.
* **Financial Transparency & CapGM:** Real-time $20.5M revenue-share salary cap manager calculating SP+/EPA win-added impact and roster retention risk under the 105-man roster cap.
* **Fail-Closed NCAA Compliance:** Real-time recruiting calendar gating (Dead, Quiet, Contact, Evaluation windows), COPPA minor protection rules, and automated transfer portal escrow locks.
* **FinTech Escrow Infrastructure:** Stripe Connect integration with raw buffer HMAC SHA-256 webhook signature verification and integer math (cents).

---

## 🌟 Comprehensive Feature Breakdown

### 💼 1. Gateway CapGM $20.5M Roster Salary Cap Simulator

* **Filename:** [`src/components/CapGMRosterSimulator.tsx`](src/components/CapGMRosterSimulator.tsx)
* **Description:** Front-office general manager command center for managing the 2026 $20.5M revenue-sharing cap across 105 roster spots.
* **Key Features:**
  * **Integer-Cents Financial Math:** Eliminates floating-point drift across millions in roster payroll.
  * **SP+ / EPA Win-Impact Engine:** Calculates expected win additions per position allocation.
  * **Transfer Portal Retention Risk:** Highlights players at high risk of entering the portal based on market valuation gaps.
  * **105-Player Roster Stress Test Toggle:** Instant virtualized rendering of full 105-man roster datasets.

### 🎥 2. AI HUDL Play-by-Play Automated Film Tagging Studio

* **Filename:** [`src/components/AiFilmTaggingStudio.tsx`](src/components/AiFilmTaggingStudio.tsx)
* **Description:** Computer-vision film breakdown studio that auto-tags raw game tape.
* **Key Features:**
  * **Coverage Shell Detection:** Auto-classifies defensive coverages (*Cover 1*, *Cover 2*, *Cover 3 Match*, *Cover 4 Quarters*).
  * **Route Stem Indexing:** Automatically tags receiver routes (*Post-Corner*, *Dig/In*, *Go/Fly*, *Slant*).
  * **Down & Distance Filter:** Instantly filters plays by Situation (*3rd & 8 Red Zone*, *1st & 10*).
  * **60-Second Highlight Exporter:** Auto-compiles shareable prospect packages.

### 🤖 3. Autonomous Scheme-Fit Scouting Agent

* **Filename:** [`src/components/AutonomousScoutingAgent.tsx`](src/components/AutonomousScoutingAgent.tsx)
* **Description:** Background worker scanning prospects to match athletic biometrics, TrueSpeed velocity, and S2 Cognition scores against coaching playbooks.
* **Key Features:**
  * **Playbook Alignment:** Matches prospects with playbooks (*Air Raid Pass*, *West Coast*, *3-4 Blitz*, *Cover 3 Match*).
  * **Automated Alert Dossiers:** Proactively delivers match alerts directly into the Position Coach workspace.

### ⏱️ 4. Verified Combine Laser API Ingestion Hub

* **Filename:** [`src/components/CombineLaserApiModule.tsx`](src/components/CombineLaserApiModule.tsx)
* **Description:** Regional combine and showcase hardware timing ingestion hub.
* **Key Features:**
  * **Laser Hardware Telemetry:** Ingests laser 40-yard dash, 20-yard shuttle, 3-cone drill, vertical jump, and broad jump.
  * **⚡ Laser Verified Badges:** Replaces self-reported numbers with hardware-verified credentials.

### 🛡️ 5. Parent & Guardian COPPA/FERPA Compliance Consent Portal

* **Filename:** [`src/components/ParentConsentPortal.tsx`](src/components/ParentConsentPortal.tsx)
* **Description:** External legal consent workflow for parents of high school recruits under 18.
* **Key Features:**
  * **COPPA / FERPA E-Signatures:** Allows parents to e-sign digital consent waivers for direct coach messaging.
  * **NIL Milestone Disclosures:** Isolated disclosure hub for RallySafe escrow release approvals.

### 👥 6. Multi-Tenant RBAC Coaching Staff & Recruit Workspace

* **Filename:** [`src/components/MultiTenantRoleSelector.tsx`](src/components/MultiTenantRoleSelector.tsx)
* **Description:** Top-bar persona switcher isolating UI views and permissions across roles:
  1. 👔 **Head Coach / Roster GM:** Full access to CapGM, SP+ win impact, and RallySafe escrow.
  2. 🏈 **Position Coach:** Filtered position group workspace, film tagging, and targeted messaging.
  3. 🛡️ **Compliance Officer:** Audit log viewer, recruiting calendar controls, and portal gatekeeper.
  4. 🎓 **Athlete Recruit:** Verified dossier, milestone tracker, and offer claim log.

### 💳 7. RallySafe NIL Escrow & Stripe Connect Webhook Engine

* **Filenames:** [`src/components/RallySafeEscrowModule.tsx`](src/components/RallySafeEscrowModule.tsx), [`src/stripe-webhook-verification.ts`](src/stripe-webhook-verification.ts)
* **Description:** FinTech NIL campaign manager backed by custom Stripe Connect webhooks.
* **Key Features:**
  * **NCAA Transfer Portal Gatekeeper:** Returns **HTTP 403 Forbidden** on `transfer.created` events if an athlete is active in the transfer portal, blocking payouts.
  * **Raw Buffer HMAC SHA-256 Signatures:** Verifies Stripe headers securely without JSON payload corruption.

### 📡 8. BioScan GPS Wearable Telemetry Hub

* **Filename:** [`src/components/BioScanTelemetryModule.tsx`](src/components/BioScanTelemetryModule.tsx)
* **Description:** Ingests live player load, acceleration, and top speed telemetry via WebSockets (`WS /api/v1/bioscan/stream/:athleteId`).

### ⚡ 9. TrueSpeed Max MPH & Video Authenticator

* **Filename:** [`src/components/TrueSpeedModule.tsx`](src/components/TrueSpeedModule.tsx)
* **Description:** Computer-vision framerate analyzer verifying on-field game speed (e.g. 22.4 MPH) to detect altered video clips.

### 🧠 10. Cognitive Scheme Matcher & S2-Style Sports IQ Diagnostics

* **Filename:** [`src/components/CognitiveSchemeMatcher.tsx`](src/components/CognitiveSchemeMatcher.tsx)
* **Description:** Millisecond decision diagnostic scoring tactical processing speeds against complex offensive/defensive schemes.

### 🛡️ 11. Real-Time NCAA Compliance Engine & Audit Dashboard

* **Filenames:** [`src/complianceEngine.ts`](src/complianceEngine.ts), [`src/components/ComplianceDashboard.tsx`](src/components/ComplianceDashboard.tsx)
* **Description:** Fail-closed gatekeeper enforcing NCAA recruiting calendar periods (*Dead*, *Quiet*, *Evaluation*, *Contact*), age consent rules, and prohibited inducement scanning.

### 🎓 12. NCAA Academic Eligibility Tracker & Qualifier Calculator

* **Filename:** [`src/components/NcaaEligibilityTracker.tsx`](src/components/NcaaEligibilityTracker.tsx)
* **Description:** 16 core-course tracker and sliding scale GPA calculator determining Division I and Division II qualifier status.

### 🏆 13. Top 250 Prospect Leaderboard & Scouting Intelligence

* **Filename:** [`src/components/LeaderboardTop250.tsx`](src/components/LeaderboardTop250.tsx)
* **Description:** National composite ranking engine providing position, state, and star-tier prospect breakdowns.

### 🔄 14. Transfer Portal Real-Time Scouting Module

* **Filename:** [`src/components/TransferPortalModule.tsx`](src/components/TransferPortalModule.tsx)
* **Description:** Real-time transfer portal tracker cross-referencing remaining eligibility years, origin school, and CapGM win impact.

### 📋 15. College Coach CRM Kanban Pipeline Board

* **Filename:** [`src/components/CoachPipelineBoard.tsx`](src/components/CoachPipelineBoard.tsx)
* **Description:** Drag-and-drop scouting Kanban pipeline (*Discovered* → *Film Evaluated* → *Offered* → *Official Visit* → *Committed*).

### 🏫 16. Multi-Division College & Prep School Directory

* **Filename:** [`src/components/SchoolsDirectory.tsx`](src/components/SchoolsDirectory.tsx)
* **Description:** Searchable database spanning 6 collegiate levels: FBS (P4/G5), FCS, DII, DIII, NAIA, and JUCO/Prep.

### 🎪 17. Regional Showcase & Combine Search Engine

* **Filename:** [`src/components/CampSearchEngine.tsx`](src/components/CampSearchEngine.tsx)
* **Description:** Directory for locating verified regional showcases, combines, and college prospect camps.

### 🤖 18. Gemini AI Recruiting Assistant

* **Filename:** [`src/components/AIRecruitingAssistant.tsx`](src/components/AIRecruitingAssistant.tsx)
* **Description:** AI assistant drafting personalized coach introduction letters and answering NCAA visit rules.

---

## 🏗️ Codebase Architecture & Directory Structure

```text
Gridiron-Gateway/
├── src/
│   ├── App.tsx                         # SPA Routing & State Shell
│   ├── main.tsx                        # Vite Entry Point
│   ├── index.css                       # Tailwind Styling & Color Tokens
│   ├── types.ts                        # Master TypeScript Data Interfaces
│   ├── complianceEngine.ts             # NCAA Calendar Gating & Compliance Business Logic
│   ├── complianceTestSuite.ts          # Automated Compliance Test Suite
│   ├── capGmTestSuite.ts               # CapGM Salary Cap Unit Test Suite
│   ├── stripe-webhook-verification.ts  # Stripe Connect Webhook & Portal Gatekeeper
│   ├── runStripeTest.ts                # Stripe Webhook Test Runner Script
│   ├── serverSecurity.ts               # API auth, webhook secrets, rate limits
│   ├── data/
│   │   ├── schoolsData.ts              # Multi-Division College Directory Database
│   │   ├── collegeProgramsData.ts      # FBS/FCS Program Roster Metrics
│   │   └── mockData.ts                 # 105-Player Rosters, Top 250 & Audit Logs
│   └── components/
│       ├── GridironGatewayDashboard.tsx# Core Multi-Tab Application Shell
│       ├── CapGMRosterSimulator.tsx    # $20.5M Revenue Share CapGM Simulator
│       ├── AiFilmTaggingStudio.tsx     # Computer-Vision Play-by-Play Tagging Studio
│       ├── AutonomousScoutingAgent.tsx # Background Scheme-Fit Scouting Worker
│       ├── CombineLaserApiModule.tsx   # Verified Laser Timing Ingestion Hub
│       ├── ParentConsentPortal.tsx     # COPPA/FERPA Parent Legal Consent Hub
│       ├── MultiTenantRoleSelector.tsx # Workspace Role & Permission Switcher
│       ├── RallySafeEscrowModule.tsx   # Stripe Connect NIL Micro-Campaign Manager
│       ├── BioScanTelemetryModule.tsx  # GPS Wearable Telemetry & WebSocket Stream
│       ├── TrueSpeedModule.tsx         # Computer-Vision Velocity Authenticator
│       ├── CognitiveSchemeMatcher.tsx  # S2 Sports IQ Millisecond Diagnostic
│       ├── ComplianceDashboard.tsx     # Live Audit Log & Gatekeeper Panel
│       ├── AthleteProfileCard.tsx      # Verified Recruits Card & Measurables
│       ├── LeaderboardTop250.tsx       # Composite Prospect Ranking Board
│       ├── TransferPortalModule.tsx    # Real-Time Portal Scouting Hub
│       ├── NcaaEligibilityTracker.tsx  # Core-Course GPA Qualifier Calculator
│       ├── CoachPipelineBoard.tsx      # Drag-and-Drop CRM Kanban Board
│       ├── SchoolsDirectory.tsx        # Multi-Division Search & Offer Claiming
│       ├── CoachesDirectory.tsx        # College Coaches Network Directory
│       ├── CoachMessagingFeed.tsx      # Compliance-Gated Direct Messaging
│       ├── CampSearchEngine.tsx        # Showcase & Combine Directory
│       ├── AIRecruitingAssistant.tsx   # Gemini AI Letter Generator
│       └── OnboardingWizard.tsx        # Persona Onboarding Flow
├── server.ts                           # Express REST API & WebSocket Server
├── vite.config.ts                      # Vite SPA Bundler Configuration
├── package.json                        # Node Dependencies & Build Scripts
├── README.md                           # Master Project Documentation
└── AGENTS.md                           # Technical Architecture Rules & Guidelines
```

---

## 🌐 API Architecture & Endpoints

| Endpoint | Method | Protocol | Description |
| :--- | :--- | :--- | :--- |
| `/api/health` | `GET` | REST | Service healthcheck & timestamp |
| `/api/compliance/status` | `GET` | REST | Pre-compose compliance gate status |
| `/api/messages/send` | `POST` | REST | Authoritative compliance-gated message send |
| `/api/v1/bioscan/webhooks/catapult` | `POST` | REST | Catapult/WHOOP GPS telemetry webhook ingress |
| `/api/v1/bioscan/stream` | `WS` | WebSocket | Egress stream broadcasting live speed & load |
| `/api/v1/rallysafe/campaigns` | `POST` | REST | Initializes NIL campaign in integer cents |
| `/api/v1/rallysafe/campaigns/:id/release` | `POST` | REST | Releases escrow funds (Gated by Transfer Portal Lock) |
| `/api/v1/rallysafe/webhooks/stripe` | `POST` | REST | Stripe Connect raw buffer webhook listener |
| `/api/v1/film/auto-tag` | `POST` | REST | Computer-vision play-by-play film tagging endpoint |
| `/api/v1/auth/permissions/:role` | `GET` | REST | Fetches role-based access control permissions |
| `/api/v1/combines/webhooks/laser` | `POST` | REST | Ingests verified combine laser timing data |
| `/api/v1/compliance/parent-consent` | `POST` | REST | Records parent/guardian COPPA/FERPA consent |

> Protected routes require `Authorization: Bearer <API_ACCESS_TOKEN>` when configured. Webhooks use shared secrets (`BIOSCAN_WEBHOOK_SECRET`, `STRIPE_WEBHOOK_SECRET`). See [`.env.example`](.env.example).

---

## 🎨 Design System & Aesthetics

Gridiron Gateway strictly adheres to a **Dark Sports-Tech** design aesthetic:

* **Backdrop:** `#09090b` (`bg-slate-950`)
* **Surfaces:** Dark Slate (`bg-slate-900`, `border-slate-800`)
* **Neon Emerald (`#10b981`):** Primary action buttons, verified badges, positive CapGM metrics.
* **Cyan Blue (`#06b6d4`):** Physical combine measurements, BioScan telemetry, TrueSpeed data.
* **Amber Gold (`#f59e0b`):** Star ratings, Top 250 national ranks, showcase camps.
* **Purple (`#a855f7`):** Academics, S2 Cognition diagnostics, play-by-play film tags.
* **Rose Red (`#f43f5e`):** Compliance locks, transfer portal blocks, legal consent warnings.

---

## 🚀 Getting Started & Local Setup

### Prerequisites

* Node.js v18+
* npm v9+

### Installation & Run Commands

```bash
# 1. Clone the repository
git clone https://github.com/elrookan15/Gridiron-Gateway-Begin-.git
cd Gridiron-Gateway-Begin-

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Set GEMINI_API_KEY and (for production) API_ACCESS_TOKEN / webhook secrets
# Set COLLEGE_FOOTBALL_API_KEY for program-directory sync (collegefootballdata.com)

# 4. Type-check TypeScript codebase
npx tsc --noEmit

# 5. Start development server (Express + Vite middleware)
npm run dev

# 6. Build for production & launch Express server
npm run build
npm start
```

### Program & Coach Data Ingestion (Do Not LLM-Generate Staff Lists)

College football has 900+ programs and extreme coaching turnover. **Never invent coach emails in `mockData.ts`.** Use the automated pipeline:

| Step | Script | Source |
| :--- | :--- | :--- |
| 1. NCAA programs | `npm run ingest:cfbd` | CFBD `GET /teams` (Bearer `COLLEGE_FOOTBALL_API_KEY`) |
| 2. Coach contacts | `npm run ingest:sidearm` | Rate-limited Sidearm athletics staff HTML (mailto/tel only) |
| 3. JUCO / Prep | `npm run ingest:juco-csv` | Verified CSV bulk import (`data/ingestion/templates/…`) |
| 4. Monthly orchestrator | `npm run ingest:monthly` | Runs 1→3; set `SKIP_SIDEARM_SCRAPE=1` to skip live HTML |

Artifacts land in `data/ingestion/output/` (gitignored). Postgres targets: `program_directory` + `coaching_staff` in `schema.sql`. Missing contacts must render as **Contact not verified** — never a hallucinated `@university.edu`.

### Running Test Suites

```bash
# Run CapGM Roster Salary Cap Unit Tests
npx tsx src/capGmTestSuite.ts

# Run NCAA Compliance Gatekeeper Unit Tests
npx tsx src/complianceTestSuite.ts

# Run Stripe Connect Webhook & Transfer Portal Lock Test Suite
npx tsx src/runStripeTest.ts
```

---

*Built with precision for modern collegiate athletics.*
