import { unstable_batchedUpdates } from "react-dom";
import { PromptError } from "../../common/telemetry/promptErrors";
import { getPromptsErrorReporter } from "../../common/telemetry/promptsErrorReporter";
import { useOverlayOrchestratorStore } from "../store/overlayOrchestratorStore";
import type { OverlayOutcome, OverlayRenderer, PromptFor } from "../types";

export const finishPrompt = <Renderer extends OverlayRenderer>(
  promptId: string,
  outcome: OverlayOutcome<Renderer>,
) => {
  // needed to prevent zombie-child effect: https://zustand.docs.pmnd.rs/learn/guides/event-handler-in-pre-react-18#calling-actions-outside-a-react-event-handler-in-pre-react-18
  const prompt = unstable_batchedUpdates(() => {
    // Type assertion is safe because we know the IDs match.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return useOverlayOrchestratorStore
      .getState()
      .markActivePromptForDismissal(promptId) as PromptFor<Renderer> | null;
  });
  if (!prompt) {
    return;
  }

  try {
    // defensive try catch to prevent client defined onTerminal from deadlocking
    // the queue
    prompt.onTerminal?.(outcome);
  } catch (error) {
    getPromptsErrorReporter().reportPromptError(
      PromptError.overlay.terminalCallbackError({
        prompt,
        error,
      }),
    );
  } finally {
    // needed to prevent zombie-child effect: https://zustand.docs.pmnd.rs/learn/guides/event-handler-in-pre-react-18#calling-actions-outside-a-react-event-handler-in-pre-react-18
    unstable_batchedUpdates(() => {
      useOverlayOrchestratorStore.getState().removeActivePrompt(prompt.id);
    });
  }
};
