import { randomUUID } from "node:crypto";
import { z } from "zod";

export const InteractionModeSchema = z.enum([
  "PHONE",
  "ELECTRONIC",
  "IN_PERSON_ON_CAMPUS",
  "IN_PERSON_OFF_CAMPUS",
  "EVALUATION",
]);
export type InteractionMode = z.infer<typeof InteractionModeSchema>;

export const LocationSchema = z.enum([
  "ON_CAMPUS",
  "OFF_CAMPUS",
  "PROSPECT_HOME",
  "COACHING_EVENT",
  "UNKNOWN",
]);
export type Location = z.infer<typeof LocationSchema>;

export const InitiatorSchema = z.enum(["INITIATOR", "PASSIVE", "UNKNOWN"]);
export type Initiator = z.infer<typeof InitiatorSchema>;
export const EvaluationInitiatorSchema = z.enum([
  "COACH",
  "NON_COACHING_STAFF",
  "PROSPECT",
  "UNKNOWN",
]);
export type EvaluationInitiator = z.infer<typeof EvaluationInitiatorSchema>;
export const VisitClassSchema = z.enum([
  "OFFICIAL",
  "UNOFFICIAL",
  "UNSPECIFIED",
]);

const SportSchema = z.enum(["FOOTBALL", "BASKETBALL", "BASEBALL", "SOCCER", "LACROSSE"]);
const DivisionSchema = z.enum(["FBS", "FCS", "D1", "D2", "D3"]);

export const SessionContextSchema = z
  .object({
    occurred_at: z.string().datetime({ offset: true }),
    sport: SportSchema,
    division: DivisionSchema,
    staff_timezone: z.string().min(1),
    session_id: z.string().min(1).optional(),
  })
  .superRefine((value, ctx) => {
    const valid =
      (value.sport === "FOOTBALL" && (value.division === "FBS" || value.division === "FCS")) ||
      (value.sport !== "FOOTBALL" && value.division === "D1");
    if (!valid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["division"],
        message: "sport×division is not a supported ASP combination",
      });
    }
  });
export type SessionContext = z.infer<typeof SessionContextSchema>;

const BaseProspectSchema = z.object({
  prospect_id: z.string().min(1),
  name: z.string().min(1).optional(),
  initiator: InitiatorSchema.optional(),
  interaction_initiator: InitiatorSchema.optional(),
  evaluation_initiator: EvaluationInitiatorSchema.or(z.string()).optional(),
  visit_class: VisitClassSchema.or(z.string()).optional(),
  commitment_status: z.enum(["UNSIGNED", "VERBAL_COMMITMENT", "SIGNED", "ENROLLED"]).optional(),
  notes: z.string().optional(),
}).passthrough();

export const ProspectReadySchema = BaseProspectSchema.extend({
  status: z.literal("READY"),
});
export type ProspectReady = z.infer<typeof ProspectReadySchema>;
export const ProspectHaltSchema = z.object({
  status: z.literal("HALT"),
  prospect_id: z.string().min(1).optional(),
  reason: z.string().min(1),
}).passthrough();
export type ProspectHalt = z.infer<typeof ProspectHaltSchema>;

const RawProspectReadySchema = z
  .object({
    node_type: z.literal("PROSPECT"),
    prospect_id: z.string().min(1),
    name: z.string().optional(),
    initiator: z.string().optional(),
    interaction_initiator: z.string().optional(),
    evaluation_initiator: z.string().optional(),
    visit_class: z.string().optional(),
    commitment_status: z.string().optional(),
    notes: z.string().optional(),
  })
  .passthrough();
const RawProspectHaltSchema = z
  .object({
    node_type: z.literal("HALT"),
    prospect_id: z.string().optional(),
    reason: z.string().min(1),
  })
  .passthrough();
export const RawProspectNodeSchema = z.discriminatedUnion("node_type", [
  RawProspectReadySchema,
  RawProspectHaltSchema,
]);

export const RawExtractorEventSchema = z
  .object({
    temp_event_id: z.string().min(1),
    interaction_mode: InteractionModeSchema,
    timestamp_text: z.string().min(1),
    location: z.string().min(1),
    prospects: z.array(RawProspectNodeSchema),
  })
  .passthrough();
export const RawExtractorOutputSchema = z.object({
  events: z.array(RawExtractorEventSchema),
});
export type RawExtractorOutput = z.infer<typeof RawExtractorOutputSchema>;

