import classNames from "classnames";
import type { ReactNode } from "react";
import type { TChatConversation } from "../../types/chat";

type TChatRowProps = {
  conversation: TChatConversation;
  avatar: ReactNode;
  ariaLabel?: string;
  onOpenConversation: (layoutId: string) => void;
};

const ChatRow = ({ conversation, avatar, ariaLabel, onOpenConversation }: TChatRowProps) => {
  const isUnread = conversation.unreadCount > 0;
  const secondaryTextClassName = classNames(
    "text-caption-medium text-truncate-end",
    isUnread ? "content-emphasis" : "content-muted",
  );

  return (
    <button
      type="button"
      className="react-chat-row flex width-full shrink-0 items-center gap-medium padding-x-medium padding-y-xsmall text-left bg-none stroke-none cursor-pointer hover:bg-shift-100"
      onClick={() => {
        onOpenConversation(conversation.layoutId);
      }}
      aria-label={ariaLabel}
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
          {conversation.preview}
        </span>
      </div>
    </button>
  );
};

export default ChatRow;
