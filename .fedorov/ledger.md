# Federov Defect Ledger

Index for Correction Contracts (see `.cursor/rules/fedorov-core.mdc` §4).
Also cross-check root [`MISTAKE_LEDGER.md`](../MISTAKE_LEDGER.md).

## Index

| Date | Title | Category | Persona | Status |
|---|---|---|---|---|
| 2026-09-13 | RallySafe release/webhook ignored Postgres SOT | nil-capgm | integration | Active |
| 2026-09-07 | Compliance clock-drift (ML-001) | compliance | qa | Active — see MISTAKE_LEDGER |
| 2026-09-09 | Dual schools / MVP archive dossier debt | persistence | integration | Superseded — archive dropped via dossier cleanup migration |

## Entries

## [2026-09-13] RallySafe release/webhook ignored Postgres SOT

- Category: nil-capgm
- Persona: integration
- File(s): `server.ts`, `src/lib/escrowPersist.ts`, `src/lib/escrowCampaignStore.ts`
- Root Cause: Sept 9 persist wrote `rallysafe_escrow_campaigns` on create/release, but `GET /campaigns` reads PG while `POST .../release` and Stripe webhook only `find` in `ESCROW_CAMPAIGNS_DB`. After restart, created campaigns 404 on release; seed `esc-cleared` can be re-released over a persisted RELEASED row because `payoutReleased` was never passed to `canReleaseNilEscrow`.
- Patch: `fetchEscrowCampaign` + `hydrateEscrowStore` (PG wins) on mutation paths; `payoutReleased` from `escrowStatus === "RELEASED"`; per-campaign in-flight lock.
- Red Test: RAM seed FUNDED + PG RELEASED → old finder returns seed and gate allows. `hydrateEscrowStore` test fails on old RAM-only find.
- Green Test: `npx tsx src/rallySafeClearinghouseTestSuite.ts` — PG RELEASED overwrites seed; PG-only id hydrates; `ALREADY_RELEASED` when `payoutReleased`.
- Regression Guard: RallySafe suite hydrate + already-released asserts (pre-commit step 3).
- Residual Risk: List still treats PG read error as empty (`[]`) and falls back to RAM seeds; no row-level SQL lock across Node processes.
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
