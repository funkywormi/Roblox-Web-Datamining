import classNames from "classnames";
import React, { type ReactNode } from "react";
import { Divider, Icon } from "@rbx/foundation-ui";
import { getCurrentUserId } from "../../utils/currentUser";
import { parseGameLinkSegments } from "../../utils/gameLinkCard";
import type { TChatConversation, TChatMessage } from "../../types/chat";
import AvatarHeadshot from "../AvatarHeadshot";
import GameCard from "./GameCard/GameCard";

type TMessageBubbleProps = {
  conversation: TChatConversation;
  message: TChatMessage;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  /** Re-send handler; a resend control is shown when the message failed and may be retried. */
  onResend?: (message: TChatMessage) => void;
  /** Autotranslation policy flag; gates rendering the translated `contentToDisplay`. */
  isAutotranslationEnabled: boolean;
};

const MessageBubble = ({
  conversation,
  message,
  isFirstInGroup,
  isLastInGroup,
  onResend,
  isAutotranslationEnabled,
}: TMessageBubbleProps) => {
  const sender = conversation.participants.find(
    participant => participant.id === message.senderUserId,
  );
  const isOutgoing = message.senderUserId === getCurrentUserId();
  const isSingleMessageGroup = isFirstInGroup && isLastInGroup;

  // Split message content into plain text (rendered in the chat bubble) and game-link cards
  // (rendered standalone beside the bubble — the card replaces the link text rather than
  // sitting inside the message bubble).
  const textNodes: ReactNode[] = [];
  const gameCards: ReactNode[] = [];
  message.pieces.forEach(piece => {
    parseGameLinkSegments(piece.content).forEach(segment => {
      if (segment.type === "gameCard") {
        gameCards.push(
          <GameCard
            key={`${piece.id}-game-${segment.placeId}-${segment.url}`}
            placeId={segment.placeId}
            url={segment.url}
            conversationId={conversation.id}
            privateServerLinkCode={segment.privateServerLinkCode}
          />,
        );
      } else if (segment.content.length > 0) {
        textNodes.push(
          <span key={`${piece.id}-text-${segment.content}`} className="text-body-small">
            {segment.content}
          </span>,
        );
      }
    });
  });
  const hasBubbleContent = textNodes.length > 0;
  const showResend = Boolean(message.canResend && onResend);
  // Legacy parity (chatDialog.html): when autotranslation is on and the server supplied a
  // translated rendering, the original is shown muted above a divider and the translation below.
  const isAutotranslated = isAutotranslationEnabled && (message.contentToDisplay ?? "").length > 0;

  return (
    <li
      className={classNames("flex gap-small padding-x-medium", {
        "justify-end": isOutgoing,
        "justify-start": !isOutgoing,
      })}
    >
      {!isOutgoing &&
        (sender && isFirstInGroup ? (
          <a
            href={sender.profileUrl}
            className="react-chat-message-avatar shrink-0"
            aria-hidden="true"
          >
            <AvatarHeadshot
              userId={sender.id}
              displayName={sender.displayName}
              containerClassName="size-800 radius-circle bg-shift-300 clip"
            />
          </a>
        ) : (
          <span className="size-800 shrink-0" aria-hidden="true" />
        ))}
      <div
        className={classNames("flex max-width-[196px] flex-col gap-xxsmall", {
          "items-end": isOutgoing,
          "items-start": !isOutgoing,
        })}
      >
        {conversation.dialogType === "Group" &&
          !isOutgoing &&
          message.isClusterMaster &&
          isFirstInGroup &&
          sender && <span className="text-caption-small content-muted">{sender.displayName}</span>}
        {hasBubbleContent && (
          <div className="flex items-center gap-xsmall">
            {showResend && (
              // Subtle icon-only resend control to the left of the failed bubble, vertically centered
              // with it. Translated aria-label intentionally deferred (TODO i18n).
              <button
                type="button"
                className="react-chat-message-resend content-muted"
                onClick={() => {
                  onResend?.(message);
                }}
              >
                <Icon name="icon-filled-arrow-spin-clockwise" size="Small" />
              </button>
            )}
            <div
              className={classNames(
                "react-chat-message-bubble padding-x-medium padding-y-small text-body-small",
                {
                  "react-chat-message-bubble-outgoing content-action-emphasis": isOutgoing,
                  "react-chat-message-bubble-incoming content-emphasis": !isOutgoing,
                  "react-chat-message-bubble-first": isFirstInGroup && !isLastInGroup,
                  "react-chat-message-bubble-middle": !isFirstInGroup && !isLastInGroup,
                  "react-chat-message-bubble-last": !isFirstInGroup && isLastInGroup,
                  "react-chat-message-bubble-single": isSingleMessageGroup,
                  "opacity-70": message.isSending,
                },
              )}
            >
              {isAutotranslated ? (
                <React.Fragment>
                  {/* Original message, muted (legacy `text-muted`). */}
                  <div className="content-muted">{textNodes}</div>
                  <Divider orientation="horizontal" variant="Standard" />
                  {/* Server-provided translation, emphasized. Rendered as escaped text (React
                      auto-escapes) — legacy used ng-bind-html, but we keep the XSS-safe text path. */}
                  <span className="text-body-small">{message.contentToDisplay}</span>
                </React.Fragment>
              ) : (
                textNodes
              )}
            </div>
          </div>
        )}
        {gameCards}
        {message.error && (
          <span className="text-caption-small content-system-alert">{message.error}</span>
        )}
      </div>
    </li>
  );
};

export default MessageBubble;
