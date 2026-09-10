import { useState } from "react";
import { Badge } from "@rbx/foundation-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import type { TChatConversation } from "../../types/chat";

type TMinimizedTrayProps = {
  conversations: TChatConversation[];
  onRestoreConversation: (layoutId: string) => void;
  onCloseConversation: (layoutId: string) => void;
};

// All minimized chats — whether the user minimized them or they were pushed out of the
// visible dialog row — collapse into this single tray: a speech-bubble button with a
// count badge that toggles a popover list. Each row reopens the chat (click the title)
// or closes it entirely (click the X). Mirrors the legacy AngularJS dialogMinimize.
const MinimizedTray = ({
  conversations,
  onRestoreConversation,
  onCloseConversation,
}: TMinimizedTrayProps) => {
  const { translate } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  if (conversations.length === 0) {
    return null;
  }

  return (
    <div className="react-chat-minimized-tray relative flex items-end self-end pointer-events-auto">
      {isExpanded && (
        <div className="react-chat-minimized-list flex flex-col bg-surface-100 stroke-standard stroke-muted shadow-transient-low clip scroll-y">
          {conversations.map(conversation => (
            <div
              key={conversation.id}
              className="react-chat-minimized-row flex items-center gap-small padding-x-medium padding-y-small"
            >
              <button
                type="button"
                className="flex min-width-0 grow-1 items-center bg-none stroke-none padding-none cursor-pointer"
                onClick={() => {
                  onRestoreConversation(conversation.layoutId);
                  setIsExpanded(false);
                }}
                aria-label={conversation.title}
              >
                <span className="block min-width-0 grow-1 text-body-large content-emphasis text-truncate-end text-align-left">
                  {conversation.title}
                </span>
              </button>
              <button
                type="button"
                className="react-chat-minimized-close flex shrink-0 items-center justify-center bg-none stroke-none padding-xsmall cursor-pointer content-muted"
                aria-label={`${translate("Action.Close")} ${conversation.title}`}
                onClick={event => {
                  event.stopPropagation();
                  onCloseConversation(conversation.layoutId);
                }}
              >
                <span className="icon icon-regular-x size-600" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        className="react-chat-minimized-toggle react-chat-top-radius flex items-center gap-small bg-surface-100 stroke-standard stroke-muted shadow-transient-low padding-x-small padding-y-xsmall cursor-pointer"
        onClick={() => {
          setIsExpanded(current => !current);
        }}
        aria-expanded={isExpanded}
        aria-label={translate("Label.MinimizedChats", undefined, "Minimized chats")}
      >
        <span
          className="icon icon-filled-speech-bubble-round size-400 content-emphasis"
          aria-hidden="true"
        />
        <Badge label={String(conversations.length)} variant="Emphasis" />
      </button>
    </div>
  );
};

export default MinimizedTray;
