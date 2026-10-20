import { window as browserWindow } from "@rbx/core-lib/browser";

export type FriendRequestResult = "success" | "failure";

const FRIEND_REQUEST_RESULT_EVENT = "sdui:friend-request-result";

function isFriendRequestResult(value: unknown): value is FriendRequestResult {
  return value === "success" || value === "failure";
}

/**
 * Note: This is a temporary function to unblock Top SRP. Later, snackbar will
 * be managed by prompt orchestrator and this method will be removed
 */
export function publishFriendRequestResult(result: FriendRequestResult) {
  const eventTarget = browserWindow;
  if (eventTarget == null) {
    return;
  }

  const event = new eventTarget.CustomEvent(FRIEND_REQUEST_RESULT_EVENT, {
    detail: { result },
  });
  eventTarget.dispatchEvent(event);
}

/**
 * Note: This is a temporary function to unblock Top SRP. Later, snackbar will
 * be managed by prompt orchestrator and this method will be removed
 */
export function subscribeToFriendRequestResults(
  listener: (result: FriendRequestResult) => void,
): () => void {
  const eventTarget = browserWindow;
  if (eventTarget == null) {
    return () => undefined;
  }

  const handleResult = (event: Event) => {
    if (!("detail" in event) || event.detail == null || typeof event.detail !== "object") {
      return;
    }

    if ("result" in event.detail && isFriendRequestResult(event.detail.result)) {
      listener(event.detail.result);
    }
  };

  eventTarget.addEventListener(FRIEND_REQUEST_RESULT_EVENT, handleResult);
  return () => {
    eventTarget.removeEventListener(FRIEND_REQUEST_RESULT_EVENT, handleResult);
  };
}
