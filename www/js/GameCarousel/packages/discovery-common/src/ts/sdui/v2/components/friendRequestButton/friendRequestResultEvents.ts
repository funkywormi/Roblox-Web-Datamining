import { window as browserWindow } from "@rbx/core-lib/browser";

export type FriendRequestResult = "success" | "failure";
export type FriendRequestType = "friend-request-sent" | "friend-request-accepted";
export type FriendRequestFeedback = {
  result: FriendRequestResult;
  type: FriendRequestType;
};

const FRIEND_REQUEST_RESULT_EVENT = "sdui:friend-request-result";

function isFriendRequestResult(value: unknown): value is FriendRequestResult {
  return value === "success" || value === "failure";
}

function isFriendRequestType(value: unknown): value is FriendRequestType {
  return value === "friend-request-sent" || value === "friend-request-accepted";
}

/**
 * Note: This is a temporary function to unblock Top SRP. Later, snackbar will
 * be managed by prompt orchestrator and this method will be removed
 */
export function publishFriendRequestResult(feedback: FriendRequestFeedback) {
  const eventTarget = browserWindow;
  if (eventTarget == null) {
    return;
  }

  const event = new eventTarget.CustomEvent(FRIEND_REQUEST_RESULT_EVENT, {
    detail: feedback,
  });
  eventTarget.dispatchEvent(event);
}

/**
 * Note: This is a temporary function to unblock Top SRP. Later, snackbar will
 * be managed by prompt orchestrator and this method will be removed
 */
export function subscribeToFriendRequestResults(
  listener: (feedback: FriendRequestFeedback) => void,
): () => void {
  const eventTarget = browserWindow;
  if (eventTarget == null) {
    return () => undefined;
  }

  const handleResult = (event: Event) => {
    if (!("detail" in event) || event.detail == null || typeof event.detail !== "object") {
      return;
    }

    if (
      "result" in event.detail &&
      isFriendRequestResult(event.detail.result) &&
      "type" in event.detail &&
      isFriendRequestType(event.detail.type)
    ) {
      listener({ result: event.detail.result, type: event.detail.type });
    }
  };

  eventTarget.addEventListener(FRIEND_REQUEST_RESULT_EVENT, handleResult);
  return () => {
    eventTarget.removeEventListener(FRIEND_REQUEST_RESULT_EVENT, handleResult);
  };
}
