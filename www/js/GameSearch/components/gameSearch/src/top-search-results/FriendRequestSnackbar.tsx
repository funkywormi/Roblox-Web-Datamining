import { useEffect, useState } from "react";
import type { TranslateFunction } from "@rbx/core-scripts/react";
import {
  type FriendRequestFeedback,
  subscribeToFriendRequestResults,
} from "@rbx/discovery-common/sdui";
import { Snackbar } from "@rbx/foundation-ui";

type FriendRequestSnackbarProps = {
  translate: TranslateFunction;
};

type Feedback = FriendRequestFeedback & {
  id: number;
};

const getFeedbackTitle = (translate: TranslateFunction, feedback: Feedback): string => {
  if (feedback.type === "friend-request-accepted") {
    return feedback.result === "success"
      ? translate("Action.FriendAdded") || "Friend added."
      : translate("NetworkingError.SomethingIsWrong") || "Unable to accept friend request.";
  }
  if (feedback.result === "success") {
    return translate("Action.FriendRequestSent") || "Friend request sent.";
  }
  return translate("NetworkingError.SomethingIsWrong") || "Unable to send friend request.";
};

export const FriendRequestSnackbar = ({ translate }: FriendRequestSnackbarProps) => {
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(
    () =>
      subscribeToFriendRequestResults(friendRequestFeedback => {
        setFeedback(previousFeedback => ({
          ...friendRequestFeedback,
          id: (previousFeedback?.id ?? 0) + 1,
        }));
      }),
    [],
  );

  if (feedback == null) {
    return null;
  }

  const isSuccess = feedback.result === "success";
  const title = getFeedbackTitle(translate, feedback);
  const closeIconAriaLabel = translate("Action.Close") || "Close";

  return (
    <Snackbar
      key={feedback.id}
      title={title}
      icon={isSuccess ? "icon-filled-check" : "icon-regular-triangle-exclamation"}
      closeIconAriaLabel={closeIconAriaLabel}
      onClose={() => {
        setFeedback(null);
      }}
      shouldAutoDismiss
    />
  );
};

export default FriendRequestSnackbar;
