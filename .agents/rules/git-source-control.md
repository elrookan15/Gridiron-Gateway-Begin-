# Gridiron Gateway - Source Control & Git Rules

## Agent Source Control Directives
When handling git or source control operations:

1. **Automated Commit Execution:**
   - Always run pre-flight quality verification (`npx tsc --noEmit`, scoped diff inspection, compliance audit).
   - Automatically execute `git commit` with a standardized Conventional Commit message once verification passes.

2. **Conventional Commit Standard:**
   - Structure commits as `type(scope): summary` followed by a rationale body.
   - Example: `feat(capgm): update integer-cents salary cap simulator logic`

3. **Touched vs. Untouched File Summary:**
   - Always summarize explicitly which files were modified and which were left untouched in your turn completion notes.

4. **Compliance Diff Check:**
   - Flag any diffs in `src/complianceEngine.ts` or minor safety endpoints as compliance-sensitive needing re-verification.
