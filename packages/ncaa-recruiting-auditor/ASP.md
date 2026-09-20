# NCAA Recruiting Auditor ASP v1.0

Frozen package index for later cloud-agent handoff.

## Modules

- [Production Extractor System Directive](EXTRACTOR_DIRECTIVE.md)
- [Verified adversarial matrix](ADVERSARIAL_MATRIX.md)
- [`src/sessionEnvelope.ts`](src/sessionEnvelope.ts): validated raw-output boundary, loss-making normalization, IDs, and calendar resolution.
- [`src/periodGate.ts`](src/periodGate.ts): frozen D1 FBS football period table and local-time verdicts.
- [`src/auditComplianceBatch.ts`](src/auditComplianceBatch.ts): outer guards and implemented audit slice.
- [`src/periodGate.test.ts`](src/periodGate.test.ts): six July boundary and direction vectors.

## Architecture pipeline

`source session → Production Extractor → RawExtractorOutputSchema.parse → SessionContextSchema → normalizeProspect → event_id/calendar enrichment → EnrichedComplianceBatch → outer guards → period gate → findings`

A raw extractor object never enters the audit path without a mandatory schema parse. Every event keeps both the source `temp_event_id` and a generated `event_id`; unknown or unsupported facts are demoted or flagged rather than inferred.

## Disclaimer

This is a frozen engineering artifact, not legal advice and not a substitute for the current NCAA manual, institutional policy, conference guidance, or counsel review. The period table is intentionally narrow and its miss behavior is `FLAGGED`, not permissive.

## Open slices appendix

The following are deliberately deferred from ASP v1.0: in-person contact and visit classification; evaluation attribution and evaluation ledger; visit ledger and official/unofficial visit accounting; frequency caps; and multi-sport calendars. The harness emits `SLICE_NOT_IMPLEMENTED` for the relevant interaction modes and does not silently approximate them.
