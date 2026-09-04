import { PromptError } from "../../common/telemetry/promptErrors";
import { getPromptsErrorReporter } from "../../common/telemetry/promptsErrorReporter";
import { useOverlayOrchestratorStore } from "../store/overlayOrchestratorStore";
import { OverlayClosedReason, OverlayNotOpenedReason } from "../types";

export const resetQueueForNavigation = () => {
  const { activeOverlay, abandonedPrompts } = useOverlayOrchestratorStore.getState().resetQueue();

  if (activeOverlay?.status === "active") {
    try {
      activeOverlay.prompt.onTerminal?.({
        status: "closed",
        reason: OverlayClosedReason.Navigation,
      });
    } catch (error) {
      getPromptsErrorReporter().reportPromptError(
        PromptError.overlay.terminalCallbackError({
          prompt: activeOverlay.prompt,
          error,
        }),
      );
    }
  }

  abandonedPrompts.forEach(prompt => {
    try {
      prompt.onTerminal?.({
        status: "not-opened",
        reason: OverlayNotOpenedReason.Navigation,
      });
    } catch (error) {
      getPromptsErrorReporter().reportPromptError(
        PromptError.overlay.terminalCallbackError({
          prompt,
          error,
        }),
      );
    }
  });
};
