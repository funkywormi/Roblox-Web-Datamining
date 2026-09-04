import { OVERLAY_PAGE, type AppPageOrOverlay } from "../../constants/pageConstants";
import type { BaseOverlayPrompt } from "../../../overlay-orchestrator/types";
import {
  extractErrorMessageFromUnknownError,
  generateErrorMessage,
} from "../../utils/errorMessageUtils";
import { PromptErrorName } from "../constants";
import type { OverlayErrorPayload } from "../promptErrorPayload";

export type OverlayRendererErrorInput = {
  renderer: string;
};

export type InvalidOverlayPromptErrorInput = {
  renderer: string;
  missingFields: readonly string[];
  appPage: AppPageOrOverlay;
};

export type OverlayTerminalCallbackErrorInput = {
  prompt: BaseOverlayPrompt;
  error: unknown;
};

export const overlayErrors = {
  /**
   * An overlay prompt reached the orchestrator with a renderer that has no adapter.
   */
  unsupportedRenderer: ({ renderer }: OverlayRendererErrorInput): OverlayErrorPayload => ({
    errorName: PromptErrorName.UnsupportedOverlayRenderer,
    errorMessage: `Received an unsupported overlay renderer: ${renderer}`,
    appPage: OVERLAY_PAGE,
  }),
  /**
   * A prompt service prompt reached the orchestrator with a payload that cannot be rendered.
   */
  invalidPrompt: ({
    renderer,
    missingFields,
    appPage,
  }: InvalidOverlayPromptErrorInput): OverlayErrorPayload => ({
    errorName: PromptErrorName.InvalidOverlayPrompt,
    errorMessage: `Received an invalid overlay prompt (${renderer}): missing ${missingFields.join(", ")}`,
    appPage,
  }),
  /**
   * A client onTerminal callback threw while the overlay was being finished.
   */
  terminalCallbackError: ({
    prompt,
    error,
  }: OverlayTerminalCallbackErrorInput): OverlayErrorPayload => {
    const { id, dedupeKey, dedupePolicy, triggerType } = prompt;

    return {
      errorName: PromptErrorName.OverlayTerminalCallbackError,
      errorMessage: generateErrorMessage({
        tags: { id, dedupeKey, dedupePolicy, triggerType },
        errorMessage: extractErrorMessageFromUnknownError(error, "Overlay terminal callback threw"),
      }),
      appPage: OVERLAY_PAGE,
      options: {
        additionalTags: { dedupePolicy, triggerType },
        additionalContext: { id, dedupeKey },
      },
    };
  },
};
