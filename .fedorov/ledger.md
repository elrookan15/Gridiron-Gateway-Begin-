# Federov Defect Ledger

Index for Correction Contracts (see `.cursor/rules/fedorov-core.mdc` §4).
Also cross-check root [`MISTAKE_LEDGER.md`](../MISTAKE_LEDGER.md).

## Index

| Date | Title | Category | Persona | Status |
|---|---|---|---|---|
| 2026-09-07 | Compliance clock-drift (ML-001) | compliance | qa | Active — see MISTAKE_LEDGER |
| 2026-09-09 | Dual schools / MVP archive dossier debt | persistence | integration | Superseded — archive dropped via dossier cleanup migration |
| 2026-09-14 | Sidearm/CSV coach persist duplicate INSERT | persistence | integration | Active |

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

## [2026-09-14] Sidearm/CSV coach persist duplicate INSERT

- Category: persistence
- Persona: integration
- File(s): `src/lib/directoryPersist.ts`
- Root Cause: `toCoachInsert` dropped non-UUID `coachId` (`staff-*` / `csv-coach-*`). `persistCoachesToPostgres` then `insert()`d so Postgres `gen_random_uuid()` minted a new PK on every scrape/CSV re-run.
- Patch: UUID v5 from the stable slug; always `upsert` on `coach_id`.
- Red Test: Same Sidearm slug twice → two rows (old insert path omitted `coach_id`).
- Green Test: `coachIdToUuid` is deterministic UUID v5; existing UUIDs pass through; `npx tsx src/directoryPersistTestSuite.ts`.
- Regression Guard: directory persist suite (pre-commit step 11).
- Recurrence Count: 1
- Status: Active
