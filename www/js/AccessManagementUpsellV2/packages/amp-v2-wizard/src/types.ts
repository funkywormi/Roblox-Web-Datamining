/**
 * Wire types mirroring amp-v2-wizard-service's `FlowResponse` and request models. The client never
 * interprets flow logic: it renders the component named by `FlowNode.type` and follows `transitions`.
 */

import type { ReactElement } from "react";

/** String-serialized form of the backend `TransitionKind` enum. */
export const TransitionKind = {
  Goto: "Goto",
  Continue: "Continue",
  Exit: "Exit",
} as const;

export type TransitionKind = (typeof TransitionKind)[keyof typeof TransitionKind];

export type Transition = {
  kind: TransitionKind;
  /** Target node id; set only for `Goto`. */
  node?: string;
};

/** One flow node: the component to render (`type`), its props (`details`), and where each outcome leads. */
export type FlowNode = {
  /** Component discriminator (e.g. "TextScreen"); matches a registry key and the backend node type. */
  type: string;
  /** Untyped server-authored props, passed to the node component verbatim. */
  details: Record<string, unknown>;
  /** Outcome key → transition the walker takes. */
  transitions: Record<string, Transition>;
};

/**
 * Backend-resolved entry inputs for the flows on the stack, keyed by flow name. Opaque to the client.
 * Superseded by `FlowState`, but still read and echoed until that backend ships.
 */
export type FlowInputs = Record<string, Record<string, unknown>>;

/**
 * Server-owned run state, kept opaque on the client: stored verbatim from a fragment and echoed on
 * the next /continue. The shape is the backend's alone — nothing here reads into it.
 */
export type FlowState = Record<string, unknown>;

/**
 * A fragment of the flow graph, returned by both /entrypoint and /continue. An empty `entry` means
 * nothing to render (granted / denied / no upsell).
 */
export type FlowResponse = {
  /** The flow owning this fragment; stamped onto every step reported from it. */
  chosenFlow: string;
  /** A correlation tag, not a server-state handle: minted on /entrypoint, echoed on /continue. */
  flowId: string;
  /** Id of the first node to render. */
  entry: string;
  nodes: Record<string, FlowNode>;
  /** Omitted when the run has nothing left to resume. */
  state?: FlowState;
  /** Server-resolved strings for the client's own events. */
  analytics?: FlowAnalyticsStrings;
  /** Superseded by `state`; read until that backend ships. */
  flowInputs?: FlowInputs;
};

/** One history entry. The stateless backend reconstructs flow position from the ordered list of these. */
export type FlowStep = {
  /** The flow that owned this node; the backend resumes from the last step's. */
  flow: string;
  node: string;
  outcome: string;
  /** Optional data the component attached to the outcome; rides into the /continue payload. */
  data?: Record<string, unknown>;
};

/** An AMP `Value`, protojson-serialized by the backend and kept opaque on the client. */
export type AmpValue = Record<string, unknown>;

/** The AMP feature (and desired value) an upsell targets, e.g. CanPlayGame -> true. */
export type Target = {
  namespace: string;
  feature: string;
  targetValue?: AmpValue;
  /** Inputs for the AMP feature evaluation, distinct from wizard extraProps/payload. */
  extraParameters?: Record<string, AmpValue>;
};

/** Selects a flow by name (e.g. "AgeCheck") with props, instead of deriving one from a target. */
export type FlowSelector = {
  name: string;
  props?: Record<string, unknown>;
};

/** The node types this client can render; the backend only emits nodes in this set. */
export type ClientInfo = {
  clientCapabilities: string[];
};

/** A caller provides either `target` or `flow`, not both. */
export type FlowEntrypointRequest = {
  target?: Target;
  flow?: FlowSelector;
  surface: string;
  client: ClientInfo;
  extraProps?: Record<string, unknown>;
};

