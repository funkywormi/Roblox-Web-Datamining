import { useEffect, useState } from "react";
import type { TranslateFunction } from "@rbx/core-scripts/react";
import {
  type FriendRequestResult,
  subscribeToFriendRequestResults,
} from "@rbx/discovery-common/sdui";
import { Snackbar } from "@rbx/foundation-ui";

type FriendRequestSnackbarProps = {
  translate: TranslateFunction;
};

type Feedback = {
  id: number;
  result: FriendRequestResult;
};

export const FriendRequestSnackbar = ({ translate }: FriendRequestSnackbarProps) => {
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(
    () =>
      subscribeToFriendRequestResults(result => {
        setFeedback(previousFeedback => ({
          id: (previousFeedback?.id ?? 0) + 1,
          result,
        }));
      }),
    [],
  );

  if (feedback == null) {
    return null;
  }

  const isSuccess = feedback.result === "success";
  const title = isSuccess
    ? translate("Action.FriendRequestSent") || "Friend request sent."
    : translate("NetworkingError.SomethingIsWrong") || "Unable to send friend request.";
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
