import { window as browserWindow } from "@rbx/core-lib/browser";

const USER_SIGNAL_ERROR_EVENT = "sdui:game-tile-user-signal-error";

/**
 * Note: This is a temporary function until the prompts orchestrator manages
 * snackbars. Pages show the error by mounting `GameTileFeedbackErrorSnackbar`.
 */
export function publishUserSignalError(): void {
  browserWindow?.dispatchEvent(new browserWindow.CustomEvent(USER_SIGNAL_ERROR_EVENT));
}

/**
 * Note: This is a temporary function until the prompts orchestrator manages
 * snackbars, and will be removed then.
 */
export function subscribeToUserSignalErrors(listener: () => void): () => void {
  const eventTarget = browserWindow;
  if (eventTarget == null) {
    return () => undefined;
  }
  eventTarget.addEventListener(USER_SIGNAL_ERROR_EVENT, listener);
  return () => {
    eventTarget.removeEventListener(USER_SIGNAL_ERROR_EVENT, listener);
  };
}
