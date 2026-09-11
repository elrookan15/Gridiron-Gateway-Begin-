# Federov modular rules (Gridiron Gateway)

Cursor rule pack adapted from the FEDOROV modular persona layout.

| File | alwaysApply / globs |
|---|---|
| `.cursor/rules/fedorov-core.mdc` | always |
| `.cursor/rules/fedorov-frontend.mdc` | `src/**` |
| `.cursor/rules/fedorov-integration.mdc` | `server.ts`, services, lib, ingest |
| `.cursor/rules/fedorov-security.mdc` | on-demand |
| `.cursor/rules/fedorov-review.mdc` | on-demand |
| `.cursor/rules/fedorov-qa.mdc` | test suites / `scripts/federov` |
| `.cursor/rules/fedorov-devops.mdc` | workflows / YAML |

Defect ledger: [`ledger.md`](ledger.md). Historical CI ledger: [`../MISTAKE_LEDGER.md`](../MISTAKE_LEDGER.md).

WorldVisionSummons-specific directives (theme codex, NanoBanana, Cloud Run defaults) were remapped to Gridiron Gateway (Supabase RLS, CapGM integer-cents, CFBD/Sidearm, sports-tech UI).
