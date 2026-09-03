"use client";

import { useEffect, useReducer } from "react";

import { submitCheckinAnswer, type CheckinSession } from "@/domains/checkin";

import type {
  CheckinMachineState,
  OptionAnswer,
  Scenario,
  ScenarioContext,
} from "./scenario";

interface UseCheckinMachineOptions {
  scenario: Scenario;
  session: CheckinSession;
}

type MachineAction =
  | { type: "answer"; option: OptionAnswer }
  | { type: "submit-succeeded" }
  | { type: "submit-failed" }
  | { type: "retry-submit" };

function interpolate(text: string, context: ScenarioContext) {
  return text.replaceAll("{name}", context.name);
}

function createInitialState(scenario: Scenario, context: ScenarioContext): CheckinMachineState {
  const entry = scenario.steps[scenario.entry];

  if (!entry) {
    throw new Error(`Scenario entry step not found: ${scenario.entry}`);
  }

  return {
    status: "active",
    currentStepId: entry.id,
    transcript: [
      {
        id: "message-0",
        role: "bot",
        text: interpolate(entry.message.text, context),
      },
    ],
    answers: {},
    nextMessageId: 1,
  };
}

function createMachineReducer(scenario: Scenario, context: ScenarioContext) {
  return (state: CheckinMachineState, action: MachineAction): CheckinMachineState => {
    switch (action.type) {
      case "answer": {
        if (state.status !== "active" || !state.currentStepId) return state;

        const currentStep = scenario.steps[state.currentStepId];
        if (!currentStep) return state;

        const option = currentStep.control.options.find(
          (candidate) => candidate.value === action.option.value,
        );
        if (!option) return state;

        const transcript = [
          ...state.transcript,
          {
            id: `message-${state.nextMessageId}`,
            role: "user" as const,
            text: option.label,
          },
        ];
        const answers = { ...state.answers, [currentStep.answerKey]: option.value };

        if (option.next.type === "complete") {
          return {
            ...state,
            status: "submitting",
            currentStepId: undefined,
            pendingOutcome: option.next.outcome,
            transcript,
            answers,
            nextMessageId: state.nextMessageId + 1,
          };
        }

        const nextStep = scenario.steps[option.next.stepId];
        if (!nextStep) {
          throw new Error(`Scenario step not found: ${option.next.stepId}`);
        }

        return {
          ...state,
          currentStepId: nextStep.id,
          transcript: [
            ...transcript,
            {
              id: `message-${state.nextMessageId + 1}`,
              role: "bot",
              text: interpolate(nextStep.message.text, context),
            },
          ],
          answers,
          nextMessageId: state.nextMessageId + 2,
        };
      }
      case "submit-succeeded": {
        if (state.status !== "submitting" || !state.pendingOutcome) return state;

        const completionMessage = scenario.completionMessages[state.pendingOutcome];
        return {
          ...state,
          status: "completed",
          transcript: [
            ...state.transcript,
            {
              id: `message-${state.nextMessageId}`,
              role: "bot",
              text: interpolate(completionMessage.text, context),
            },
          ],
          nextMessageId: state.nextMessageId + 1,
        };
      }
      case "submit-failed":
        if (state.status !== "submitting") return state;
        return { ...state, status: "error" };
      case "retry-submit":
        if (state.status !== "error") return state;
        return { ...state, status: "submitting" };
    }
  };
}

export function useCheckinMachine({ scenario, session }: UseCheckinMachineOptions) {
  const context: ScenarioContext = { name: session.displayName ?? "입주자" };
  const [state, dispatch] = useReducer(
    createMachineReducer(scenario, context),
    undefined,
    () => createInitialState(scenario, context),
  );

  useEffect(() => {
    if (state.status !== "submitting" || !state.pendingOutcome) return;

    let isCurrent = true;

    void submitCheckinAnswer({
      schemaVersion: 1,
      sessionId: session.id,
      idempotencyKey: `${session.id}:${scenario.id}:v1`,
      answers: state.answers,
    })
      .then(() => {
        if (isCurrent) dispatch({ type: "submit-succeeded" });
      })
      .catch(() => {
        if (isCurrent) dispatch({ type: "submit-failed" });
      });

    return () => {
      isCurrent = false;
    };
  }, [scenario.id, session.id, state.answers, state.pendingOutcome, state.status]);

  const currentStep = state.currentStepId
    ? scenario.steps[state.currentStepId]
    : undefined;

  return {
    state,
    currentStep,
    selectOption: (option: OptionAnswer) => dispatch({ type: "answer", option }),
    retrySubmit: () => dispatch({ type: "retry-submit" }),
  };
}

