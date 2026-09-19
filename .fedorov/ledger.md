# Federov Defect Ledger

Index for Correction Contracts (see `.cursor/rules/fedorov-core.mdc` §4).
Also cross-check root [`MISTAKE_LEDGER.md`](../MISTAKE_LEDGER.md).

## Index

| Date | Title | Category | Persona | Status |
|---|---|---|---|---|
| 2026-09-07 | Compliance clock-drift (ML-001) | compliance | qa | Active — see MISTAKE_LEDGER |
| 2026-09-09 | Dual schools / MVP archive dossier debt | persistence | integration | Active — Top 250 click still queried MVP user_id |
| 2026-09-19 | Dossier modal queried MVP user_id after production athlete_id cutover | persistence | integration | Active |

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
- Root Cause: Post-cutover offers FK pointed at UUID `schools_mvp_archive` while SPA directory used production `schools.school_id`. Claimed 20260911 migration never landed in-repo.
- Patch: See 2026-09-19 entry — `getAthleteProfileFull` now keys production `athlete_id`.
- Red Test: Dossier select `schools(id, name)` / `user_id` fails against production columns.
- Green Test: `mapProductionAthleteToFullProfile` + `mapProductionOfferSchool` suite.
- Regression Guard: `src/athleteDossierMapperTestSuite.ts` + pre-commit gate.
- Recurrence Count: 2
- Status: Promoted to Guardrail (dossier identity must match leaderboard athlete_id)

## [2026-09-19] Dossier modal queried MVP user_id after production athlete_id cutover

- Category: persistence
- Persona: frontend
- File(s): `src/services/schoolsApi.ts`, `src/components/AthleteProfileModal.tsx`
- Root Cause: `fetchLeaderboardRecruits` keyed Top 250 cards on production `athlete_profiles.athlete_id`, but `getAthleteProfileFull` still selected MVP `user_id` + `users!inner` + `schools(id, name)`. Click-through returned null / PostgREST 400.
- Patch: Dossier fetch uses the same `athlete_id` select as the leaderboard; offers embed production `schools(school_id, institution_name)` and fail open to `[]`.
- Red Test: Mapper would have produced `id: user_id` and required `schools.id` — Top 250 click could not resolve.
- Green Test: `npx tsx src/athleteDossierMapperTestSuite.ts` — id === athleteId, null measurables, production school embed.
- Regression Guard: `test:athlete-dossier` wired into `scripts/runAllPreCommitChecks.ts`.
- Residual Risk: `getPipelineOffers` still joins MVP `athlete_profiles.user_id` / `users`; offer embed still no-ops if `scholarship_offers` FK is not on production `schools`.
- Recurrence Count: 1
- Status: Active
- Risk: Low — query shape now matches the table the leaderboard already reads.
