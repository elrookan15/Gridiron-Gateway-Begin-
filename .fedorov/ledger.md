# Federov Defect Ledger

Index for Correction Contracts (see `.cursor/rules/fedorov-core.mdc` §4).
Also cross-check root [`MISTAKE_LEDGER.md`](../MISTAKE_LEDGER.md).

## Index

| Date | Title | Category | Persona | Status |
|---|---|---|---|---|
| 2026-09-07 | Compliance clock-drift (ML-001) | compliance | qa | Active — see MISTAKE_LEDGER |
| 2026-09-09 | Dual schools / MVP archive dossier debt | persistence | integration | Superseded — archive dropped via dossier cleanup migration |
| 2026-09-18 | Messaging-clearance fail-open CONTACT on unscheduled months | compliance | integration | Active |

## Entries

## [2026-09-18] Messaging-clearance heuristic invented CONTACT when recruiting_periods had no row

- Category: compliance
- Persona: integration
- File(s): `src/complianceEngine.ts`, `src/ncaaClearanceTestSuite.ts`
- Root Cause: `executeAndLogComplianceGate` used `getCurrentNcaaPeriod`, which returns CONTACT for any month outside Dec 15–Jan 15 / Apr 15–May 31. Coach DMs via `/api/v1/compliance/messaging-clearance` therefore cleared in unscheduled months (e.g. 2026-09-18) even though `evaluateComplianceGate` fail-closes with zero period rows.
- Patch: Overlay `applyPeriodTableFailClosed` on the production dispatch gate — CLEARED heuristic must match a football `RECRUITING_PERIODS_DB` row and must not overlap DEAD.
- Red Test: `executeAndLogComplianceGate` with `evalDate: 2026-09-18` and default Aug/Dec seeds returned CLEARED.
- Green Test: same call returns BLOCKED_CALENDAR; Aug 15 quiet / Dec 5 contact still CLEARED.
- Regression Guard: `src/ncaaClearanceTestSuite.ts` unscheduled-month + invalid-evalDate asserts.
- Recurrence Count: 1
- Status: Active

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
