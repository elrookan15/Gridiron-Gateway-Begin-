# Gridiron Gateway — Bugbot Review Rules

Cursor project rules (`.cursor/rules/*.mdc`) do **not** apply to Bugbot. This file is the review source of truth for PRs on `elrookan15/Gridiron-Gateway-Begin-`.

Stack: Vite + React 19 SPA + strict TypeScript + Tailwind + shadcn/ui + Supabase PostgreSQL (RLS) + Express (`server.ts`). Not Next.js. Live data briefing: `docs/dashboard-spec.md`. Domain types live in `src/types.ts` (`CapGMRosterModel`, `NilEscrowCampaign`, `BioScanTelemetry`, `MultiTenantUser`, `AthleteProfile`, `TransferPortalAthlete`). Do not invent properties; propose an interface addition first.

Prefer verified/instrumented metrics (BioScan, TrueSpeed, Combine Laser) over self-reported claims. AI assists triage; it must never auto-approve NCAA compliance or NIL payouts.

---

## Blocking (must flag)

### Security / AppSec

If a changed file under `src/` (Vite SPA) references `SUPABASE_SERVICE_ROLE_KEY`, a service-role JWT, or bypasses RLS by filtering sensitive rows only on the client:

- Add a blocking Bug titled "Service-role or client-side security boundary"
- Body: "The SPA may use the anon/publishable key only (`src/lib/supabaseClient.ts`). RLS is the isolation boundary. Move privileged writes to Edge Functions / `server.ts`."
- Apply label "security"

If a changed file uses `dangerouslySetInnerHTML` with untrusted or concatenated strings, or interpolates user/athlete/coach input into SQL/HTML without parameterization:

- Add a blocking Bug titled "XSS or injection sink"
- Body: "Neutralize XSS in React renders. Parameterize SQL. Never concatenate athlete, coach, or webhook payloads into queries or HTML."
- Apply label "security"

If a Stripe / Catapult / RallySafe / laser webhook handler parses JSON before verifying the signature, or verifies HMAC against a parsed object instead of the raw request buffer:

- Add a blocking Bug titled "Webhook signature verified too late"
- Body: "Stripe Connect and telemetry webhooks must HMAC the raw body (`src/stripe-webhook-verification.ts` pattern) inside try/catch. Reject unsigned payloads fail-closed."
- Apply label "security"

If a changed file hardcodes secrets, webhook secrets, API tokens, or mock `whsec_` values that would ship to production:

- Add a blocking Bug titled "Hardcoded secret"
- Apply label "security"

### FinTech / CapGM / RallySafe

If CapGM, RallySafe, NIL escrow, or payroll math uses `number` floats (`* 0.01`, `/ 100` for display-as-storage, `parseFloat` on cents, IEEE-754 money accumulation) instead of integer cents:

- Add a blocking Bug titled "Floating-point money"
- Body: "CapGM ($20.5M) and RallySafe NIL store and compute in integer cents (`CapGMRosterModel`, `NilEscrowCampaign`, `NilTransaction`). Format for display only. No float drift."
- Apply label "compliance"

If an AI agent, film studio, or scouting module auto-approves NIL milestone release, RallySafe payout, or NCAA compliance without an explicit human/compliance audit gate:

- Add a blocking Bug titled "Ungoverned auto-approval"
- Body: "AI may triage and flag. Compliance officers and escrow gates must remain fail-closed. Cite `RallySafeEscrowModule` / `NilEscrowMilestone`."
- Apply label "compliance"

If Position Coach UI (`POSITION_COACH` on `MultiTenantUser`) can mutate CapGM allocations, roster spend, or RallySafe releases:

- Add a blocking Bug titled "RBAC isolation broken"
- Body: "Position Coaches cannot alter CapGM. Compliance gets audit views. Head Coach/GM owns cap. Enforce in UI and on the server, not only by hiding buttons."
- Apply label "security"

### Data integrity (coaches / programs)

If a changed file LLM-fills, hardcodes, or fabricates coach emails, phones, or `@university.edu` staff directories into `src/data/mockData.ts`, UI datasets, or seeds:

