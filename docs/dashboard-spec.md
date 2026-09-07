# SEO Title: Gridiron Gateway Production Dashboard Architecture

**Hook:** Execute a high-performance, RLS-secured Vite React command center engineered for precision collegiate scouting and pipeline management.

## H2: System Architecture & Data Execution

Strict Single Page Application (SPA) execution utilizing Vite, React 19, and `@supabase/supabase-js`. The frontend relies completely on a live PostgreSQL backend. Data isolation and multi-tenant security are not handled on the client; they are strictly enforced at the database layer via Row Level Security (RLS) and JWT authentication.

Canonical paths:

- Client: `src/lib/supabaseClient.ts` (anon/publishable key only; persisted JWT session)
- Auth: `src/components/AuthManager.tsx`
- Typed PostgREST: `src/services/schoolsApi.ts`
- Domain types: `src/types.ts`
- Identity: Federov — `.cursor/rules/federov.mdc`

Do not revert to static TypeScript arrays (`mockData.ts` / `schoolsData.ts`) as the product database. Do not use Next.js App Router or `"use client"` as a framework boundary. Do not import `SUPABASE_SERVICE_ROLE_KEY` into the Vite SPA.

## H2: UI Theme: Dark Sports-Tech Constraints

Tailwind CSS parameters are rigidly enforced using an obsidian backdrop (`bg-slate-950`), slate panels (`bg-slate-900` / `border-slate-800`), and a high-energy multi-accent palette with strict `shadcn/ui` component composition. All interactive elements must strictly adhere to mobile-first touch target minimums (`min-h-[44px] min-w-[44px]`). Cumulative Layout Shift (CLS) must remain < 0.1 during async data fetches by reserving structural shells and using skeleton loaders.

| Accent | Classes | Use |
|---|---|---|
| Lime | `text-lime-400` / `bg-lime-500` | Primary actions, verified badges, active states, positive NIL |
| Red | `text-red-500` / `bg-red-600` | Portal alerts, missing compliance, urgent deadlines |
| Gold/Yellow | `text-yellow-400` / `bg-yellow-500` | Stars, accolades, Top 250 |
| Sky | `text-sky-300` / `bg-sky-400` | Combine / BioScan / TrueSpeed / laser |
| Maroon | `text-rose-800` / `bg-rose-900` | Academics, NCAA eligibility, Core GPA |
| Orange | `text-orange-300` / `bg-orange-400` | AI assistant, DM templates, Kanban highlights |

Typography: crisp sans (`font-inter` / `font-jakarta`), uppercase tracked labels, `font-mono` for numeric telemetry. Adapt shadcn primitives via `className`, variants, and composition — do not hand-roll Button, Input, Slider, or Dialog if shadcn covers the case. Identity: Federov — `.cursor/rules/federov.mdc`.

## H2: Module 1: The Collegiate Directory (`LeaderboardTop250`)

A zero-latency data grid rendering live relational data fetched from the `public.schools` and `public.athlete_profiles` Supabase tables via `src/services/schoolsApi.ts` (`fetchSchools`, `fetchAthleteProfiles`, `fetchLeaderboardRecruits`). Equipped with division tier filters (FBS_P4, FCS, etc.), highly typed service endpoints, and empty-state fallbacks to manage the talent pipeline.

Mapped types: `DatabaseSchool`, `DatabaseAthleteProfile`, `LeaderboardRecruit` in `src/types.ts` / `schoolsApi.ts`. Missing coach contacts render **Contact not verified** — never invent emails.

## H2: Module 2: Verified Athlete Dossier (`AthleteProfileModal`)

A mobile-first, high-density metric dashboard rendered as an accessible, hydration-safe modal. It executes a heavily optimized, deeply joined Supabase query (`getAthleteProfileFull`) to centralize physical biometrics, verified media (Hudl/YouTube), and active scholarship offers in a single network request. Enforces strict keyboard accessibility (Escape to close) and outside-click detection. Body scroll locked while open. Type contract: `AthleteFullProfile`.

## H2: Module 3: Coach Recruiting Pipeline (`RecruitingPipeline`)

A highly secure, Kanban-style target progression board (Evaluating, Offered, Official Visit, Committed). This module validates our multi-tenant architecture: it leverages `supabase.auth` JWTs against the `school_staff_roles` PostgreSQL table to ensure a logged-in coach can dynamically read and write *only* to their university's pipeline (`getPipelineOffers`, `updatePipelineOfferStage`). Client-side column filters are UX only — RLS is the security boundary.

## H2: Advanced AppSec & Scalability

The architecture operates under a "zero-trust frontend" model. All sensitive business logic and data filtering occur via Postgres RLS policies. The React client is purely a highly optimized, strictly typed presentation layer.

STRIDE + OWASP: neutralize XSS in React renders; JWT persist + auto-refresh; fail-closed RLS; no service-role in the browser. Money (CapGM / RallySafe / NIL estimators) uses integer cents — no floating-point payroll.

## H2: RallySafe Escrow & CSC NIL Go (fail-closed)

`RallySafeEscrowModule` is **decoupled from `NILCalculator`**. The estimator never writes `public.nil_transactions` and never authorizes capital.

| Plane | System | Table / module |
|---|---|---|
| Third-party NIL | CSC NIL Go (VBP / RoC). Report ≥ $600 aggregate within 5 business days | `public.nil_transactions` + RallySafe |
| Institutional revenue share | CAPS reporting | CapGM only — **not** `nil_transactions` |

`clearinghouse_status` enum: `PENDING` (default), `CLEARED`, `NOT_CLEARED`, `FLAGGED_FOR_REVIEW`. Postgres trigger `fn_lock_nil_clearinghouse_status` + CHECK `enforce_cleared_payout` make the SPA unable to flip clearance. CSC NIL Go posts HMAC-signed webhooks to Edge Function `csc-nil-go-sync` (`x-csc-signature` over the raw body, `verify_jwt = false`). The function uses `SUPABASE_SERVICE_ROLE_KEY` to update `public.nil_transactions` and append `compliance_audit_logs` (`action_type = NIL_CLEARANCE_SYNC`). `private.release_nil_escrow` / RallySafe still block payout unless `CLEARED` AND `stripe_milestone_verified` AND not in the transfer portal. UI renders **Release Funds** only when that gate passes. `NOT_CLEARED` is an eligibility crisis — AI cannot override.

## FAQ

**Why use a Vite SPA over Next.js App Router?**

To prioritize maximum client-side interactivity and fluid state management for drag-and-drop scouting dashboards, shifting the security burden entirely to Supabase's hardened PostgreSQL database via RLS.

**How is multi-tenant security enforced without server-side routes?**

Supabase injects the authenticated user's JWT into every API request. Postgres intercepts this token, checks the user's UUID against the `school_staff_roles` table, and automatically drops any rows belonging to rival schools before the data ever leaves the database.

**How do we prevent component bloat and CLS?**

By enforcing `shadcn/ui` composition rules, centralizing UI state logic, and using strict skeleton loaders and `min-h` CSS classes to lock the DOM structure in place before Supabase API promises resolve.

## Composer trigger

```
Act as Federov. Read @docs/dashboard-spec.md. <feature request>
```

Federov parses this spec first: Vite + React 19 SPA + `@supabase/supabase-js` + RLS + shadcn/ui + dark sports-tech. No framework hallucination. No security bypass.
