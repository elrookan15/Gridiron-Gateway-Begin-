# Federov Defect Ledger

Index for Correction Contracts (see `.cursor/rules/fedorov-core.mdc` §4).
Also cross-check root [`MISTAKE_LEDGER.md`](../MISTAKE_LEDGER.md).

## Index

| Date | Title | Category | Persona | Status |
|---|---|---|---|---|
| 2026-09-07 | Compliance clock-drift (ML-001) | compliance | qa | Active — see MISTAKE_LEDGER |
| 2026-09-09 | Dual schools / MVP archive dossier debt | persistence | integration | Superseded — archive dropped via dossier cleanup migration |
| 2026-09-15 | Pipeline stage UPDATE treated 0-row as success | persistence | integration | Active |

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

## [2026-09-15] Pipeline Kanban UPDATE treated 0-row PostgREST as success

- Category: persistence
- Persona: integration
- File(s): `src/services/schoolsApi.ts` (`updatePipelineOfferStage`)
- Root Cause: Supabase JS UPDATE with RLS/no-match returns `{ data: null, error: null }` unless `.select()` is requested. Optimistic RecruitingPipeline moves stayed on the new column while `scholarship_offers` never changed — especially after JWT `app_metadata` stamps that do not populate MVP `users.role` checked by offer UPDATE RLS.
- Patch: Require the offer row on read; `.update().select("id").maybeSingle()`; `assertPipelineStageWriteReturned` throws on null/mismatch so the UI targeted rollback runs.
- Red Test: `assertPipelineStageWriteReturned(null, offerId)` throws `/no row returned/`.
- Green Test: matching `{ id }` is a no-op success; `npx tsx src/pipelineOfferWriteTestSuite.ts`.
- Regression Guard: `test:pipeline-offer-write` in `scripts/runAllPreCommitChecks.ts`.
- Residual Risk: RLS still keys off `users.role` not `app_metadata.gateway_role` / `school_id` — a 0-row throw is fail-closed UX, not tenant isolation.
- Recurrence Count: 1
- Status: Active
