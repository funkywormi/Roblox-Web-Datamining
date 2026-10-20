import classNames from "classnames";
import type { ReactNode } from "react";
import { Badge, IconButton } from "@rbx/foundation-ui";
import useChatTranslate from "../../hooks/useChatTranslate";

type TChatWindowProps = {
  isCollapsed: boolean;
  isExpanded: boolean;
  /** Narrow viewport: show the list or the conversation pane, not both. */
  isSinglePane: boolean;
  /** The conversation pane has a chat or Create group to show (not the empty state). */
  isConversationPaneActive: boolean;
  unreadConversationCount: number;
  /** Show Create Group: chat and group chat are on and the conversation list isn't empty. */
  canCreateGroup: boolean;
  /** Shown instead of the window while it is collapsed: the same bar as the floating chat. */
  collapsedBar: ReactNode;
  /** The conversation list. Mounted only while it is shown. */
  list: ReactNode;
  /** The conversation pane. Stays mounted while the window is collapsed; the caller keeps drafts across chat switches. */
  children: ReactNode;
  onToggleCollapsed: () => void;
  onToggleExpanded: () => void;
  onOpenGroupInviteDialog: () => void;
};

/**
 * The unified chat window: one docked two-pane window, with the conversation list on the left and
 * the active conversation on the right. Collapsed, it shows `collapsedBar` instead.
 */
const ChatWindow = ({
  isCollapsed,
  isExpanded,
  isSinglePane,
  isConversationPaneActive,
  unreadConversationCount,
  canCreateGroup,
  collapsedBar,
  list,
  children,
  onToggleCollapsed,
  onToggleExpanded,
  onOpenGroupInviteDialog,
}: TChatWindowProps) => {
  const translate = useChatTranslate();
  const unreadBadge =
    unreadConversationCount > 0 ? <Badge label={String(unreadConversationCount)} /> : null;
  const isListPaneShown = !isSinglePane || !isConversationPaneActive;
  const isConversationPaneShown = !isSinglePane || isConversationPaneActive;

  return (
    <div className="flex flex-col items-end">
      {isCollapsed && collapsedBar}
      <section
        className={classNames(
          "react-chat-window react-chat-top-radius flex pointer-events-auto bg-surface-100 stroke-standard stroke-muted shadow-transient-high clip content-default",
          {
            "react-chat-window-expanded": isExpanded && !isSinglePane,
            "react-chat-window-single-pane": isSinglePane,
          },
        )}
        hidden={isCollapsed}
        aria-label={translate("Heading.Chat")}
      >
        <div
          className="react-chat-window-list-pane flex shrink-0 flex-col"
          hidden={!isListPaneShown}
        >
          <div className="flex min-height-[48px] shrink-0 items-center gap-xsmall padding-x-small padding-y-small">
            <div className="flex min-width-0 grow-1 items-center gap-small">
              <span className="text-title-medium content-emphasis">
                {translate("Heading.Chat")}
              </span>
              {unreadBadge}
            </div>
            {canCreateGroup && (
              <IconButton
                ariaLabel={translate("Label.SpanTitle.CreateGroupNeeds2More")}
                icon="icon-regular-pencil-square"
                size="Small"
                variant="Utility"
                isCircular
                onClick={onOpenGroupInviteDialog}
              />
            )}
            {!isSinglePane && (
              <IconButton
                ariaLabel={
                  isExpanded
                    ? translate("Label.ShrinkChat", undefined, "Shrink chat")
                    : translate("Label.ExpandChat", undefined, "Expand chat")
                }
                icon={isExpanded ? "icon-regular-frame-collapsed" : "icon-regular-frame-expanded"}
                size="Small"
                variant="Utility"
                isCircular
                onClick={onToggleExpanded}
              />
            )}
            <IconButton
              ariaLabel={translate("Label.MinimizeChat", undefined, "Minimize chat")}
              icon="icon-regular-chevron-large-down"
              size="Small"
              variant="Utility"
              isCircular
              onClick={onToggleCollapsed}
            />
          </div>
          {!isCollapsed && isListPaneShown && list}
        </div>
        <div
          className="react-chat-window-conversation-pane flex min-width-0 grow-1 flex-col"
          hidden={!isConversationPaneShown}
        >
          {children}
        </div>
      </section>
    </div>
  );
};

export default ChatWindow;
