import { PromptError } from "../../common/telemetry/promptErrors";
import { getPromptsErrorReporter } from "../../common/telemetry/promptsErrorReporter";
import { useOverlayOrchestratorStore } from "../store/overlayOrchestratorStore";
import type { OverlayQueue } from "../store/overlay-queue/overlayQueueSlice";
import { OverlayNotOpenedReason, type OverlayPrompt } from "../types";
import { isSupportedOverlayRenderer } from "./isSupportedOverlayRenderer";
import type { OverlayPromptSubmission } from "./types";
import {
  getMissingSduiPromptEntryFields,
  isSduiOverlayPrompt,
  isValidSduiPromptEntry,
} from "./utils";

const isDuplicate = (prompt: OverlayPrompt, queue: OverlayQueue) => {
  const isInFlight =
    queue.activeOverlay?.prompt.dedupeKey === prompt.dedupeKey ||
    queue.overlay.some(entry => entry.dedupeKey === prompt.dedupeKey);

  return (
    isInFlight ||
    (prompt.dedupePolicy === "session" && (queue.seenOverlays[prompt.dedupeKey] ?? 0) > 0)
  );
};

/**
 * Adds a prompt to the overlay queue. If the prompt is an SDUI prompt, it will
 * use the prompt entry identifier as the queued prompt id.
 *
 * @param prompt - The prompt to add to the overlay queue.
 */
export const submitPrompt = (prompt: OverlayPromptSubmission) => {
  const state = useOverlayOrchestratorStore.getState();

  // Runtime check in case consumers suppress the type error and add an unsupported renderer.
  if (!isSupportedOverlayRenderer(prompt.renderer)) {
    getPromptsErrorReporter().reportPromptError(
      PromptError.overlay.unsupportedRenderer({
        renderer: prompt.renderer,
      }),
    );

    prompt.onTerminal?.({
      status: "not-opened",
      reason: OverlayNotOpenedReason.RendererUnavailable,
    });
    return;
  }

  let overlayPrompt: OverlayPrompt;
  if (isSduiOverlayPrompt(prompt)) {
    const { promptEntry } = prompt.payload;
    if (!isValidSduiPromptEntry(promptEntry)) {
      const missingFields = getMissingSduiPromptEntryFields(promptEntry);
      getPromptsErrorReporter().reportPromptError(
        PromptError.overlay.invalidPrompt({
          renderer: prompt.renderer,
          missingFields,
          appPage: prompt.payload.appPage,
        }),
      );

      prompt.onTerminal?.({
        status: "not-opened",
        reason: OverlayNotOpenedReason.InvalidPrompt,
      });
      return;
    }

    overlayPrompt = {
      ...prompt,
      id: promptEntry.identifier,
    };
  } else {
    overlayPrompt = prompt;
  }

  if (isDuplicate(overlayPrompt, state.queue)) {
    prompt.onTerminal?.({
      status: "not-opened",
      reason: OverlayNotOpenedReason.Duplicate,
    });
    return;
  }

  state.enqueuePrompt(overlayPrompt);
};
