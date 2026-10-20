import classNames from "classnames";
import type { ReactNode } from "react";
import useChatTranslate from "../../hooks/useChatTranslate";
import type { TChatConversation } from "../../types/chat";

type TChatRowProps = {
  conversation: TChatConversation;
  avatar: ReactNode;
  ariaLabel?: string;
  /** The row's conversation is the one shown in the unified chat window. */
  isSelected?: boolean;
  onOpenConversation: (layoutId: string) => void;
};

const ChatRow = ({
  conversation,
  avatar,
  ariaLabel,
  isSelected = false,
  onOpenConversation,
}: TChatRowProps) => {
  const translate = useChatTranslate();
  const isUnread = conversation.unreadCount > 0;
  const secondaryTextClassName = classNames(
    "text-caption-medium text-truncate-end",
    isUnread ? "content-emphasis" : "content-muted",
  );

  return (
    <button
      type="button"
      className={classNames(
        "react-chat-row flex width-full shrink-0 items-center gap-medium padding-x-medium padding-y-xsmall text-align-x-left bg-none stroke-none cursor-pointer hover:bg-shift-100",
        { "react-chat-row-selected": isSelected },
      )}
      onClick={() => {
        onOpenConversation(conversation.layoutId);
      }}
      aria-label={ariaLabel}
      aria-current={isSelected ? "true" : undefined}
    >
      {avatar}
      <div className="react-chat-row-body flex min-width-none grow-1 flex-col gap-xxsmall">
        <div className="react-chat-row-title-line flex min-width-none items-center justify-between gap-small">
          <span
            className={classNames(
              "react-chat-row-title min-width-none grow-1 content-emphasis",
              isUnread ? "text-title-medium" : "text-body-medium",
            )}
          >
            {conversation.title}
          </span>
          <span
            className={classNames(
              "shrink-0 text-caption-medium",
              isUnread ? "content-emphasis" : "content-muted",
            )}
          >
            {conversation.lastUpdatedLabel}
          </span>
        </div>
        <span className={classNames("react-chat-row-preview", secondaryTextClassName)}>
          {conversation.isPreviewHidden
            ? translate("Label.MessageNotAvailable", undefined, "This message is not available")
            : conversation.preview}
        </span>
      </div>
    </button>
  );
};

export default ChatRow;
