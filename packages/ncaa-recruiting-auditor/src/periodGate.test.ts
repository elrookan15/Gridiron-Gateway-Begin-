import { describe, expect, it } from "vitest";
import { evaluatePeriodGate } from "./periodGate";

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