export const EnrichedComplianceEventSchema = z.object({
  event_id: z.string().uuid(),
  temp_event_id: z.string().min(1),
  interaction_mode: InteractionModeSchema,
  occurred_at: z.string().datetime({ offset: true }),
  timestamp_text: z.string().min(1),
  location: z.string().min(1),
  calendar: z.string().nullable(),
  prospects: z.array(z.union([ProspectReadySchema, ProspectHaltSchema])),
}).passthrough();
export const EnrichedComplianceBatchSchema = z.object({
  session: SessionContextSchema,
  events: z.array(EnrichedComplianceEventSchema),
});
export type EnrichedComplianceEvent = z.infer<typeof EnrichedComplianceEventSchema>;
export type EnrichedComplianceBatch = z.infer<typeof EnrichedComplianceBatchSchema>;

/** Resolve the frozen calendar key without silently guessing on unsupported sport/division. */
export function calendarResolver(
  occurredAt: string | Date,
  sport: SessionContext["sport"],
  division: SessionContext["division"],
): string | null {
  const date = occurredAt instanceof Date ? occurredAt : new Date(occurredAt);
  if (Number.isNaN(date.getTime())) return null;
  if (sport === "FOOTBALL" && division === "FBS") return "D1_FBS_FOOTBALL_2026";
  if (sport === "FOOTBALL" && division === "FCS") return "D1_FCS_FOOTBALL_2026";
  if (division === "D1") return `D1_${sport}_2026`;
  return null;
}

function asInitiator(value: unknown): Initiator {
  // A raw INITIATOR label is never self-authenticating at the prospect node.
  // Keep explicit inbound evidence, but demote outbound labels until the
  // event-level directional lexicon has independently established them.
  return value === "PASSIVE" ? "PASSIVE" : "UNKNOWN";
}
function asEvaluationInitiator(value: unknown): EvaluationInitiator {
  return value === "COACH" || value === "NON_COACHING_STAFF" || value === "PROSPECT"
    ? value
    : "UNKNOWN";
}

/** Apply only loss-making normalization; the extractor may never gain a stronger claim here. */
export function normalizeProspect(
  input: Record<string, unknown>,
  interactionMode?: InteractionMode,
): ProspectReady | ProspectHalt {
  if (input.status === "HALT" || input.node_type === "HALT") {
    return ProspectHaltSchema.parse({
      ...input,
      status: "HALT",
      reason: typeof input.reason === "string" && input.reason ? input.reason : "extractor halt",
    });
  }
  const mode = interactionMode ?? (input.interaction_mode as InteractionMode | undefined);
  const sourceInitiator = input.interaction_initiator ?? input.initiator ?? input.INITIATOR;
  const normalizedInitiator = asInitiator(sourceInitiator);
  const normalizedVisit = mode === "IN_PERSON_ON_CAMPUS"
    ? "UNSPECIFIED"
    : (typeof input.visit_class === "string" && ["OFFICIAL", "UNOFFICIAL", "UNSPECIFIED"].includes(input.visit_class)
      ? input.visit_class
      : "UNSPECIFIED");
  const normalized = {
    ...input,
    status: "READY" as const,
    prospect_id: String(input.prospect_id ?? ""),
    initiator: normalizedInitiator,
    interaction_initiator: normalizedInitiator,
    evaluation_initiator: asEvaluationInitiator(input.evaluation_initiator ?? input.eval_initiator),
    visit_class: normalizedVisit,
  };
  return ProspectReadySchema.parse(normalized);
}

export function assembleComplianceEnvelope(
  rawOutput: unknown,
  sessionContext: unknown,
): EnrichedComplianceBatch {
  // This parse is intentional and mandatory: no raw extractor object bypasses validation.
  const raw = RawExtractorOutputSchema.parse(rawOutput);
  const session = SessionContextSchema.parse(sessionContext);
  const events = raw.events.map((event) => {
    const occurredAt = new Date(event.timestamp_text);
    const occurred_at = Number.isNaN(occurredAt.getTime())
      ? session.occurred_at
      : occurredAt.toISOString();
    const prospects = event.prospects.map((prospect) => normalizeProspect({
      ...prospect,
      interaction_mode: event.interaction_mode,
    }));
    return EnrichedComplianceEventSchema.parse({
      event_id: randomUUID(),
      temp_event_id: event.temp_event_id,
      interaction_mode: event.interaction_mode,
      occurred_at,
      timestamp_text: event.timestamp_text,
      location: event.location,
      calendar: calendarResolver(occurred_at, session.sport, session.division),
      prospects,
    });
  });
  return EnrichedComplianceBatchSchema.parse({ session, events });
}
