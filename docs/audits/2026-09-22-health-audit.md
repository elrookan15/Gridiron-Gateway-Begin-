# Gridiron Gateway — Health Audit

**Date:** 2026-09-22  
**Auditor:** Federov health-audit agent (cloud)  
**Repo:** https://github.com/elrookan15/Gridiron-Gateway-Begin-  
**Branch audited:** `main` @ `4b7c6e5` (then audit branch `Cursor/jonathan-health-audit-5919`)  
**Lockfile used:** `package-lock.json` via **`npm install` / `npm ci`**

### Why npm (not bun)

Both `package-lock.json` (218 KB, lockfileVersion 3) and `bun.lock` (94 KB) exist and both name the package `react-example`. CI (`.github/workflows/ci.yml`) runs `npm ci`. All `package.json` scripts and the documented gatekeeper path assume npm. **Canonical install path = npm.** `bun.lock` is residual dual-lockfile debt (P2), not a blocker.

---

## 1. Executive summary

| Gate | Result |
|---|---|
| `npm install` | **PASS** (355 packages, 0 vulnerabilities) |
| `npm run lint` (`tsc --noEmit`) | **PASS** (0 errors) |
| `npm run build` | **PASS** (Vite SPA + esbuild `dist/server.cjs`; chunk-size warning only) |
| `npm run test:pre-commit` | **PASS** (all 13 steps) |
| Individual `test:*` scripts (package.json) | **14/14 PASS** (incl. 2 newly wired orphans) |
| Orphan suites run ad-hoc before wiring | **PASS** (`nilValuation` 7/7, `ncaaClearance` 11/11) |
| Secrets in commit / `.env` present | **PASS** (no `.env`; `.gitignore` covers `.env*`) |
| Live architecture vs docs | **PASS with P1/P2 gaps** (see §5) |

**Verdict:** Repo health is **green** for typecheck, statutory suites, and production bundle. **P1-2 (schema schools DDL) and P1-4 (Stripe demo whsec fallback) addressed in this PR** with red/green suites. Remaining: P1-3 mockData secondary surfaces + P2 hygiene.

**Pass/fail counts (package.json `test:*` + lint + build + pre-commit):**  
- Pass: **19** (incl. `test:stripe-webhook`, `test:schema-sql`)  
- Fail: **0**  
- Skip: **0** for major gates (`federov:issue-plan` helper skipped — needs issue context)

---

## 2. Commands run + results

### 2.1 Install

```text
$ npm install
npm warn deprecated whatwg-encoding@3.1.1: ...
npm warn deprecated node-domexception@1.0.0: ...
added 355 packages, and audited 356 packages in 5s
found 0 vulnerabilities
EXIT:0
```

### 2.2 Lint / typecheck

```text
$ npm run lint
> react-example@0.0.0 lint
> tsc --noEmit
EXIT:0
```

### 2.3 Pre-commit aggregate

```text
$ npm run test:pre-commit
… (compliance 10/10, rallysafe 6/6, capgm 11/11, parental 13/13,
   scouting 7/7, laser 8/8, gemini 11/11, gcs 10/10,
   directory mappers/persist, telemetry-rbac, federov-kernel) …
🟢 ALL PRE-COMMIT STATUTORY, DIRECTORY, TELEMETRY, FEDEROV & TYPE CHECKS PASSED
EXIT:0
```

### 2.4 Build

```text
$ npm run build
vite v6.4.3 building for production...
✓ 2394 modules transformed.
dist/assets/index-DCrn_hGx.js  1,592.61 kB │ gzip: 407.70 kB
(!) Some chunks are larger than 500 kB after minification.
✓ built in 4.76s
dist/server.cjs      111.7kb
EXIT:0
```

### 2.5 Federov epistemic helper (not a `test:*`, still run)

```text
$ npm run federov:verify-epistemic
PASS: Re=0.12 < max=0.4
EXIT:0
```

