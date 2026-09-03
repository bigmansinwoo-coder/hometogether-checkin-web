export type StepId = string;

export type CompletionOutcome = "ok" | "reported" | "urgent" | "renewal";

export type ScenarioNext =
  | { type: "step"; stepId: StepId }
  | { type: "complete"; outcome: CompletionOutcome };

export interface BotMessage {
  text: string;
}

export interface OptionAnswer {
  value: string;
  label: string;
  next: ScenarioNext;
}

export interface OptionControl {
  kind: "options";
  options: readonly OptionAnswer[];
}

export interface ScenarioStep {
  id: StepId;
  answerKey: string;
  message: BotMessage;
  control: OptionControl;
}

export interface Scenario {
  id: string;
  entry: StepId;
  steps: Record<StepId, ScenarioStep>;
  completionMessages: Record<CompletionOutcome, BotMessage>;
}

export interface ScenarioContext {
  name: string;
}

export interface TranscriptMessage {
  id: string;
  role: "bot" | "user";
  text: string;
}

export type CheckinMachineStatus = "active" | "submitting" | "completed" | "error";

export interface CheckinMachineState {
  status: CheckinMachineStatus;
  currentStepId?: StepId;
  pendingOutcome?: CompletionOutcome;
  transcript: TranscriptMessage[];
  answers: Record<string, string>;
  nextMessageId: number;
}

