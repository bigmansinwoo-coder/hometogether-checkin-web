export type PersonaType = "guest" | "host";

export type RoundType =
  | "onboarding-d7"
  | "monthly"
  | "monthly-first"
  | "monthly-renewal"
  | "event";

export type EventContext =
  | { type: "facility"; itemName: string }
  | { type: "rule" };

export interface CheckinSession {
  id: string;
  personaType: PersonaType;
  roundType: RoundType;
  displayName?: string;
  eventContext?: EventContext;
}

export type ResolveCheckinSessionResult =
  | { status: "active"; session: CheckinSession }
  | { status: "completed" }
  | { status: "expired" }
  | { status: "invalid" }
  | { status: "error" };

export interface CheckinSubmission {
  schemaVersion: 1;
  sessionId: string;
  idempotencyKey: string;
  answers: Record<string, unknown>;
}
