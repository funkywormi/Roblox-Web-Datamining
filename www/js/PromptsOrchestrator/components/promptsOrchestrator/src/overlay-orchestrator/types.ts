import "@rbx/core-scripts/global";

import type { ClientAttributes, PromptEntry } from "../common/types/promptTypes";
import type { AppPage } from "../common/constants/pageConstants";

export const OverlayClosedReason = {
  Success: "success",
  Failed: "failed",
  Error: "error",
  Completed: "completed",
  Dismissed: "dismissed",
  Navigation: "navigation",
} as const;
export type OverlayClosedReason = (typeof OverlayClosedReason)[keyof typeof OverlayClosedReason];

export const OverlayNotOpenedReason = {
  Duplicate: "duplicate",
  RendererUnavailable: "rendererUnavailable",
  InvalidPrompt: "invalidPrompt",
  Navigation: "navigation",
} as const;

export type OverlayNotOpenedReason =
  (typeof OverlayNotOpenedReason)[keyof typeof OverlayNotOpenedReason];

export const OverlayRenderer = {
  DialogPrompt: "dialog-prompt",
  FaeUpsell: "fae-upsell",
} as const;

export type OverlayRenderer = (typeof OverlayRenderer)[keyof typeof OverlayRenderer];

export const sduiOverlayRenderers = [OverlayRenderer.DialogPrompt] as const;

export type SduiOverlayRenderer = (typeof sduiOverlayRenderers)[number];

type ClosedOutcomeWithoutError<
  Reason extends Exclude<OverlayClosedReason, typeof OverlayClosedReason.Error>,
> = {
  status: "closed";
  reason: Reason;
  error?: never;
};

type ClosedOutcomeWithError = {
  status: "closed";
  reason: typeof OverlayClosedReason.Error;
  error: unknown;
};

type NotOpenedOutcome = {
  status: "not-opened";
  reason: OverlayNotOpenedReason;
  error?: never;
};

export type DedupePolicy = "in-flight" | "session";

export type BaseOverlayPrompt = {
  id: string;
  dedupeKey: string;
  dedupePolicy: DedupePolicy;
  triggerType: "action" | "prompts-service";
};

/**
 * A callback invoked with one renderer-specific terminal outcome.
 *
 * @typeParam Outcome - The outcome union accepted by the callback.
 */
type OnTerminalFunction<Outcome> = (outcome: Outcome) => void;

type DialogOutcome =
  | ClosedOutcomeWithoutError<"completed" | "dismissed" | "navigation">
  | NotOpenedOutcome;

export type SduiPromptPayload = {
  promptEntry: PromptEntry;
  configKey: string;
  appPage: AppPage;
  clientAttributes?: ClientAttributes;
};

type DialogPromptPayload = SduiPromptPayload;

type FaeOutcome =
  | ClosedOutcomeWithoutError<"success" | "failed" | "navigation">
  | ClosedOutcomeWithError
  | NotOpenedOutcome;

type AccessManagementUpsellV2Service = NonNullable<
  typeof window.Roblox.AccessManagementUpsellV2Service
>;

type FaeUpsellPayload = {
  params: Parameters<AccessManagementUpsellV2Service["startAccessManagementUpsell"]>[0];
  appPage?: AppPage;
};

type OverlayRendererContract = {
  [OverlayRenderer.DialogPrompt]: {
    payload: DialogPromptPayload;
    outcome: DialogOutcome;
  };
  [OverlayRenderer.FaeUpsell]: {
    payload: FaeUpsellPayload;
    outcome: FaeOutcome;
  };
};

/**
 * Selects every terminal outcome declared by a renderer's contract.
 *
 * @typeParam Renderer - The renderer whose terminal outcome should be selected.
 */
export type OverlayOutcome<Renderer extends OverlayRenderer> =
  OverlayRendererContract[Renderer]["outcome"];

/**
 * Selects the terminal callback declared by a renderer's prompt definition.
 *
 * @typeParam Renderer - The renderer whose terminal callback should be selected.
 */
export type OverlayTerminalCallback<Renderer extends OverlayRenderer> = OnTerminalFunction<
  OverlayOutcome<Renderer>
>;

/**
 * Builds one prompt variant from its renderer contract.
 *
 * @typeParam Renderer - The renderer discriminant for the prompt variant.
 */
type PromptDefinition<Renderer extends OverlayRenderer> = BaseOverlayPrompt & {
  renderer: Renderer;
  payload: OverlayRendererContract[Renderer]["payload"];
  onTerminal?: OverlayTerminalCallback<Renderer>;
};

/**
 * Lookup map used when selecting a specific renderer's prompt type.
 */
type OverlayPromptByRenderer = {
  [Renderer in OverlayRenderer]: PromptDefinition<Renderer>;
};

/**
 * Discriminated union of every supported prompt type.
 */
export type OverlayPrompt = OverlayPromptByRenderer[OverlayRenderer];

/**
 * Selects a prompt definition by renderer.
 */
export type PromptFor<Renderer extends OverlayRenderer> = OverlayPromptByRenderer[Renderer];
