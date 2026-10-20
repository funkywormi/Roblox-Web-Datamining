import { useLayoutEffect, useRef } from "react";
import { ProgressCircle, TextInput } from "@rbx/foundation-ui";
import useChatTranslate from "../../hooks/useChatTranslate";
import type { TChatConversation } from "../../types/chat";
import type { TChatDisabledReason } from "../../utils/chatEnabledState";
import FriendRow from "./FriendRow";
import GroupRow from "./GroupRow";

// Request the next page when the viewport is within 100px of the bottom of the conversation list.
const NEAR_BOTTOM_THRESHOLD_PX = 100;

// Where the privacy CTA sends the user to re-enable "Chat and party with friends" (legacy target).
const PRIVACY_SETTINGS_URL = "/my/account#!/privacy";

const isNearBottom = (element: HTMLElement) =>
  element.scrollHeight - element.scrollTop - element.clientHeight < NEAR_BOTTOM_THRESHOLD_PX;

type TConversationListProps = {
  conversations: TChatConversation[];
  searchTerm: string;
  /**
   * True once the initial conversation load has settled — succeeded OR failed. False only while the
   * first fetch is still in flight, which is the only time the spinner shows; a settled empty or
   * failed-cold-boot load shows the empty "make friends" state, never a spinner or error.
   */
  isLoaded: boolean;
  /** When set, show the disabled CTA instead of the list (the fetch fails when off). */
  chatDisabledReason: TChatDisabledReason | null;
  hasNextPage?: boolean;
  /** Highlights the row of the conversation shown in the two-pane chat window. */
  activeLayoutId?: string;
  onSearchTermChange: (searchTerm: string) => void;
  onOpenConversation: (layoutId: string) => void;
  onLoadMore?: () => void;
};

/** Search field and conversation rows, or the disabled-chat message. */
const ConversationList = ({
  conversations,
  searchTerm,
  isLoaded,
  chatDisabledReason,
  hasNextPage = false,
  activeLayoutId,
  onSearchTermChange,
  onOpenConversation,
  onLoadMore,
}: TConversationListProps) => {
  const translate = useChatTranslate();
  const threadListRef = useRef<HTMLDivElement>(null);

  // Top-up: while more pages exist but the loaded (and search-filtered) list is too short to
  // scroll, keep pulling pages so a non-overflowing list can still reach the rest of the roster.
  // The `clientHeight > 0` guard skips this in non-layout environments (jsdom reports 0), and
  // useChatData's in-flight guard keeps repeated calls from stacking, so this loads pages one at a
  // time until the list overflows or the cursor is exhausted.
  useLayoutEffect(() => {
    const threadList = threadListRef.current;
    if (!hasNextPage || !onLoadMore || !threadList) {
      return;
    }
    if (threadList.clientHeight > 0 && threadList.scrollHeight <= threadList.clientHeight) {
      onLoadMore();
    }
  }, [conversations, hasNextPage, onLoadMore]);

  if (chatDisabledReason !== null) {
    return (
      <div
        className="flex min-height-0 grow-1 flex-col items-center justify-center gap-small bg-surface-100 padding-large text-align-x-center"
        data-testid="react-chat-disabled"
      >
        {chatDisabledReason === "region" ? (
          <span className="text-body-medium content-muted">
            {translate(
              "Message.ChatUnavailableRegion",
              undefined,
              "Chat isn't available in your region",
            )}
          </span>
        ) : chatDisabledReason === "privacy" ? (
          // Message.ChatPrivacySetting embeds a link via {frontLink}/{endLink}; pass them empty
          // (the whole line is already the link) so the tokens resolve instead of rendering raw.
          <a className="text-body-medium text-link" href={PRIVACY_SETTINGS_URL}>
            {translate(
              "Message.ChatPrivacySetting",
              { frontLink: "", endLink: "" },
              "Update your privacy settings to chat and party with friends",
            )}
          </a>
        ) : (
          <span className="text-body-medium content-muted">
            {translate("Message.Error", undefined, "Chat is currently unavailable")}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-height-0 grow-1 flex-col bg-surface-100">
      <div className="padding-x-small padding-bottom-small">
        <TextInput
          className="shrink-0"
          value={searchTerm}
          onChange={event => {
            onSearchTermChange(event.currentTarget.value);
          }}
          placeholder={translate("Label.InputPlaceHolder.SearchForFriends")}
          leadingIconName="icon-filled-magnifying-glass"
          trailingIconNode={
            searchTerm ? (
              <button
                type="button"
                className="bg-none stroke-none padding-none cursor-pointer content-muted"
                aria-label={translate("Action.Cancel")}
                onClick={() => {
                  onSearchTermChange("");
                }}
              >
                <span className="icon icon-regular-x size-400" />
              </button>
            ) : undefined
          }
          size="Small"
        />
      </div>
      <div
        ref={threadListRef}
        data-testid="react-chat-thread-list"
        className="react-chat-thread-list flex min-height-0 grow-1 flex-col gap-xxsmall scroll-y"
        onScroll={event => {
          if (hasNextPage && isNearBottom(event.currentTarget)) {
            onLoadMore?.();
          }
        }}
      >
        {conversations.map(conversation =>
          conversation.dialogType === "Group" ? (
            <GroupRow
              key={conversation.id}
              conversation={conversation}
              isSelected={conversation.layoutId === activeLayoutId}
              onOpenConversation={onOpenConversation}
            />
          ) : (
            <FriendRow
              key={conversation.id}
              conversation={conversation}
              isSelected={conversation.layoutId === activeLayoutId}
              onOpenConversation={onOpenConversation}
            />
          ),
        )}
        {conversations.length === 0 &&
          (isLoaded ? (
            // An active search that matches nothing shows a blank list (legacy parity); the
            // "make friends" copy is only for a genuinely empty roster, not empty search results.
            searchTerm.trim() === "" ? (
              <div className="flex flex-col items-center gap-small padding-large text-align-x-center">
                <span className="text-body-medium content-muted">
                  {translate("Message.MakeFriendsToChatNPlay")}
                </span>
              </div>
            ) : null
          ) : (
            // Still doing the initial fetch — show the spinner. A settled load (empty success OR
            // a failed cold boot) shows the empty "make friends" state above, never a spinner or
            // an error. (QALC-1437)
            <div
              className="flex flex-col items-center padding-large"
              data-testid="react-chat-list-loading"
            >
              <ProgressCircle
                ariaLabel={translate("Label.Loading", undefined, "Loading")}
                size="Medium"
                variant="Indeterminate"
              />
            </div>
          ))}
      </div>
    </div>
  );
};

export default ConversationList;
