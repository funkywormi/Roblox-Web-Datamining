import { window as browserWindow } from "@rbx/core-lib/browser";

export type FriendRequestResult = "success" | "failure";
export type FriendRequestType = "friend-request-sent" | "friend-request-accepted";
type FriendRequestFailureReason = "offline";

export type FriendRequestFeedback = { type: FriendRequestType } & (
  | { result: "success" }
  | { result: "failure"; reason?: FriendRequestFailureReason }
);

const FRIEND_REQUEST_RESULT_EVENT = "sdui:friend-request-result";

function isFriendRequestResult(value: unknown): value is FriendRequestResult {
  return value === "success" || value === "failure";
}

function isFriendRequestFailureReason(value: unknown): value is FriendRequestFailureReason {
  return value === "offline";
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
      if (event.detail.result === "failure") {
        listener({
          result: "failure",
          type: event.detail.type,
          ...("reason" in event.detail &&
            isFriendRequestFailureReason(event.detail.reason) && { reason: event.detail.reason }),
        });
      } else {
        listener({ result: "success", type: event.detail.type });
      }
    }
  };

  eventTarget.addEventListener(FRIEND_REQUEST_RESULT_EVENT, handleResult);
  return () => {
    eventTarget.removeEventListener(FRIEND_REQUEST_RESULT_EVENT, handleResult);
  };
}