Evidence logs retained under `/tmp/cursor/audit-evidence/` on the audit runner (not committed).

---

## 3. Lint / typecheck findings

| Finding | Severity | Notes |
|---|---|---|
| `tsc --noEmit` clean | — | No TS errors on current `main` |
| Package name still `react-example` | P2 | Greenfield leftover; does not break tooling |
| Client bundle ~1.6 MB JS | P2 | Vite warns; consider route-level `import()` code-split later |
| No ESLint script | P2 | “lint” = TypeScript only; no `eslint` in `package.json` |

---

## 4. Test matrix

| Script | Outcome | Evidence |
|---|---|---|
| `test:compliance` | **PASS** | 10/10 fail-closed NCAA compliance |
| `test:rallysafe` | **PASS** | 6/6 RallySafe clearinghouse |
| `test:capgm` | **PASS** | 11/11 integer-cents CapGM |
| `test:parental-consent` | **PASS** | 13/13 COPPA / consent |
| `test:scouting` | **PASS** | 7/7 scheme-fit |
| `test:laser` | **PASS** | 8/8 combine laser bounds |
| `test:gemini-school` | **PASS** | **11/11** (CI label previously said 9/9 — corrected this PR) |
| `test:gcs-signed-url` | **PASS** | **10/10** (CI label previously said 5/5 — corrected this PR) |
| `test:directory-mappers` | **PASS** | null contacts / no invented emails |
| `test:directory-persist` | **PASS** | fail-closed without service role |
| `test:telemetry-rbac` | **PASS** | JWT `app_metadata` RBAC + persist gates |
| `test:federov-kernel` | **PASS** | Bayesian / REGVE / L2 wrap |
| `test:pre-commit` | **PASS** | aggregates above + `tsc` |
| `test:nil-valuation` | **PASS** | 7/7 — **was orphan; wired in this PR** |
| `test:ncaa-clearance` | **PASS** | 11/11 — **was orphan; wired in this PR** |
| `test:stripe-webhook` | **PASS** | 12/12 fail-closed secret resolution + middleware + handler (**P1-4**) |
| `test:schema-sql` | **PASS** | 9/9 schools DDL integrity (**P1-2**) |
| `federov:verify-epistemic` | **PASS** | Re=0.12 (helper, not in CI gate list) |
| `federov:issue-plan` | **SKIP** | Needs GitHub issue context / tokens; not a unit gate |

CI already exercises the statutory set via `.github/workflows/ci.yml` (`npm ci` → lint → suites → build). Agent pipeline: `.github/workflows/agent-pipeline.yml` (Federov plan/verify; Jules label handoff only).

---

## 5. Architecture & docs gaps (prioritized)

### P0 — none blocking merge of this audit

No failing lint/tests/build. No committed `.env`. No `.edu` coach emails invented in `src/data/mockData.ts` (grep clean). Directory mappers force **Contact not verified**.

### P1 — addressed this PR (except mockData debt)

| ID | Gap | Status |
|---|---|---|
| P1-1 | **CI push branch filter was `cursor/**` only** | **ADDRESSED** — `Cursor/**` added. |
| P1-2 | **`schema.sql` dual / conflicting `schools` DDL** | **ADDRESSED** — MVP UUID table renamed `schools_mvp_archive`; scholarship_offers FK retargeted; duplicate `college_coaches` / scouting `athlete_profiles` removed from composite dump; SoT doc `docs/schema-source-of-truth.md`; gate `npm run test:schema-sql` (9/9 PASS 2026-09-22). |
| P1-3 | **Mock fixtures still power secondary product surfaces** | **OPEN** (out of scope this turn) — Live directory via `schoolsApi`; secondary surfaces still import `mockData` (pipeline, camps, messaging, etc.). |
| P1-4 | **Stripe webhook demo HMAC default** | **ADDRESSED** — `resolveStripeWebhookSecret()` fail-closed; demo only with `ALLOW_STRIPE_DEMO_WEBHOOK_SECRET=1` or `NODE_ENV=test`; middleware + handler return 503 without secret; `.env.example` updated; gate `npm run test:stripe-webhook` (12/12 PASS 2026-09-22). |
| P1-5 | **CI / pre-commit count labels drifted** | **ADDRESSED** — Gemini 11/11, GCS 10/10 labels. |

