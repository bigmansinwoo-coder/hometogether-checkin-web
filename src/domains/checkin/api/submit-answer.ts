import type { CheckinSubmission } from "../model";
import { assertCheckinSubmission } from "../model";

const submittedKeys = new Set<string>();

export interface SubmitAnswerResult {
  status: "accepted" | "duplicate";
}

export async function submitCheckinAnswer(
  submission: CheckinSubmission,
): Promise<SubmitAnswerResult> {
  assertCheckinSubmission(submission);
  if (submittedKeys.has(submission.idempotencyKey)) return { status: "duplicate" };
  submittedKeys.add(submission.idempotencyKey);
  return { status: "accepted" };
}
