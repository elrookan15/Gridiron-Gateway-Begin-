# Gridiron Gateway — Bugbot Review Rules (Federov QA-Sentinel)

Cursor project rules (`.cursor/rules/*.mdc`) do **not** apply to Bugbot. This file is the PR review source of truth. The Composer/CI sentinel lives at `.agents/rules/federov_bugbot.md`.

Persona: Federov BugBot. No praise. Compliance loopholes are production outages. Stack: Vite 6+ / React 19 SPA / TypeScript strict / Tailwind v4 / shadcn/ui / Supabase PostgreSQL + RLS / Express (`server.ts`) / MediaPipe WASM. Not Next.js. Types: `src/types.ts` (`CapGMRosterModel`, `NilEscrowCampaign`, `NilTransaction`, `BioScanTelemetry`, `MultiTenantUser`, `AthleteProfile`, `TransferPortalAthlete`). Live briefing: `docs/dashboard-spec.md`.

Prefer verified/instrumented metrics (BioScan, TrueSpeed, Combine Laser) over self-reported claims. AI assists triage; it must never auto-approve NCAA compliance or NIL payouts.

---

## Blocking (must flag)

### NCAA recruiting compliance (CRITICAL)

If a changed messaging, coach-contact, or official-visit scheduling path does not call `getCurrentNcaaPeriod()`, or if communication remains enabled when the period is `DEAD`:

- Add a blocking Bug titled "Recruiting calendar bypass"
- Body: "Direct messages, coach contact, and official-visit scheduling must evaluate `getCurrentNcaaPeriod()`. Unblocked paths during DEAD period are a fatal NCAA defect."
- Apply label "compliance"

If `actionType = 'DIRECT_MESSAGE'` (or equivalent DM dispatch) can execute for athletes under 18 without `hasParentalConsent === true` verified against `parental_consents`:

- Add a blocking Bug titled "COPPA DM without parental consent"
- Body: "Minors cannot receive direct messages unless parental consent is verified on `parental_consents`. Client-only flags are not sufficient."
- Apply label "compliance"

If message dispatches or offer notes skip regex boundary scans for prohibited pay-for-play keywords (`guaranteed cash`, `signing bonus`, `car deal`, `free housing`, `pay for play`):

- Add a blocking Bug titled "Inducement scan omitted"
- Body: "Offer notes and message bodies must run inducement keyword scans before dispatch. Unscanned text is an NCAA inducement hole."
- Apply label "compliance"

If a compliance evaluation or gate decision does not write an immutable, timestamped row to `public.compliance_audit_logs`:

- Add a blocking Bug titled "Audit ledger bypass"
- Body: "Every compliance gate decision must append to `public.compliance_audit_logs`. Silent allows/denies are unauditable."
- Apply label "compliance"

### NIL clearinghouse & escrow (CRITICAL)

If `releaseNilEscrowPayout()` or Stripe Connect payout triggers can execute when `clearinghouse_status !== 'CLEARED'`:

- Add a blocking Bug titled "Escrow released before CSC NIL Go CLEARED"
- Body: "RallySafe / Stripe Connect must fail-closed unless `clearinghouse_status === 'CLEARED'`. Cite `NilTransaction` / `ClearinghouseStatus`."
- Apply label "compliance"

If a SQL migration adds or modifies `nil_transactions` without:

```sql
CONSTRAINT enforce_cleared_payout CHECK (
    (payout_released = FALSE) OR (clearinghouse_status = 'CLEARED')
)
```

- Add a blocking Bug titled "nil_transactions missing enforce_cleared_payout CHECK"
- Apply label "compliance"

If NILCalculator (or any deterministic estimator) writes directly to transaction ledgers or claims clearinghouse clearance without CSC NIL Go audit ingestion:

- Add a blocking Bug titled "Estimator-to-authorization drift"
- Body: "Estimators may display valuations. They must not insert ledger rows or set CLEARED. Clearance requires CSC NIL Go audit ingestion."
- Apply label "compliance"

### Security / AppSec

If coach-scoped pipeline queries (`scholarship_offers`, `college_coaches`, `pipeline_boards`) filter by `school_id` solely in React state instead of PostgreSQL RLS tied to `auth.jwt()`:

- Add a blocking Bug titled "Client-side tenant filtering"
- Body: "RLS is the isolation boundary. Client `.eq('school_id', …)` is not a security control. Policies must bind `auth.jwt()` / `school_staff_roles`."
- Apply label "security"

If a SQL migration grants `INSERT`, `UPDATE`, or `DELETE` on recruiting pipelines without validating `school_staff_roles`:

- Add a blocking Bug titled "Open write policy on recruiting pipeline"
- Body: "Pipeline writes must require `school_staff_roles`. Fail-closed RLS — no anon/authenticated blanket DML."
- Apply label "security"

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

### Type safety & SPA architecture

If changed TypeScript introduces `any`, `as any`, inferred `any`, or untyped `JSON.parse` results flowing into domain models without a narrow:

- Add a blocking Bug titled "any leakage into domain types"
- Body: "Zero tolerance in `src/`. Cite `src/types.ts`. Parse with typed guards. No silent `as` casts across CapGM, NIL, BioScan, or RBAC models."

If a changed file introduces `"use client"`, `"use server"`, Next.js App Router folders (`app/`), or Next.js routing APIs:

- Add a blocking Bug titled "Next.js framework drift"
- Body: "Gridiron Gateway is a Vite React 19 SPA. Do not add Next.js directives or routing."

If a changed interactive control (`button`, `select`, `input`, slider thumb) lacks `min-h-[44px]`:

- Add a blocking Bug titled "Touch target below 44px"
- Body: "Sideline iPad coaches need ≥44px hits (`min-h-[44px]`). Compact `py-1.5` does not replace height."

If a changed async component (fetch/suspense/loader) has no reserved skeleton or structural `min-h-[…]` and can collapse layout on load:

- Add a blocking Bug titled "CLS — async surface has no reserved height"
- Body: "Keep CLS < 0.1. Reserve skeleton/min-height for loading, error, and empty states."

---

## Non-blocking (flag, do not fail the check)

### UI / design system

For files matching `src/components/**/*.{tsx,jsx}`:

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
