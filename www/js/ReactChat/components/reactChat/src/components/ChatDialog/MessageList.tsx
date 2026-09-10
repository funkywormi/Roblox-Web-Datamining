import { useLayoutEffect, useRef, type ReactNode } from "react";
import type { TChatConversation, TChatMessage } from "../../types/chat";
import { getCurrentUserId } from "../../utils/currentUser";
import MessageBubble from "./MessageBubble";
import { createTimelineItems, type TMessageTimelineItem } from "./messageTimeline";
import TypingIndicator from "./TypingIndicator";

const NEAR_BOTTOM_THRESHOLD_PX = 48;
// Load older messages once the viewport gets within this many px of the top, so the user doesn't
// have to nudge to the exact top repeatedly.
const NEAR_TOP_THRESHOLD_PX = 80;

const isNearBottom = (element: HTMLDivElement) =>
  element.scrollHeight - element.scrollTop - element.clientHeight < NEAR_BOTTOM_THRESHOLD_PX;

const scrollToBottom = (el: HTMLDivElement) => {
  const target = el;
  target.scrollTop = target.scrollHeight;
  requestAnimationFrame(() => {
    target.scrollTop = target.scrollHeight;
  });
};

type TMessageListProps = {
  conversation: TChatConversation;
  messages: TChatMessage[];
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  onResend?: (message: TChatMessage) => void;
  /** Autotranslation policy flag; threaded to each bubble to render `contentToDisplay`. */
  isAutotranslationEnabled: boolean;
  /** Open the thread at the top (so the unacknowledged OSA card is read) instead of the bottom. */
  shouldScrollFromTop?: boolean;
  /** Rendered as the first item inside the scroll list (the inline OSA card), so it scrolls with
   * the thread and is revealed by shouldScrollFromTop — matching the legacy inline card. */
  topContent?: ReactNode;
};