export type FlowContinueRequest = {
  flowId: string;
  /** The state from the last fragment, echoed unmodified. */
  state?: FlowState;
  /**
   * `target`, `rootFlow` and `flowInputs` are what `state` replaces. They are still sent so the
   * currently deployed backend, which does not read `state`, keeps working; drop them once it does.
   */
  target?: Target;
  /** The caller's `FlowSelector.name`; unset for a target-derived entry, where the root comes from `target`. */
  rootFlow?: string;
  flowInputs?: FlowInputs;
  history: FlowStep[];
  payload?: Record<string, unknown>;
};

/** The two-call API the walker depends on; injected so tests and the demo can supply a mock. */
export type FlowApi = {
  entrypoint: (request: FlowEntrypointRequest) => Promise<FlowResponse>;
  continue: (request: FlowContinueRequest) => Promise<FlowResponse>;
};

/**
 * The correlation fields on every wizard event. Built from live walker state, so it tracks the flow
 * across a Continue that crosses into a subflow.
 */
export type WizardEventContext = {
  flowId: string;
  chosenFlow: string;
  rootFlow?: string;
  surface: string;
  node?: string;
  nodeType?: string;
};

/** Params for a wizard event; the transport drops the non-scalars eventstream can't carry. */
export type EventParams = Record<string, unknown>;

/** The transport the walker emits through; declared here so `LogEventFn` needn't import analytics. */
export type SendEventFn = (eventName: string, params: EventParams) => void;

/** Emits a wizard event with the current `WizardEventContext` merged in. */
export type LogEventFn = (eventName: string, extra?: EventParams) => void;

/**
 * Strings for analytics that the server resolves.
 */
export type FlowAnalyticsStrings = Record<string, string>;

/**
 * Per-node metadata for event/metric correlation, plus host-supplied `config` for client-specific
 * wiring the server doesn't own (e.g. a route a node navigates to).
 */
export type NodeContext = {
  config: Record<string, unknown>;
  analytics: WizardEventContext;
  logEvent: LogEventFn;
  analyticsStrings?: FlowAnalyticsStrings;
};

/** Reports a node's outcome (a transition-map key like "Success"); `data` is forwarded to /continue. */
export type ReportFn = (outcome: string, data?: Record<string, unknown>) => void;

export type NodeProps = {
  /** The server-authored `FlowNode.details`. */
  props: Record<string, unknown>;
  ctx: NodeContext;
  report: ReportFn;
  /**
   * The current node's transition map, so a node can offer an affordance only when the server
   * declares an outcome for it (e.g. a Back chevron only when a `Back` transition exists).
   */
  transitions?: Record<string, Transition>;
};

export type FlowExitReason = "Completed" | "Cancelled" | "Error";

export type FlowExitResult = {
  reason: FlowExitReason;
  flowId: string;
  /** The last outcome reported before exit, when applicable. */
  outcome?: string;
};

/** Tree-local walker state, driven by the reducer (see useWizardWalker). */
export type WalkerState = {
  flowId: string;
  chosenFlow: string;
  nodes: Record<string, FlowNode>;
  currentNodeId?: string;
  history: FlowStep[];
  /** Latest state seen from a fragment, held to echo on the next /continue. */
  flowState?: FlowState;
  /** Superseded by `flowState`; held until that backend ships. */
  flowInputs?: FlowInputs;
  analyticsStrings?: FlowAnalyticsStrings;
  isLoading: boolean;
  exited: boolean;
  exitResult?: FlowExitResult;
};

export type NodeComponent = ((props: NodeProps) => ReactElement | null) & {
  /** Set when the node renders its own loading state, so the host does not add a second one. */
  ownsLoadingState?: boolean;
  /**
   * Set when the node hands off to an overlay of its own, mounted outside the wizard's dialog.
   */
  ownsOverlay?: boolean;
  /**
   * Set when the node treats dismissing the wizard's dialog as a `Cancel` outcome: the host draws
   * the close affordance for it, but only when the server declares a `Cancel` transition.
   */
  dismissesOnCancel?: boolean;
};

/** Maps a server node `type` discriminator to the component that renders it. */
export type Registry = Record<string, NodeComponent>;
