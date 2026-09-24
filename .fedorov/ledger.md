# Federov Defect Ledger

Index for Correction Contracts (see `.cursor/rules/fedorov-core.mdc` §4).
Also cross-check root [`MISTAKE_LEDGER.md`](../MISTAKE_LEDGER.md).

## Index

| Date | Title | Category | Persona | Status |
|---|---|---|---|---|
| 2026-09-07 | Compliance clock-drift (ML-001) | compliance | qa | Active — see MISTAKE_LEDGER |
| 2026-09-09 | Dual schools / MVP archive dossier debt | persistence | integration | Superseded — archive dropped via dossier cleanup migration |
| 2026-09-20 | NCAA Recruiting Auditor ASP v1.0 land | compliance | integration | Active — packages/ncaa-recruiting-auditor |
| 2026-09-22 | ASP fail-closed CodeRabbit majors (HALT/tz/slice) | compliance | integration | Active |
| 2026-09-22 | Health audit baseline (CI Cursor/** + orphan suites) | other | qa | Active — see docs/audits/2026-09-22-health-audit.md |
| 2026-09-22 | Stripe whsec fail-closed + schema schools DDL split | security / persistence | integration | Active |
| 2026-09-24 | Laser webhook stamped Verified on any positive 40 | other | integration | Active |

## Entries

## [2026-09-07] Compliance Test Clock-Drift / September 2026 Boundary Violation

- Category: compliance
- Persona: qa
- File(s): `src/complianceTestSuite.ts`
- Root Cause: Tests relied on runner system clock inside seeded August 2026 windows.
- Patch: Explicit `override_timestamp` on Group B evaluations.
- Red Test: Runner date ≥ 2026-09 fails calendar window asserts without override.
- Green Test: `override_timestamp: "2026-08-15T12:00:00.000Z"` passes.
- Regression Guard: Always supply static override for temporal DB seeds.
- Recurrence Count: 1
- Status: Active (mirrored from ML-001)

## [2026-09-09] Dual schools MVP archive blocking production dossier joins

- Category: persistence
- Persona: integration
- File(s): `scholarship_offers`, `schools_mvp_archive`, `src/services/schoolsApi.ts`
- Root Cause: Post-cutover offers FK pointed at UUID `schools_mvp_archive` while SPA directory used production `schools.school_id`.
- Patch: Migration `20260911120000_dossier_offers_production_schools.sql`; `mapProductionOfferSchool`.
- Red Test: Dossier select `schools(id, name)` fails against production columns.
- Green Test: Anon/REST FK to `schools(school_id)`; archive relation gone.
- Regression Guard: Dossier mapper suite + pre-commit gate.
- Recurrence Count: 1
- Status: Superseded (archive dropped on live project)

## [2026-09-20] NCAA Recruiting Auditor ASP v1.0 land

- Category: compliance
- Persona: integration
- File(s): `packages/ncaa-recruiting-auditor/**`
- Root Cause: Frozen ASP v1.0 package needed a durable home in-repo without merging into `src/complianceEngine.ts` or inventing Slice 2 ledgers.
- Patch: Self-contained package under `packages/ncaa-recruiting-auditor/` + root script `test:ncaa-auditor-asp`.
- Red Test: Absent package → no CI surface for July 10 PeriodGate vectors.
- Green Test: `npm run test:ncaa-auditor-asp` → 6/6 vitest pass.
- Regression Guard: `src/periodGate.test.ts` July/August/TZ vectors; `vitest.config.ts` isolates from root Vite config.
- Residual Risk: Not wired into live `complianceEngine` / message send path; bylaw strings are architectural assertions only.
- Recurrence Count: 1
- Status: Active

## [2026-09-22] ASP fail-closed CodeRabbit majors (HALT / tz / slice / location)

- Category: compliance
- Persona: integration
- File(s): `packages/ncaa-recruiting-auditor/src/{auditComplianceBatch,periodGate,sessionEnvelope,periodGate.test}.ts`
- Root Cause: HALT prospects skipped → CLEAR; non-FBS sessions CLEAR; UTC default for missing tz; open location string; offset-free timestamp_text; dropped booster/direction metadata.
- Patch: EXTRACTOR_HALT quarantine; SLICE_NOT_IMPLEMENTED outside FOOTBALL/FBS; no UTC default; LocationSchema on raw+enriched; offset-bearing parse only; preserve consumed metadata fields. Narrow year scope in PeriodGate only (frozen `FBS-2026-*` table) — no invented calendarResolver year lock.
- Red Test: HALT-only / FCS / missing tz previously CLEAR or PERMISSIBLE.
- Green Test: `npm run test:ncaa-auditor-asp` → 13/13 (6 July + 7 fail-closed).
- Regression Guard: vitest fail-closed suite in `periodGate.test.ts`.
- Residual Risk: Slice 2 still deferred; live complianceEngine not wired.
- Recurrence Count: 1
- Status: Active

## [2026-09-22] Health audit baseline — CI Cursor/** filter + orphan suite scripts

- Category: other
- Persona: qa
- File(s): `docs/audits/2026-09-22-health-audit.md`, `.github/workflows/ci.yml`, `package.json`, `scripts/runAllPreCommitChecks.ts`
- Root Cause: No committed evidence-backed health baseline; CI push filter missed `Cursor/**` agent branches; gemini/gcs step titles drifted from suite counts; two TestSuites lacked npm scripts.
- Patch: Audit markdown; add `Cursor/**` to CI push branches; correct 11/11 and 10/10 labels; wire `test:nil-valuation` / `test:ncaa-clearance`.
- Red Test: Push to `Cursor/*` did not match `cursor/**` filter (case-sensitive); suite output 11/11 vs CI claim 9/9.
- Green Test: Full matrix in audit doc — lint/build/pre-commit/`test:*` EXIT 0 on 2026-09-22 runner.
- Regression Guard: CI titles match suite prints; orphan scripts in `package.json`.
- Recurrence Count: 1
- Status: Active

## [2026-09-22] Stripe webhook demo secret fail-closed + schema.sql schools DDL split

- Category: security / persistence
- Persona: integration
- File(s): `src/lib/stripeWebhookSecret.ts`, `src/serverSecurity.ts`, `src/stripe-webhook-verification.ts`, `schema.sql`, `docs/schema-source-of-truth.md`, suites + CI
- Root Cause: (1) Silent `whsec_mock_*` fallback when `STRIPE_WEBHOOK_SECRET` unset allowed forged webhooks in non-prod that looks like prod. (2) `schema.sql` defined conflicting `CREATE TABLE schools` (VARCHAR vs UUID) plus duplicate `college_coaches` / `athlete_profiles`.
- Patch: `resolveStripeWebhookSecret()` — demo only with `ALLOW_STRIPE_DEMO_WEBHOOK_SECRET=1` or `NODE_ENV=test`; middleware/handler 503 without secret; MVP schools → `schools_mvp_archive`; SoT doc; integrity + secret suites wired to CI/pre-commit.
- Red Test: Missing secret / demo secret without hatch → reject; second `CREATE TABLE schools` would fail integrity suite.
- Green Test: `npm run test:stripe-webhook` 12/12; `npm run test:schema-sql` 9/9; `npm run lint` + `npm run test:pre-commit` EXIT 0 (2026-09-22).
- Regression Guard: CI steps `test:stripe-webhook` + `test:schema-sql`; static CREATE TABLE count asserts.
- Residual Risk: Live Stripe `constructEvent` still demo-HMAC; mockData secondary UI (P1-3) untouched; fresh full `schema.sql` apply not executed against a live Postgres in this run.
- Recurrence Count: 1
- Status: Active

## [2026-09-24] Laser webhook stamped Verified on any positive 40

- Category: other
- Persona: integration
- File(s): `server.ts`, `src/lib/combineLaserEngine.ts`, `src/combineLaserTestSuite.ts`
- Root Cause: `POST /api/v1/combines/webhooks/laser` accepted any `laserFortyTime > 0` and persisted `badge: Laser Verified` without `isPlausibleLaserFortyTime` / `validateAndIngestLaserPacket`. A 3.50s or 9.90s packet became a verified combine row in RAM + `combine_laser_entries`.
- Patch: Shared `isPlausibleLaserFortyTime` (4.10–6.00s) used by the engine and the live webhook. Out-of-range forties return 400 `INVALID_40_YARD_DASH` and never persist.
- Red Test: Old webhook: `Number.isFinite(forty) || forty <= 0` lets 3.50 through. `isPlausibleLaserFortyTime(3.5) === false` fails on old code.
- Green Test: `npm run test:laser` — webhook predicate rejects 3.50 / 6.50 / 0 / NaN; accepts 4.10 / 4.48 / 6.00.
- Regression Guard: `src/combineLaserTestSuite.ts` webhook-contract asserts; wired via `test:laser` / pre-commit.
- Residual Risk: Shuttle / 3-cone / jumps still optional on the webhook (forty-only packets remain valid). Full `validateAndIngestLaserPacket` still unused on the HTTP path so partial vendor payloads are not rejected.
- Recurrence Count: 2 (prior PR #16 rejected 2026-09-07; 30-day refresh)
- Status: Active