const MessageList = ({
  conversation,
  messages,
  hasNextPage = false,
  onLoadMore,
  onResend,
  isAutotranslationEnabled,
  shouldScrollFromTop = false,
  topContent,
}: TMessageListProps) => {
  const timelineItems = createTimelineItems(messages);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  /** Whether the viewport was at the bottom before the latest `messages` update. */
  const wasAtBottomRef = useRef(true);
  const isLoadingOlderRef = useRef(false);
  // scrollHeight captured just before an older-page load, used to anchor the viewport after prepend.
  const previousScrollHeightRef = useRef(0);
  const previousMessageCountRef = useRef(messages.length);
  const previousLastMessageIdRef = useRef(messages.at(-1)?.id);
  const isTypingVisible = conversation.isTyping && conversation.typingParticipantIds.length > 0;
  const previousIsTypingVisibleRef = useRef(isTypingVisible);

  const renderTimelineItem = (timelineItem: TMessageTimelineItem) => {
    if (timelineItem.type === "Timestamp" || timelineItem.type === "System") {
      return (
        <li key={timelineItem.id} className="flex justify-center padding-x-medium">
          <span className="text-caption-small content-muted text-center">{timelineItem.label}</span>
        </li>
      );
    }

    return (
      <li key={timelineItem.id}>
        <ul className="react-chat-message-group flex flex-col">
          {timelineItem.messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              conversation={conversation}
              message={message}
              isFirstInGroup={index === 0}
              isLastInGroup={index === timelineItem.messages.length - 1}
              onResend={onResend}
              isAutotranslationEnabled={isAutotranslationEnabled}
            />
          ))}
        </ul>
      </li>
    );
  };

  const initialScrollDoneRef = useRef(false);
  const scrolledFromTopRef = useRef(false);
  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }
    // OSA threads open at the top so the card is read; other threads at the newest message.
    // shouldScrollFromTop can turn true after mount (async flag), so scroll to top once even if we
    // already opened at the bottom.
    if (shouldScrollFromTop) {
      if (!scrolledFromTopRef.current) {
        scrolledFromTopRef.current = true;
        initialScrollDoneRef.current = true;
        container.scrollTop = 0;
        wasAtBottomRef.current = false;
      }
      return;
    }
    if (!initialScrollDoneRef.current) {
      initialScrollDoneRef.current = true;
      scrollToBottom(container);
      wasAtBottomRef.current = true;
    }
  }, [shouldScrollFromTop]);

  useLayoutEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    if (isLoadingOlderRef.current) {
      isLoadingOlderRef.current = false;
      // Older messages prepend above the viewport — shift scrollTop down by the height they added so
      // the same messages stay in view instead of the list jumping to the top.
      const addedHeight = container.scrollHeight - previousScrollHeightRef.current;
      if (addedHeight > 0) {
        container.scrollTop += addedHeight;
      }
      previousMessageCountRef.current = messages.length;
      previousLastMessageIdRef.current = messages.at(-1)?.id;
      wasAtBottomRef.current = isNearBottom(container);
      return;
    }

    const lastMessage = messages.at(-1);
    const lastMessageId = lastMessage?.id;
    const messageCountIncreased = messages.length > previousMessageCountRef.current;
    const lastMessageChanged =
      lastMessageId !== undefined && lastMessageId !== previousLastMessageIdRef.current;
    const currentUserId = getCurrentUserId();
    const sentByCurrentUser =
      lastMessage?.senderUserId != null &&
      currentUserId !== null &&
      lastMessage.senderUserId === currentUserId;
    const hasNewContent = messageCountIncreased || lastMessageChanged;
    const typingBecameVisible = isTypingVisible && !previousIsTypingVisibleRef.current;

    // An OSA thread opens at the top and stays there: messages load after mount, and without this
    // guard that first load scrolls to the bottom (the empty container reads as "at bottom"),
    // overriding the scroll-to-top.
    if (
      !shouldScrollFromTop &&
      ((hasNewContent && (wasAtBottomRef.current || sentByCurrentUser)) ||
        (typingBecameVisible && wasAtBottomRef.current))
    ) {
      scrollToBottom(container);
    }

    previousMessageCountRef.current = messages.length;
    previousLastMessageIdRef.current = lastMessageId;
    previousIsTypingVisibleRef.current = isTypingVisible;
    wasAtBottomRef.current = isNearBottom(container);
  }, [
    conversation.isTyping,
    conversation.typingParticipantIds,
    isTypingVisible,
    messages,
    shouldScrollFromTop,
  ]);

  return (
    <div
      ref={scrollContainerRef}
      data-testid="react-chat-dialog-scroll"
      className="react-chat-dialog-scroll flex min-height-0 grow-1 basis-0 flex-col scroll-y bg-surface-100"
      onScroll={event => {
        const container = event.currentTarget;
        wasAtBottomRef.current = isNearBottom(container);

        // Fetch the next older page as the user nears the top (not only at the exact top); guarded so
        // it fires once per page, and capture the height to anchor the viewport after the prepend.
        if (
          hasNextPage &&
          !isLoadingOlderRef.current &&
          container.scrollTop <= NEAR_TOP_THRESHOLD_PX
        ) {
          isLoadingOlderRef.current = true;
          previousScrollHeightRef.current = container.scrollHeight;
          onLoadMore?.();
        }
      }}
    >
      {/* margin-top-auto keeps a short thread pinned to the bottom of the scroll area (messages
          grow up from the input); once the list overflows it collapses and scrolling is normal. */}
      <ul className="margin-top-auto flex flex-col gap-large bg-surface-100 padding-bottom-medium padding-top-small">
        {topContent && <li>{topContent}</li>}
        {timelineItems.map(renderTimelineItem)}
        {/* Typing sits at the very bottom of the message flow, so a newly received
            message lands exactly where the typing indicator was. */}
        <TypingIndicator conversation={conversation} />
      </ul>
    </div>
  );
};

export default MessageList;
