# Gridiron Gateway - Mistake Ledger

This ledger tracks triggers, bad assumptions, corrective rules, and regression tests for errors caught during continuous integration, compliance gates, and core protocol execution.

## [ML-001] Compliance Test Clock-Drift / September 2026 Boundary Violation

- **Trigger**: The actual runner system datetime drifted into September 2026 (`2026-09-07T15:24:34.855Z`), moving past the hardcoded August 2026 (`2026-08-01` to `2026-08-31`) database recruiting periods seeded for Group B tests.
- **Bad Assumption**: Assumed that Group B compliance integration tests evaluating active calendar windows could run without an explicit `override_timestamp`, relying implicitly on the local runner system clock to remain within the active August 2026 window.
- **Corrective Rule**: Always supply an explicit, static `override_timestamp` to any test case/assertion checking state against database-seeded temporal records (such as NCAA recruiting periods) to guarantee absolute date-stability regardless of local runner clock progression.
- **Regression Test**: Added `override_timestamp: "2026-08-15T12:00:00.000Z"` explicitly to all Group B test evaluations in `src/complianceTestSuite.ts`.