### P2 — hygiene / backlog

| ID | Gap | Notes |
|---|---|---|
| P2-1 | Package name `react-example` | Rename to `gridiron-gateway` when convenient; update lockfiles. |
| P2-2 | Dual lockfiles (`package-lock.json` + `bun.lock`) | Pick npm; delete or regenerate bun lock intentionally. |
| P2-3 | Dual Federov dirs: `.fedorov/` (ledger / defect ledger) vs `.federov/` (failure_graph.json) | Intentional split documented in `.fedorov/README.md`, but near-identical names confuse agents. Consolidate or cross-link in README. |
| P2-4 | `gridiron_latest_code.txt` (~892 KB) | Windows path dump of source (`C:\Users\jonny\Downloads\…`). Noise; recommend delete + `.gitignore`. **Not deleted this PR** (verify-before-prioritize). |
| P2-5 | `chrome-devtools-mcp` in **dependencies** | Dev tooling in prod dep tree. Move to `devDependencies` or remove. |
| P2-6 | `@supabase/ssr` listed but unused in `src/` | Dead dep (SPA uses `@supabase/supabase-js` only). |
| P2-7 | No ESLint / Prettier scripts | Quality gate is `tsc` + domain suites only. |
| P2-8 | Client chunk size | 1.6 MB main JS; CLS/perf debt for mobile coaches. |
| P2-9 | Orphan suites previously unwired | `nilValuationTestSuite`, `ncaaClearanceTestSuite` existed but had no `npm` scripts / CI steps. **Scripts added this PR**; still **not** in CI/pre-commit aggregate (optional follow-up). |
| P2-10 | SenseLab recalled ASP package path | Prior memory mentioned `packages/ncaa-recruiting-auditor/` — **not present on this `main`**. Treat as other-branch / other-repo noise. |

### Hallucinated-data / coach-email risk

| Check | Result |
|---|---|
| `.edu` emails in `mockData.ts` | **None** |
| Directory mappers invent contacts | **No** — tests assert null → “Contact not verified” |
| Gemini school generator invents staff email/phone | **Blocked** by suite (11/11) |
| Fixture athlete emails | Consumer Gmail / techcorp parent phone — fixtures only, not program staff directories |

### Secrets hygiene (`.env.example` only)

Reviewed `.env.example`: documents `VITE_SUPABASE_*` (anon), server `SUPABASE_SERVICE_ROLE_KEY`, Stripe/BioScan/Laser/API tokens, CFBD keys. Correctly warns never to Vite-prefix service role. `.gitignore` includes `.env` / `.env.local`. No `.env` file present on runner. Service-role usage is confined to server/lib persist paths and Edge functions — not `supabaseClient.ts`.

---

## 6. Recommended next fixes (ordered)

1. **Confirm CI green** on this PR (Stripe + schema gates now in CI).  
2. **Migrate pipeline / camps / messaging off mockData** behind RLS services (**P1-3 remaining**) — incremental, one surface at a time.  
3. **Wire `test:nil-valuation` + `test:ncaa-clearance` into CI / pre-commit** if jonathan wants parity (P2-9).  
4. **Repo hygiene:** rename package, drop or sync `bun.lock`, quarantine/delete `gridiron_latest_code.txt`, trim unused deps (P2-1/2/4/5/6).  
5. **Optional:** ESLint flat config + `npm run lint:eslint`; code-split dashboard routes (P2-7/8).

---

## 7. Code changes in this PR

