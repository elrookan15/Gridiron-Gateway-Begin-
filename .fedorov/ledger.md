# Federov Defect Ledger

Index for Correction Contracts (see `.cursor/rules/fedorov-core.mdc` §4).
Also cross-check root [`MISTAKE_LEDGER.md`](../MISTAKE_LEDGER.md).

## Index

| Date | Title | Category | Persona | Status |
|---|---|---|---|---|
| 2026-09-07 | Compliance clock-drift (ML-001) | compliance | qa | Active — see MISTAKE_LEDGER |
| 2026-09-09 | Dual schools / MVP archive dossier debt | persistence | integration | Superseded — archive dropped via dossier cleanup migration |
| 2026-09-17 | HTTP COPPA age/consent spoof | compliance | security | Active |

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

## [2026-09-17] HTTP COPPA age/consent spoofed messaging clearance

- Category: compliance
- Persona: security
- File(s): `server.ts`, `src/lib/complianceAthleteLookup.ts`, `src/complianceAthleteLookupTestSuite.ts`
- Root Cause: `/api/v1/compliance/messaging-clearance` and `/api/messages/send` forwarded client `athleteAge` / `hasParentalConsent` into `executeAndLogComplianceGate`. Postgres `athlete_profiles.date_of_birth` + `contact_authorized` (parental_consents trigger) were never consulted, so a coach could POST age 18 or `hasParentalConsent: true` and message a minor.
- Patch: `resolveComplianceAthleteGate` overrides gate facts from the profile row (service role). Client consent is never treated as true. Missing row / prod without service role fail-closed as age 0 + no consent. Dev without service role keeps client age only, consent forced false.
- Red Test: `gateFactsFromAthleteRow({ date_of_birth: "2010-06-01", contact_authorized: false })` + `evaluateMessagingClearance` → BLOCKED_MINOR_CONSENT; raw client `(18, true)` → CLEARED.
- Green Test: `npx tsx src/complianceAthleteLookupTestSuite.ts`
- Regression Guard: suite wired into `scripts/runAllPreCommitChecks.ts` (`test:coppa-lookup`).
- Recurrence Count: 1
- Status: Active
