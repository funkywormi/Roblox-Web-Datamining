/**
 * The walker's transition engine as a pure reducer.
 * All flow semantics live in the server-authored `transitions` map; this only interprets
 * Goto / Continue / Exit. `Continue` is async: the reducer records the step and marks loading, while
 * useWizardWalker performs the round-trip and dispatches the result.
 */

import { TransitionKind } from "../types";
import type {
  FlowAnalyticsStrings,
  FlowExitResult,
  FlowResponse,
  FlowStep,
  WalkerState,
} from "../types";

/**
 * The closed set of messages the hook sends the reducer. Distinct from a node's server-authored
 * `outcome`, which is an open string carried as a param of `ReportOutcome`.
 */
export const WalkerActionType = {
  ReportOutcome: "ReportOutcome",
  FragmentLoaded: "FragmentLoaded",
  ContinueFailed: "ContinueFailed",
  AcknowledgeError: "AcknowledgeError",
} as const;

export type WalkerAction =
  | { type: typeof WalkerActionType.ReportOutcome; outcome: string; data?: Record<string, unknown> }
  | { type: typeof WalkerActionType.FragmentLoaded; response: FlowResponse }
  | { type: typeof WalkerActionType.ContinueFailed; message?: string }
  | { type: typeof WalkerActionType.AcknowledgeError };

function appendStep(history: FlowStep[], step: FlowStep): FlowStep[] {
  return [...history, step];
}

function errorExit(state: WalkerState, history: FlowStep[], outcome?: string): WalkerState {
  return {
    ...state,
    history,
    isLoading: false,
    presentingError: false,
    exited: true,
    exitResult: { reason: "Error", flowId: state.flowId, outcome },
  };
}

// Analytic strings are combined so an additional step does not lose any strings.
function mergeAnalytics(
  previous?: FlowAnalyticsStrings,
  incoming?: FlowAnalyticsStrings,
): FlowAnalyticsStrings | undefined {
  if (incoming == null) {
    return previous;
  }
  return previous == null ? incoming : { ...previous, ...incoming };
}

/**
 * Enters a fragment (entrypoint or /continue result). Empty entry → clean "Completed" exit; an entry
 * naming an undelivered node → "Error" exit, rather than spinning forever.
 */
function enterFragment(
  response: FlowResponse,
  history: FlowStep[],
  flowId: string,
  analyticsSessionId: string,
  chosenFlow: string,
  previous?: WalkerState,
): WalkerState {
  const hasEntry = response.entry !== "";
  const entryRenderable = hasEntry && response.nodes[response.entry] != null;

  const presentingError = !hasEntry && response.outcome === "Error";
  let exitResult: FlowExitResult | undefined;
  if (!hasEntry) {
    exitResult = presentingError
      ? { reason: "Error", flowId, outcome: response.outcome }
      : { reason: "Completed", flowId };
  } else if (!entryRenderable) {
    exitResult = { reason: "Error", flowId };
  }

  return {
    flowId,
    analyticsSessionId,
    chosenFlow,
    nodes: response.nodes,
    currentNodeId: entryRenderable ? response.entry : undefined,
    history,
    // A terminal fragment omits both, so hold the last seen rather than dropping it.
    flowState: response.state ?? previous?.flowState,
    flowInputs: response.flowInputs ?? previous?.flowInputs,
    analyticsStrings: mergeAnalytics(previous?.analyticsStrings, response.analytics),
    isLoading: false,
    presentingError,
    exited: !entryRenderable && !presentingError,
    exitResult,
  };
}

export function init(response: FlowResponse): WalkerState {
  return enterFragment(
    response,
    [],
    response.flowId,
    response.analyticsSessionId ?? "",
    response.chosenFlow,
  );
}

function reduceReport(
  state: WalkerState,
  action: Extract<WalkerAction, { type: typeof WalkerActionType.ReportOutcome }>,
): WalkerState {
  const nodeId = state.currentNodeId;
  if (nodeId == null) {
    return state;
  }

  const node = state.nodes[nodeId];
  const transition = node ? node.transitions[action.outcome] : undefined;
  // Every node in a fragment belongs to that fragment's flow, so `chosenFlow` is this step's owner
  // even after a local Goto.
  const step: FlowStep = {
    flow: state.chosenFlow,
    node: nodeId,
    outcome: action.outcome,
    data: action.data,
  };
  const history = appendStep(state.history, step);

  // An outcome with no declared transition is a flow/client contract mismatch.
  if (transition == null) {
    return errorExit(state, history, action.outcome);
  }

  switch (transition.kind) {
    case TransitionKind.Goto: {
      // A Goto whose target node isn't in this fragment is malformed server data. Error-exit
      // rather than advance to an unrenderable node the host would spin on forever.
      const target = transition.node;
      if (target == null || state.nodes[target] == null) {
        return errorExit(state, history, action.outcome);
      }
      return {
        ...state,
        currentNodeId: target,
        history,
        isLoading: false,
        presentingError: false,
        exited: false,
        exitResult: undefined,
      };
    }

    case TransitionKind.Continue:
      // Position is held by `history`; useWizardWalker will fetch the next fragment.
      return {
        ...state,
        history,
        isLoading: true,
        presentingError: false,
        exited: false,
        exitResult: undefined,
      };

    case TransitionKind.Exit:
    default:
      return {
        ...state,
        history,
        isLoading: false,
        presentingError: false,
        exited: true,
        exitResult: { reason: "Completed", flowId: state.flowId, outcome: action.outcome },
      };
  }
}

function reduceFragmentLoaded(state: WalkerState, response: FlowResponse): WalkerState {
  // `chosenFlow` changes when the backend crosses into another flow; both are empty only on an exit.
  const flowId = response.flowId !== "" ? response.flowId : state.flowId;
  // Absent (server predates the field) or empty both fall back to the held id, so it survives.
  const analyticsSessionId =
    response.analyticsSessionId !== undefined && response.analyticsSessionId !== ""
      ? response.analyticsSessionId
      : state.analyticsSessionId;
  const chosenFlow = response.chosenFlow !== "" ? response.chosenFlow : state.chosenFlow;
  return enterFragment(response, state.history, flowId, analyticsSessionId, chosenFlow, state);
}

export function reduce(state: WalkerState, action: WalkerAction): WalkerState {
  switch (action.type) {
    case WalkerActionType.ReportOutcome:
      return reduceReport(state, action);
    case WalkerActionType.FragmentLoaded:
      return reduceFragmentLoaded(state, action.response);
    case WalkerActionType.ContinueFailed:
      return {
        ...state,
        isLoading: false,
        presentingError: false,
        exited: true,
        exitResult: { reason: "Error", flowId: state.flowId },
      };
    case WalkerActionType.AcknowledgeError:
      return state.presentingError ? { ...state, presentingError: false, exited: true } : state;
    default:
      return state;
  }
}