### Pass 1 — audit baseline
| File | Change |
|---|---|
| `docs/audits/2026-09-22-health-audit.md` | Health audit report |
| `.github/workflows/ci.yml` | `Cursor/**` push filter; Gemini/GCS count labels |
| `scripts/runAllPreCommitChecks.ts` | Count-label corrections |
| `package.json` | `test:nil-valuation`, `test:ncaa-clearance` |

### Pass 2 — P1 hardening (Stripe + schema)
| File | Change |
|---|---|
| `src/lib/stripeWebhookSecret.ts` | Fail-closed secret resolver + explicit demo hatch |
| `src/serverSecurity.ts` | `verifyStripeWebhook` uses resolver; no open-dev bypass |
| `src/stripe-webhook-verification.ts` | Handler refuses missing secret; always validates HMAC |
| `src/stripeWebhookSecretTestSuite.ts` | Red/green suite (12 asserts) |
| `src/schemaSqlIntegrityTestSuite.ts` | Static DDL integrity suite (9 asserts) |
| `schema.sql` | `schools_mvp_archive`; single production `schools` / `college_coaches`; dossier athlete_profiles only |
| `docs/schema-source-of-truth.md` | SoT table |
| `.env.example` | Document fail-closed Stripe + hatch |
| `package.json` / CI / pre-commit | Wire `test:stripe-webhook`, `test:schema-sql` |
| `.fedorov/ledger.md` | Correction contracts |

### Evidence (2026-09-22 pass 2)
```text
$ npm run lint                         → EXIT 0
$ npm run test:stripe-webhook          → 12 PASSED
$ npm run test:schema-sql              → 9 PASSED
$ npm run test:rallysafe               → 6 PASSED
$ npm run test:pre-commit              → ALL PASSED (incl. steps 14–15)
```

No product feature work. No Federov gutting. No secrets committed. No invented coach emails.

---

## 8. Residual risk / unverified

| Item | Status |
|---|---|
| Live Supabase project data / RLS policies against production | **Unverified** this run (no project credentials; suites are local fail-closed unit gates) |
| Stripe live webhook verification with real `constructEvent` | **Unverified** (demo HMAC path exercised in suite) |
| CFBD / Sidearm ingest against live network | **Not run** (`ingest:*` needs API keys; skipped by design) |
| Visual / a11y / CLS measurement in browser | **Unverified** |
| Whether `bun.lock` is still used by any contributor | **Unverified** — treat as debt until jonathan confirms |
| Edge functions deploy health | **Unverified** (files present under `supabase/functions/`) |

---

## Correction Contract (audit deliverable)

- **Root Cause:** Need an evidence-backed health baseline; CI labels + orphan suites + `Cursor/**` push filter were soft gaps, not failing gates.  
- **Patch:** Audit markdown + CI/pre-commit label/filter fixes + npm scripts for previously orphan suites.  
- **Red Test:** N/A for docs; prior CI titles claimed 9/9 and 5/5 while suites print 11 and 10.  
- **Green Test:** Full matrix above — all `test:*`, lint, build, pre-commit EXIT 0.  
- **Regression Guard:** CI still runs statutory suite set; new scripts discoverable via `package.json`.  
- **Residual Risk:** Live Postgres/Stripe/ingest unverified without credentials.  
- **Risk:** **Low** — documentation + trivial CI/script hygiene only.

### DISPROOF GATE

1. **Failure Vector:** Audit could miss runtime-only regressions (env-specific Supabase RLS, real Stripe signatures).  
2. **Verified Evidence:** Commands in §2; suite outputs archived under `/tmp/cursor/audit-evidence/`; `tsc` and `vite build` EXIT 0.  
3. **Unverified Boundaries:** Production Supabase, live ingest, browser CLS, Edge deploy.  
4. **User Decision Points:** Delete `gridiron_latest_code.txt`? Drop `bun.lock`? Promote orphan suites into CI? Rename `react-example`?
