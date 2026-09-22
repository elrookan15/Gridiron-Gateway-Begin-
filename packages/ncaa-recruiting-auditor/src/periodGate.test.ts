import { describe, expect, it } from "vitest";
import { evaluatePeriodGate } from "./periodGate";
import { auditComplianceBatch } from "./auditComplianceBatch";
import {
  assembleComplianceEnvelope,
  parseOffsetBearingTimestamp,
  type EnrichedComplianceBatch,
} from "./sessionEnvelope";

const base = {
  sport: "FOOTBALL",
  division: "FBS",
  interactionMode: "ELECTRONIC" as const,
  staffTimezone: "America/New_York",
};

describe("D1 FBS football July 10 trap vectors", () => {
  it("permits electronic communication", () => {
    expect(evaluatePeriodGate({ ...base, occurredAt: "2026-07-10T15:00:00Z" }).status).toBe("PERMISSIBLE");
  });

  it("rejects an outbound phone call", () => {
    expect(evaluatePeriodGate({ ...base, occurredAt: "2026-07-10T15:00:00Z", interactionMode: "PHONE", direction: "OUTBOUND" }).status).toBe("VIOLATION");
  });

  it("does not let a verbal commitment permit the phone call", () => {
    expect(evaluatePeriodGate({ ...base, occurredAt: "2026-07-10T15:00:00Z", interactionMode: "PHONE", direction: "OUTBOUND", signingStatus: "VERBAL_COMMITMENT" }).status).toBe("VIOLATION");
  });

  it("permits a prospect-initiated inbound phone call", () => {
    expect(evaluatePeriodGate({ ...base, occurredAt: "2026-07-10T15:00:00Z", interactionMode: "PHONE", direction: "INBOUND" }).status).toBe("PERMISSIBLE");
  });

  it("flags August 1 at 00:01 ET as a rule-table miss", () => {
    const result = evaluatePeriodGate({ ...base, occurredAt: "2026-08-01T04:01:00Z" });
    expect(result.status).toBe("FLAGGED");
    expect(result.fallback).toBe("RULE_TABLE_MISS");
  });

  it("uses staff timezone, splitting the same instant between PT and ET", () => {
    const instant = "2026-07-25T04:01:00Z";
    const et = evaluatePeriodGate({ ...base, occurredAt: instant, staffTimezone: "America/New_York" });
    const pt = evaluatePeriodGate({ ...base, occurredAt: instant, staffTimezone: "America/Los_Angeles" });
    expect(et.status).toBe("VIOLATION");
    expect(pt.status).toBe("PERMISSIBLE");
  });
});

describe("fail-closed guards (CodeRabbit majors)", () => {
  it("flags missing staffTimezone instead of defaulting to UTC", () => {
    const result = evaluatePeriodGate({
      sport: "FOOTBALL",
      division: "FBS",
      interactionMode: "ELECTRONIC",
      occurredAt: "2026-07-10T15:00:00Z",
    });
    expect(result.status).toBe("FLAGGED");
    expect(result.fallback).toBe("RULE_TABLE_MISS");
    expect(result.reason).toMatch(/timezone/i);
  });

  it("flags non-2026 local year as RULE_TABLE_MISS (frozen table year scope)", () => {
    const result = evaluatePeriodGate({
      ...base,
      occurredAt: "2025-07-10T15:00:00Z",
    });
    expect(result.status).toBe("FLAGGED");
    expect(result.fallback).toBe("RULE_TABLE_MISS");
  });

  it("rejects offset-free timestamp_text enrichment", () => {
    expect(parseOffsetBearingTimestamp("2026-07-25T00:30:00")).toBeNull();
    expect(parseOffsetBearingTimestamp("2026-07-10")).toBeNull();
    expect(parseOffsetBearingTimestamp("2026-07-10T15:00:00Z")).toBe("2026-07-10T15:00:00.000Z");
  });

  it("never CLEARs an event that only has HALT prospects", () => {
    const batch: EnrichedComplianceBatch = {
      session: {
        occurred_at: "2026-07-10T15:00:00.000Z",
        sport: "FOOTBALL",
        division: "FBS",
        staff_timezone: "America/New_York",
      },
      events: [
        {
          event_id: "11111111-1111-4111-8111-111111111111",
          temp_event_id: "t1",
          interaction_mode: "ELECTRONIC",
          occurred_at: "2026-07-10T15:00:00.000Z",
          timestamp_text: "2026-07-10T15:00:00Z",
          location: "UNKNOWN",
          calendar: "D1_FBS_FOOTBALL_2026",
          prospects: [{ status: "HALT", reason: "HALT_INSUFFICIENT_DATA" }],
        },
      ],
    };
    const result = auditComplianceBatch(batch);
    expect(result.status).toBe("FLAGGED");
    expect(result.findings.some((f) => f.code === "EXTRACTOR_HALT")).toBe(true);
  });

  it("flags unimplemented sport/division with SLICE_NOT_IMPLEMENTED", () => {
    const batch: EnrichedComplianceBatch = {
      session: {
        occurred_at: "2026-07-10T15:00:00.000Z",
        sport: "FOOTBALL",
        division: "FCS",
        staff_timezone: "America/New_York",
      },
      events: [
        {
          event_id: "22222222-2222-4222-8222-222222222222",
          temp_event_id: "t2",
          interaction_mode: "ELECTRONIC",
          occurred_at: "2026-07-10T15:00:00.000Z",
          timestamp_text: "2026-07-10T15:00:00Z",
          location: "UNKNOWN",
          calendar: "D1_FCS_FOOTBALL_2026",
          prospects: [
            {
              status: "READY",
              prospect_id: "p1",
              initiator: "UNKNOWN",
              interaction_initiator: "UNKNOWN",
              evaluation_initiator: "UNKNOWN",
              visit_class: "UNSPECIFIED",
            },
          ],
        },
      ],
    };
    const result = auditComplianceBatch(batch);
    expect(result.status).toBe("FLAGGED");
    expect(result.findings.some((f) => f.code === "SLICE_NOT_IMPLEMENTED")).toBe(true);
  });

  it("preserves booster metadata through assembleComplianceEnvelope", () => {
    const envelope = assembleComplianceEnvelope(
      {
        events: [
          {
            temp_event_id: "t3",
            interaction_mode: "ELECTRONIC",
            timestamp_text: "July note",
            location: "UNKNOWN",
            booster: true,
            direction: "OUTBOUND",
            prospects: [
              { node_type: "PROSPECT", prospect_id: "p2", name: "A" },
            ],
          },
        ],
      },
      {
        occurred_at: "2026-07-10T15:00:00.000Z",
        sport: "FOOTBALL",
        division: "FBS",
        staff_timezone: "America/New_York",
      },
    );
    expect(envelope.events[0]?.occurred_at).toBe("2026-07-10T15:00:00.000Z");
    expect(envelope.events[0]?.booster).toBe(true);
    const audited = auditComplianceBatch(envelope);
    expect(audited.findings.some((f) => f.code === "BOOSTER")).toBe(true);
  });

  it("rejects invalid location enum at the raw boundary", () => {
    expect(() =>
      assembleComplianceEnvelope(
        {
          events: [
            {
              temp_event_id: "t4",
              interaction_mode: "ELECTRONIC",
              timestamp_text: "2026-07-10T15:00:00Z",
              location: "HOME",
              prospects: [],
            },
          ],
        },
        {
          occurred_at: "2026-07-10T15:00:00.000Z",
          sport: "FOOTBALL",
          division: "FBS",
          staff_timezone: "America/New_York",
        },
      ),
    ).toThrow();
  });
});
