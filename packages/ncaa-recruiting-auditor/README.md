# NCAA Recruiting Auditor ASP v1.0

A small TypeScript package implementing the frozen extraction boundary, D1 FBS football period gate, and outer compliance harness.

## Use

From this package directory:

```bash
npm install
npm test
```

From the Gridiron Gateway repo root (wires the package without a npm workspaces monorepo):

```bash
npm run test:ncaa-auditor-asp
```

In an application, import `assembleComplianceEnvelope` from `src/sessionEnvelope.ts`, pass the raw extractor object and a validated session context, and pass the resulting envelope to `auditComplianceBatch` from `src/auditComplianceBatch.ts`.

`assembleComplianceEnvelope` always executes `RawExtractorOutputSchema.parse(rawOutput)`. A valid session context includes an offset-bearing `occurred_at`, supported sport/division pair, and IANA `staff_timezone`. Period-gate decisions use that time zone through `Intl.DateTimeFormat`; an uncovered table boundary returns `FLAGGED` with `RULE_TABLE_MISS`.

Bylaw citation strings and period-table rationale text in this package are architectural assertions for the frozen ASP harness. They are not certified legal advice.

## OPEN SLICES — deferred appendix

ASP v1.0 intentionally does not implement:

- in-person contact classification and visit ledger accounting;
- evaluation attribution, evaluation ledgers, and related staff-role rules;
- official/unofficial visit ledger and visit-day accounting;
- frequency caps and rolling contact counters;
- multi-sport calendar selection and cross-sport conflict resolution.

Those slices remain explicitly flagged by the outer harness where applicable. No deferred slice is approximated by a permissive default.

## Disclaimer

This package is an engineering artifact for later handoff. It is not legal advice and must be checked against the current NCAA manual, institutional policy, conference guidance, and counsel review before operational use.
