---
name: source-control
description: Automated source control management, branch publishing, merging, Web3 smart contract sentinel checks, statutory compliance auditing, and CI/CD gatekeeper workflows for Gridiron Gateway & RoundBlock.
---

# 🐙 Source Control Agent Skill (Gridiron Gateway & RoundBlock)

## Overview

This skill equips Antigravity AI agents with automated source control management, branch publishing, branch merging, git pushing, Web3 cryptographic determinism, NCAA fail-closed compliance, strict type safety, and GitHub Actions CI/CD orchestration.

## Core Directives

1. **Automated Commit, Push, & Branch Publishing:**
   - Execute pre-flight type compilation (`tsc --noEmit`) and statutory compliance test suite (`npm run test:pre-commit`).
   - Automatically execute `git commit` with a standardized Conventional Commit message once verification passes.
   - Automatically publish local branches and push commits (`git push -u origin <branch>`).

2. **Automated Branch Merging:**
   - Automatically execute branch merges (`git checkout <target> && git merge <source>`) upon completion of verified features.

3. **Web3 Smart Contract Sentinel (RoundBlock Protocol):**
   - Verify Anchor signer authorization (`#[account(mut, signer)]`) and PDA seed/bump derivations.
   - Mandate checked arithmetic (`checked_add`, `checked_sub`, `checked_mul`) on all token/lamport state mutations.

4. **Statutory Compliance & Financial Math Safeguards:**
   - Verify fail-closed NCAA recruiting gatekeeper rules.
   - Enforce integer-cents math for CapGM salary cap and NIL escrow calculations (zero floating-point math in financial contexts).

5. **Scoped File Isolation & Audit Reporting:**
   - Explicitly report touched vs. un-touched files for every completed task.
   - Maintain zero `any` type leakage across all API and database models.

6. **Conventional Commit Standard:**

   ```text
   <type>(<scope>): <short description>

   [technical rationale body]

   [compliance or cryptographic audit footnote if applicable]
   ```

   - **Types:** `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`, `ci`
   - **Scopes:** `compliance`, `web3`, `capgm`, `nil`, `leaderboard`, `film`, `bioscan`, `truespeed`, `cognition`, `types`, `rbac`

## Standard Execution Workflow

### Step 1: Pre-Flight Status & Scoped Diff Audit

```bash
git status
git diff
```

### Step 2: Type Compilation & Compliance Test Suite

```bash
cmd /c npx tsx scripts/runAllPreCommitChecks.ts
```

### Step 3: Staging Scoped Files

```bash
git add <target_files>
```

### Step 4: Automated Commit Execution

```bash
git commit -m "<type>(<scope>): <summary>" -m "<rationale>"
```

### Step 5: Automated Branch Publishing & Pushing

```bash
git push -u origin <branch_name>
```

### Step 6: Automated Branch Merging (When Applicable)

```bash
git checkout <target_branch>
git merge <feature_branch>
git push origin <target_branch>
```