- Add a blocking Bug titled "Invented coach contact"
- Body: "NCAA programs come from CFBD (`scripts/ingestion/cfbdTeamsSync.ts`). Coach contacts come from Sidearm or verified CSV only; `email`/`phone` may be null. UI must show 'Contact not verified' — never invent a fallback."
- Apply label "compliance"

If a PR expands `src/data/mockData.ts` as the product database for schools, leaderboard, or pipeline instead of `src/services/schoolsApi.ts` → Supabase:

- Add a blocking Bug titled "Mock data treated as source of truth"
- Body: "Live backend lock: schools/leaderboard/pipeline fetch PostgreSQL via `schoolsApi.ts`. Residual mocks are migration debt."

If parental-consent / COPPA / FERPA inserts are not bound to the authenticated athlete JWT (or can be written for another athlete_id):

- Add a blocking Bug titled "Consent row not bound to athlete JWT"
- Body: "Parent consent must fail-closed on the session subject. Do not trust client-supplied athlete IDs."
- Apply label "compliance"

### Type safety

If changed TypeScript introduces `any`, `as any`, or untyped `JSON.parse` results flowing into domain models without a narrow:

- Add a blocking Bug titled "any leakage into domain types"
- Body: "Cite `src/types.ts`. Parse with typed guards. No silent `as` casts across CapGM, NIL, BioScan, or RBAC models."

---

## Non-blocking (flag, do not fail the check)

### UI / design system

For files matching `src/components/**/*.{tsx,jsx}`:

If interactive controls lack `min-h-[40px]` / `min-h-[44px]` (and `py-1.5` where compact):

- Add a non-blocking Bug titled "Touch target below 40px"
- Body: "Sideline iPad coaches need ≥44px hits. Use `min-h-[40px]` or `min-h-[44px]`."

If cards omit `border border-slate-800` on `bg-slate-900`, or invent a palette outside emerald `#10b981` / cyan `#06b6d4` / amber `#f59e0b` / purple `#a855f7` / rose `#f43f5e` on `bg-slate-950` backdrops:

- Add a non-blocking Bug titled "Design-token drift"

If athlete/coach names, emails, or metadata can overflow flex layouts (missing `truncate` / `line-clamp-1` / `min-w-0` / `shrink-0` on avatars):

- Add a non-blocking Bug titled "Long hyphenated name will blow the layout"
- Body: "AthleteProfileCard and roster rows must survive long hyphenated last names."

If a 105-man roster / leaderboard list can push critical cap metrics off-screen (missing `overflow-y-auto` on the list, not the page chrome):

- Add a non-blocking Bug titled "Roster scroll clips metrics"

If a modal (e.g. `AiFilmTaggingStudio`) cannot close on Escape and outside click:

- Add a non-blocking Bug titled "Modal missing Escape / overlay dismiss"

### Architecture

If a PR adds a parallel module instead of extending a canonical component (`CapGMRosterSimulator`, `TransferPortalModule`, `BioScanTelemetryModule`, `TrueSpeedModule`, `AiFilmTaggingStudio`, `CoachPipelineBoard`, `RallySafeEscrowModule`, `MultiTenantRoleSelector`, `CombineLaserApiModule`, `AutonomousScoutingAgent`, `ParentConsentPortal`):

- Add a non-blocking Bug titled "Parallel module instead of canonical path"

If backend/API routes (`server.ts`, `supabase/functions/**`, webhook handlers) change without tests (`**/*.test.*`, `**/__tests__/**`, `src/capGmTestSuite.ts`) and the change is money, auth, RLS, or webhook verification:

- Add a non-blocking Bug titled "Missing tests for financial or auth change"

### Ignore

Do not nitpick:

- `dist/**`, `node_modules/**`, lockfile-only diffs, generated Supabase types that are mechanical
- Copy/tone unless it invents coach contacts or claims AI auto-clears compliance
- Existing pre-PR mock debt unless the PR expands it
