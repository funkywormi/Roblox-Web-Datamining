import { sendEventWithTarget } from "@rbx/core-scripts/event-stream";
import { ReviewCategoryType } from "../services/playerFeedbackService";

export const voteTypeToString = (vote: ReviewCategoryType): string | null => {
  switch (vote) {
    case ReviewCategoryType.Upvote:
      return "Upvote";
    case ReviewCategoryType.Downvote:
      return "Downvote";
    default:
      return null;
  }
};

export const sendPlayerFeedbackEvent = (
  eventName: string,
  placeId: string,
  voteType?: ReviewCategoryType,
): void => {
  if (voteType && voteTypeToString(voteType)) {
    sendEventWithTarget(eventName, "GamePlayerFeedback", {
      placeId,
      category_type: voteTypeToString(voteType) ?? "",
    });
  } else {
    sendEventWithTarget(eventName, "GamePlayerFeedback", {
      placeId,
    });
  }
};
