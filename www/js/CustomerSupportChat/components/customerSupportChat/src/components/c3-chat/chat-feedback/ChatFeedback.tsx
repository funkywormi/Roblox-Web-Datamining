import React, { useEffect, useRef, useState } from "react";
import { Icon } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/legacy/react-utilities";
import { C3FeedbackRating } from "../../../core/types/c3Chat";
import { usePatchConversation } from "../../../hooks/c3ChatServices";
import useGetIXPResult from "../../../hooks/useGetIXPResult";
import ChatParticipantIcon from "../chat-participant-icon/ChatParticipantIcon";

const STAR_VALUES: C3FeedbackRating[] = [1, 2, 3, 4, 5];
const FEEDBACK_DEBOUNCE_MS = 300;
const IXP_EXPERIMENT_LAYER = "CustomerCare.C3.ChatFeedback.V2";
const IXP_EXPERIMENT_PARAMETER = "show_chat_feedback";

type ChatFeedbackProps = {
  conversationId: string;
  conversationAuthToken: string;
  isRobloxEmployee?: boolean;
  removeRbxLogo?: boolean;
};

const ChatFeedback: React.FC<ChatFeedbackProps> = ({
  conversationId,
  conversationAuthToken,
  isRobloxEmployee,
  removeRbxLogo,
}) => {
  const { translate: t } = useTranslation();
  const { data: isFeedbackEnabled } = useGetIXPResult(
    IXP_EXPERIMENT_LAYER,
    IXP_EXPERIMENT_PARAMETER,
  );
  const [rating, setRating] = useState<C3FeedbackRating>();
  const [hoveredRating, setHoveredRating] = useState<C3FeedbackRating>();
  const { mutate: updateConversation, isPending } = usePatchConversation(
    conversationId,
    conversationAuthToken,
  );
  const displayedRating = hoveredRating ?? rating;
  const submitTimer = useRef<number>();
  const queuedRating = useRef<C3FeedbackRating>();
  const inFlightRating = useRef<C3FeedbackRating>();

  const submitQueuedRating = () => {
    if (
      submitTimer.current !== undefined ||
      inFlightRating.current !== undefined ||
      queuedRating.current === undefined
    ) {
      return;
    }

    const selectedRating = queuedRating.current;
    queuedRating.current = undefined;
    inFlightRating.current = selectedRating;
    updateConversation(
      { feedbackRating: selectedRating },
      {
        onSettled: () => {
          inFlightRating.current = undefined;
          if (queuedRating.current === selectedRating) {
            queuedRating.current = undefined;
          }
          submitQueuedRating();
        },
      },
    );
  };

  const queueRating = (selectedRating: C3FeedbackRating) => {
    queuedRating.current = selectedRating;
    window.clearTimeout(submitTimer.current);
    submitTimer.current = window.setTimeout(() => {
      submitTimer.current = undefined;
      submitQueuedRating();
    }, FEEDBACK_DEBOUNCE_MS);
  };

  const selectRating = (selectedRating: C3FeedbackRating) => {
    setRating(selectedRating);
    setHoveredRating(undefined);
    queueRating(selectedRating);
  };

  useEffect(
    () => () => {
      window.clearTimeout(submitTimer.current);
      queuedRating.current = undefined;
    },
    [],
  );

  if (!isRobloxEmployee && isFeedbackEnabled !== true) {
    return null;
  }

  return (
    <div className="c3-chat-message-container is-agent">
      {!removeRbxLogo && <ChatParticipantIcon isUser={false} showIcon={false} />}
      <span
        className="c3-chat-message is-agent single-message"
        data-testid="c3-chat-feedback"
        aria-busy={isPending}
      >
        <p className="c3-chat-feedback-label">{t("Chat.Description.FeedbackPrompt")}</p>
        <div
          className="c3-chat-feedback-actions"
          role="group"
          aria-label={t("Chat.Label.FeedbackRatingGroup")}
          onMouseLeave={() => {
            setHoveredRating(undefined);
          }}
        >
          {STAR_VALUES.map(star => (
            <button
              key={star}
              type="button"
              className="c3-chat-feedback-star"
              aria-label={t("Chat.Label.FeedbackStarRating", { rating: star })}
              aria-pressed={rating === star}
              onClick={() => {
                selectRating(star);
              }}
              onMouseEnter={() => {
                setHoveredRating(star);
              }}
            >
              <Icon
                name={
                  displayedRating !== undefined && star <= displayedRating
                    ? "icon-filled-star"
                    : "icon-regular-star"
                }
                size="XLarge"
              />
            </button>
          ))}
        </div>
        {rating !== undefined && (
          <p className="c3-chat-feedback-thanks" role="status">
            {t("Chat.Response.FeedbackSaved")}
          </p>
        )}
      </span>
    </div>
  );
};

export default ChatFeedback;
