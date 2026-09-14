/**
 * The walker engine hook: wraps the pure `walkerReducer` with the side effects it can't own — the
 * /continue round-trip, event emission, and the exit callback.
 *
 * Telemetry lives here rather than in a host because the hosts diverge across clients while this file
 * is a 1:1 mirror of the Lua walker, keeping the funnel identical by construction. Contract in
 * wizardEventNames.
 */

import { useCallback, useEffect, useReducer, useRef } from "react";

import { init, reduce, WalkerActionType } from "./walkerReducer";
import { sendWizardEvent } from "../analytics/wizardAnalytics";
import { WizardEventName } from "../analytics/wizardEventNames";
import { TransitionKind } from "../types";
import type {
  FlowAnalyticsStrings,
  FlowApi,
  FlowExitResult,
  FlowNode,
  FlowResponse,
  FlowStep,
  LogEventFn,
  ReportFn,
  SendEventFn,
  Target,
  WalkerState,
  WizardEventContext,
} from "../types";

/** A reported outcome, for callers that observe outcomes directly alongside the framework's events. */
export type WalkerEvent = {
  flowId: string;
  node: string;
  outcome: string;
  transitionKind?: TransitionKind;
};

export type UseWizardWalkerOptions = {
  initialFragment: FlowResponse;
  surface: string;
  target?: Target;
  rootFlow?: string;
  api: FlowApi;
  onExit?: (result: FlowExitResult) => void;
  onEvent?: (event: WalkerEvent) => void;
  /** Injectable for tests; defaults to the real eventstream. */
  sendEvent?: SendEventFn;
};

export type WizardWalker = {
  currentNode?: FlowNode;
  currentNodeId?: string;
  isLoading: boolean;
  exited: boolean;
  analyticsStrings?: FlowAnalyticsStrings;
  report: ReportFn;
  eventContext: WizardEventContext;
  logEvent: LogEventFn;
};

/** Taken from a state snapshot, so the same position always produces the same params. */
function buildEventContext(
  state: WalkerState,
  surface: string,
  rootFlow?: string,
): WizardEventContext {
  const nodeId = state.currentNodeId;
  const node = nodeId != null ? state.nodes[nodeId] : undefined;
  return {
    flowId: state.flowId,
    chosenFlow: state.chosenFlow,
    rootFlow,
    surface,
    node: nodeId,
    nodeType: node?.type,
  };
}

export function useWizardWalker(options: UseWizardWalkerOptions): WizardWalker {
  const { api, target, rootFlow, surface, onExit, onEvent } = options;
  const sendEvent = options.sendEvent ?? sendWizardEvent;

  const [state, dispatch] = useReducer(reduce, options.initialFragment, init);

  // Keep the latest state readable from async callbacks without re-subscribing them.
  const stateRef = useRef(state);
  stateRef.current = state;

  // Set synchronously when a Continue starts, before `isLoading` commits, to block a same-tick
  // double report (e.g. a rapid double-tap) from firing /continue twice.
  const continueInFlightRef = useRef(false);

  const currentNode: FlowNode | undefined = state.currentNodeId
    ? state.nodes[state.currentNodeId]
    : undefined;

  const eventContext = buildEventContext(state, surface, rootFlow);

  // Reads `stateRef` rather than closing over the context, so a node isn't handed a new callback on
  // every step while position stays live.
  const logEvent: LogEventFn = useCallback(
    (eventName, extra) => {
      sendEvent(eventName, { ...buildEventContext(stateRef.current, surface, rootFlow), ...extra });
    },
    [sendEvent, surface, rootFlow],
  );

  const flowStartFiredRef = useRef(false);
  useEffect(() => {
    if (flowStartFiredRef.current || stateRef.current.currentNodeId == null) {
      return;
    }
    flowStartFiredRef.current = true;
    logEvent(WizardEventName.FlowStart);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only: a flow starts once
  }, []);

  // Keyed on the node's identity within its flow, so a retry loop re-entering the same node is one
  // event, while a cross-flow hop into a same-named node is still its own.
  useEffect(() => {
    if (state.currentNodeId == null) {
      return;
    }
    logEvent(WizardEventName.NodeShown);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one emission per node arrival; see above
  }, [state.currentNodeId, state.chosenFlow]);

  // Fire onExit exactly once when the walker reaches an exited state.
  const { exited, exitResult } = state;
  const exitFiredRef = useRef(false);
  useEffect(() => {
    if (!exited || exitFiredRef.current) {
      return;
    }
    exitFiredRef.current = true;

    if (exitResult == null) {
      return;
    }
    // Paired with FlowStart, so exits can't outnumber starts.
    if (flowStartFiredRef.current) {
      logEvent(WizardEventName.FlowExit, {
        reason: exitResult.reason,
        outcome: exitResult.outcome,
      });
    }
    if (onExit) {
      onExit(exitResult);
    }
  }, [exited, exitResult, onExit, logEvent]);

  const report: ReportFn = useCallback(
    (outcome: string, data?: Record<string, unknown>) => {
      const { current } = stateRef;
      const nodeId = current.currentNodeId;
      if (nodeId == null || current.exited || current.isLoading || continueInFlightRef.current) {
        return;
      }

      const transition = current.nodes[nodeId]?.transitions[outcome];
      const base = buildEventContext(current, surface, rootFlow);

      sendEvent(WizardEventName.NodeOutcome, {
        ...base,
        outcome,
        transitionKind: transition?.kind,
      });

      if (onEvent) {
        onEvent({
          flowId: current.flowId,
          node: nodeId,
          outcome,
          transitionKind: transition?.kind,
        });
      }

      dispatch({ type: WalkerActionType.ReportOutcome, outcome, data });

      if (transition?.kind === TransitionKind.Continue) {
        continueInFlightRef.current = true;
        // History after this step is what the stateless backend needs to resume.
        const nextHistory: FlowStep[] = [
          ...current.history,
          { flow: current.chosenFlow, node: nodeId, outcome, data },
        ];

        api
          .continue({
            flowId: current.flowId,
            state: current.flowState,
            // Sent alongside `state` until the backend that reads it is deployed.
            target,
            rootFlow,
            flowInputs: current.flowInputs,
            history: nextHistory,
            payload: data,
          })
          .then(response => {
            continueInFlightRef.current = false;
            dispatch({ type: WalkerActionType.FragmentLoaded, response });
          })
          .catch((err: unknown) => {
            continueInFlightRef.current = false;
            sendEvent(WizardEventName.ContinueFailed, { ...base, errorMessage: String(err) });
            dispatch({ type: WalkerActionType.ContinueFailed, message: String(err) });
          });
      }
    },
    [api, target, rootFlow, surface, onEvent, sendEvent],
  );

  return {
    currentNode,
    currentNodeId: state.currentNodeId,
    isLoading: state.isLoading,
    exited,
    analyticsStrings: state.analyticsStrings,
    report,
    eventContext,
    logEvent,
  };
}
