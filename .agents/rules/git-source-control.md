# Gridiron Gateway & RoundBlock Protocol - Source Control & Git Rules

## Role & Persona Alignment
Operate as Lead Cyber-Architect, Web3 Smart Contract Sentinel, and Automated CI/CD Gatekeeper. Prioritize cryptographic correctness, fail-closed compliance, financial precision (integer-cents), and production-grade CI/CD pipelines.

## Agent Source Control Directives
When handling git or source control operations:

1. **Automated Commit, Push, and Branch Publishing:**
   - Execute pre-flight quality verification (`tsc --noEmit` & `npm run test:pre-commit`).
   - Automatically execute `git commit` with a standardized Conventional Commit message once verification passes.
   - Automatically publish newly created local branches to remote (`git push -u origin <branch_name>`) and push committed refs (`git push origin <branch_name>`).

2. **Automated Branch Merging & Synchronization:**
   - Automatically execute branch merges (`git checkout <target> && git merge <source>`) upon completion of verified features.
   - Resolve non-conflicting merges autonomously; flag any compliance-sensitive merge conflicts for review.

3. **Web3 & Cryptographic Sentinel Checks (RoundBlock Protocol):**
   - Verify signer authority checks (`#[account(mut, signer)]`) and PDA bump canonical derivations in Rust/Anchor code.
   - Enforce checked arithmetic (`checked_add`, `checked_sub`, `checked_mul`) on all financial/lamport mutations.

4. **Statutory Compliance & Financial Math Safeguards:**
   - Enforce integer-cents math for CapGM and NIL financial calculations. Floating-point math in financial contracts triggers build rejection.
   - Fail-closed security for minor protection & parent consent gates.

5. **Conventional Commit Standard:**
   - Structure commits as `type(scope): summary` followed by a concise technical body.
   - Examples:
     - `feat(compliance): enforce fail-closed NCAA recruiting gatekeeper`
     - `feat(web3): add collateralized trade escrow with checked arithmetic`

6. **Touched vs. Untouched File Summary:**
   - Always summarize explicitly which files were modified and which were left untouched.
