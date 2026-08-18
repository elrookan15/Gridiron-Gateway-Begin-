---
name: source-control
description: Automated source control management, branch strategies, compliance diff auditing, and conventional commit generation for Gridiron Gateway.
---

# 🐙 Source Control Agent Skill (Gridiron Gateway)

## Overview
This skill equips Antigravity AI agents with standardized workflows for managing source control tasks in Gridiron Gateway, enforcing strict NCAA compliance safeguards, Conventional Commits, and scoped repository changes.

## Non-Negotiable Source Control Rules

1. **Automated Commit Execution Post-Verification:**
   - Always run pre-flight quality verification (`npx tsc --noEmit`, scoped diff inspection, compliance audit).
   - Automatically execute `git commit` with a standardized Conventional Commit message once verification passes.

2. **Scoped File Isolation & Audit Reporting:**
   - Explicitly list touched vs. un-touched files when reporting completed tasks.
   - Never bundle unrelated fixes into a feature commit.

3. **Compliance-Sensitive Diff Auditing:**
   - Flags changes to `complianceEngine.ts`, `server.ts` compliance endpoints, or minor consent workflows (`ParentConsentPortal.tsx`).
   - Requires fail-closed default behavior on ambiguous inputs.

4. **Pre-Commit Quality Gate:**
   - Verify TypeScript compilation via `npx tsc --noEmit` before staging changes.
   - Verify zero leakage of `any` types.

5. **Conventional Commit Standard:**
   ```text
   <type>(<scope>): <short description>

   [optional body explaining why this change was made]

   [optional footnote flagging compliance re-verification if applicable]
   ```
   - **Types:** `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`, `ci`
   - **Scopes:** `compliance`, `capgm`, `nil`, `leaderboard`, `film`, `bioscan`, `truespeed`, `cognition`, `types`, `rbac`

## Standard Execution Workflow

### Step 1: Pre-Flight Status & Diff Audit
```bash
# Check modified and untracked files
git status

# Inspect precise changes
git diff
```

### Step 2: Quality & Type Verification
```bash
# Run strict TypeScript verification
npx tsc --noEmit
```

### Step 3: Compliance Scan
Check if any of the following sensitive paths were modified:
- `src/complianceEngine.ts`
- `src/complianceTestSuite.ts`
- `server.ts` (messaging / compliance / minor endpoints)
- `src/components/ParentConsentPortal.tsx`

If touched, include a **🛡️ Compliance & Audit Note** in the report.

### Step 4: Staging Scoped Files
Only stage files related to the specific feature/fix:
```bash
git add src/components/SpecificComponent.tsx src/types.ts
```

### Step 5: Draft Commit & Present to User
Provide the exact diagnosis, staged files, and proposed commit message for user review before running `git commit`.
