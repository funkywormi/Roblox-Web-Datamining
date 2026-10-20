import classNames from "classnames";
import type { MouseEvent } from "react";
import { Badge, IconButton } from "@rbx/foundation-ui";
import useChatTranslate from "../../hooks/useChatTranslate";
import type { TChatConversation } from "../../types/chat";
import type { TChatDisabledReason } from "../../utils/chatEnabledState";
import ConversationList from "./ConversationList";

type TChatBarProps = {
  conversations: TChatConversation[];
  searchTerm: string;
  unreadConversationCount: number;
  isCollapsed: boolean;
  /**
   * True once the initial conversation load has settled — succeeded OR failed. False only while the
   * first fetch is still in flight, which is the only time the spinner shows; a settled empty or
   * failed-cold-boot load shows the empty "make friends" state, never a spinner or error.
   */
  isLoaded: boolean;
  /** When set, show the disabled CTA instead of the list (the fetch fails when off). */
  chatDisabledReason: TChatDisabledReason | null;
  /** Show Create Group: chat and group chat are on and the conversation list isn't empty. */
  canCreateGroup: boolean;
  hasNextPage?: boolean;
  onSearchTermChange: (searchTerm: string) => void;
  onOpenConversation: (layoutId: string) => void;
  onToggleCollapsed: () => void;
  onOpenGroupInviteDialog: () => void;
  onLoadMore?: () => void;
};

const ChatBar = ({
  conversations,
  searchTerm,
  unreadConversationCount,
  isCollapsed,
  isLoaded,
  chatDisabledReason,
  canCreateGroup,
  hasNextPage = false,
  onSearchTermChange,
  onOpenConversation,
  onToggleCollapsed,
  onOpenGroupInviteDialog,
  onLoadMore,
}: TChatBarProps) => {
  const translate = useChatTranslate();

  return (
    <section
      className={classNames(
        "react-chat-top-radius flex width-[286px] pointer-events-auto flex-col bg-surface-100 stroke-standard stroke-muted shadow-transient-low overflow-hidden clip",
        isCollapsed ? "height-[48px]" : "height-[360px]",
      )}
      aria-label={translate("Heading.Chat")}
    >
      <div
        className="react-chat-top-radius flex width-full min-height-[48px] shrink-0 items-center justify-between gap-small bg-surface-100 padding-x-small padding-y-small cursor-pointer"
        role="button"
        tabIndex={0}
        onClick={onToggleCollapsed}
        onKeyDown={event => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onToggleCollapsed();
          }
        }}
        aria-expanded={!isCollapsed}
      >
        <div className="flex grow-1 items-center gap-small">
          <span className="text-title-medium content-emphasis">{translate("Heading.Chat")}</span>
          {unreadConversationCount > 0 && <Badge label={String(unreadConversationCount)} />}
        </div>
        {canCreateGroup && (
          <IconButton
            ariaLabel={translate("Label.SpanTitle.CreateGroupNeeds2More")}
            icon="icon-regular-pencil-square"
            size="Small"
            variant="Utility"
            isCircular
            onClick={(event: MouseEvent<HTMLButtonElement>) => {
              event.stopPropagation();
              onOpenGroupInviteDialog();
            }}
          />
        )}
      </div>
      {!isCollapsed && (
        <ConversationList
          conversations={conversations}
          searchTerm={searchTerm}
          isLoaded={isLoaded}
          chatDisabledReason={chatDisabledReason}
          hasNextPage={hasNextPage}
          onSearchTermChange={onSearchTermChange}
          onOpenConversation={onOpenConversation}
          onLoadMore={onLoadMore}
        />
      )}
    </section>
  );
};

export default ChatBar;
