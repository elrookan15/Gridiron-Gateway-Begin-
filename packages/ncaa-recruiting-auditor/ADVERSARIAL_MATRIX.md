# Adversarial Matrix — ASP v1.0

Six vectors are verified against the frozen extractor and period-gate invariants.

| Vector | Input | Pass invariant |
|---|---|---|
| V1 | 2026-07-10 11:00 ET; D1 FBS football; `ELECTRONIC`; outbound staff message; unsigned prospect | `PERMISSIBLE`; electronic mode is not reclassified as phone and a source direction is retained. |
| V2 | 2026-07-10 11:00 ET; D1 FBS football; `PHONE`; outbound coach call; unsigned prospect | `VIOLATION`; outbound phone does not become permissible merely because the event is otherwise a recruiting contact. |
| V3 | Same as V2, with `VERBAL_COMMITMENT` | `VIOLATION`; commitment status does not override the phone restriction. |
| V4 | 2026-07-10 11:00 ET; D1 FBS football; `PHONE`; prospect-initiated inbound call | `PERMISSIBLE`; inbound direction is not collapsed into outbound. |
| V5 | 2026-08-01 00:01 ET; D1 FBS football; `ELECTRONIC` | `FLAGGED` with `RULE_TABLE_MISS`; the frozen table has no row after the July boundary and must not invent one. |
| V6 | One instant, 2026-07-25 04:01Z, evaluated once in `America/New_York` and once in `America/Los_Angeles` | ET is `VIOLATION` while PT is `PERMISSIBLE`; the staff time zone controls local calendar matching. |

The matrix verifies direction, commitment non-overrides, explicit inbound treatment, boundary fallback, and time-zone locality without implementing the deferred visit ledger.
