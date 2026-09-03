import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";
import {
  MESSAGE_EVENTS,
  MESSAGE_MODULE_STATE,
  MESSAGE_TABS,
  NEWS_OPEN_CONTENT_CONTEXT,
  NEWS_OPEN_CONTENT_EVENT,
} from "../constants";
import {
  dispatchLegacyMessageEvent,
  linkifyMessageBody,
  shouldShowSystemUser,
} from "../utils/messageUtils";
import {
  getAnnouncementsMetadata,
  getMessageDetailById,
  getPrivateMessagesRules,
  markMessagesRead,
  sendMessage,
  setArchiveMessages,
  updateMessages,
} from "../services/privateMessagesService";
import { useMessageRoute } from "./useMessageRoute";
import type {
  FeedbackState,
  MessageItem,
  MessageModuleState,
  MessagePage,
  MessageTab,
  PrivateMessagesRules,
  SendReplyState,
} from "../types";

const initialSendReplyState: SendReplyState = {
  replyContent: "",
  includePreviousMessage: true,
  isSending: false,
};

const prepareMessageForDetail = (message: MessageItem | null): MessageItem | null =>
  message && !message.isSystemMessage
    ? { ...message, body: linkifyMessageBody(message.body) }
    : message;

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === "object") {
    const errorLike = error as { message?: unknown; errors?: unknown };
    if (typeof errorLike.message === "string") {
      return errorLike.message;
    }
    if (Array.isArray(errorLike.errors)) {
      const firstError: unknown = errorLike.errors[0];
      if (firstError && typeof firstError === "object" && "message" in firstError) {
        return String((firstError as { message?: unknown }).message);
      }
    }
  }
  return fallback;
};

export const usePrivateMessages = ({ translate }: { translate: (key: string) => string }) => {
  const { route, setRoute } = useMessageRoute();
  const [rules, setRules] = useState<PrivateMessagesRules>({});
  const [page, setPage] = useState<MessagePage | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<MessageItem | null>(null);
  const [selectedMessageIds, setSelectedMessageIds] = useState<Set<number>>(() => new Set());
  const [moduleState, setModuleState] = useState<MessageModuleState>(MESSAGE_MODULE_STATE.list);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [sendReplyState, setSendReplyState] = useState<SendReplyState>(initialSendReplyState);
  const [newsCount, setNewsCount] = useState(0);
  const skipNextRouteLoad = useRef(false);

  const tabs = useMemo(() => {
    const baseTabs: { name: MessageTab; label: string; count?: number }[] = [
      { name: MESSAGE_TABS.inbox, label: translate("Label.Inbox") },
      { name: MESSAGE_TABS.sent, label: translate("Label.Sent") },
      { name: MESSAGE_TABS.notifications, label: translate("Label.News"), count: newsCount },
      { name: MESSAGE_TABS.archive, label: translate("Label.Archive") },
    ];

    return rules.displayNewsTab
      ? baseTabs
      : baseTabs.filter(tab => tab.name !== MESSAGE_TABS.notifications);
  }, [newsCount, rules.displayNewsTab, translate]);

  const loadCurrentRoute = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSelectedMessageIds(new Set());

    try {
      if (route.conversationId != null) {
        const message = await getMessageDetailById(route.conversationId);
        setPage(null);
        setSelectedMessage(prepareMessageForDetail(message));
        setSendReplyState(initialSendReplyState);
        setModuleState(MESSAGE_MODULE_STATE.detail);
        if (!message.isRead) {
          await markMessagesRead([message.id], true);
          dispatchLegacyMessageEvent(MESSAGE_EVENTS.countChanged);
        }
      } else {
        const result = await updateMessages(route.tab, route.page - 1);
        setPage(result);
        setModuleState(
          route.messageIdx == null ? MESSAGE_MODULE_STATE.list : MESSAGE_MODULE_STATE.detail,
        );
        setSelectedMessage(
          route.messageIdx == null
            ? null
            : prepareMessageForDetail(result.collection[route.messageIdx] ?? null),
        );
        if (route.messageIdx != null) {
          setSendReplyState(initialSendReplyState);
        }
        dispatchLegacyMessageEvent(MESSAGE_EVENTS.countChanged);
      }
    } catch (loadError) {
      setPage(null);
      setSelectedMessage(null);
      setModuleState(MESSAGE_MODULE_STATE.list);
      setError(getErrorMessage(loadError, translate("Message.UnknownError")));
    } finally {
      setLoading(false);
    }
  }, [route, translate]);

  useEffect(() => {
    getPrivateMessagesRules()
      .then(setRules)
      .catch(() => {
        setRules({});
      });

    getAnnouncementsMetadata()
      .then(metadata => {
        setNewsCount(metadata.numOfAnnouncements ?? 0);
      })
      .catch(() => {
        setNewsCount(0);
      });
  }, []);

  useEffect(() => {
    if (skipNextRouteLoad.current) {
      skipNextRouteLoad.current = false;
      return;
    }

    // eslint-disable-next-line no-void
    void loadCurrentRoute();
  }, [loadCurrentRoute]);

  const openTab = (tab: MessageTab) => {
    if (tab === MESSAGE_TABS.notifications) {
      sendEventWithTarget(
        NEWS_OPEN_CONTENT_EVENT,
        NEWS_OPEN_CONTENT_CONTEXT,
        { property: newsCount },
        targetTypes.WWW,
      );
    }

    setSelectedMessage(null);
    setSelectedMessageIds(new Set());
    setSendReplyState(initialSendReplyState);
    setRoute({ tab, page: 1, messageIdx: null, conversationId: null });
  };

  const openMessage = async (message: MessageItem, index: number) => {
    setSelectedMessage(prepareMessageForDetail(message));
    setSelectedMessageIds(new Set([message.id]));
    setSendReplyState(initialSendReplyState);
    setModuleState(MESSAGE_MODULE_STATE.detail);
    skipNextRouteLoad.current = true;
    setRoute({ ...route, messageIdx: index, conversationId: null });

    if (!message.isRead) {
      setPage(previousPage =>
        previousPage == null
          ? previousPage
          : {
              ...previousPage,
              collection: previousPage.collection.map(item =>
                item.id === message.id ? { ...item, isRead: true } : item,
              ),
            },
      );
      await markMessagesRead([message.id], true);
      dispatchLegacyMessageEvent(MESSAGE_EVENTS.countChanged);
    }
  };

  const backToList = () => {
    setSelectedMessage(null);
    setSelectedMessageIds(new Set());
    setSendReplyState(initialSendReplyState);
    setModuleState(MESSAGE_MODULE_STATE.list);
    skipNextRouteLoad.current = true;
    setRoute({ ...route, messageIdx: null, conversationId: null });
  };

  const toggleMessageSelection = (messageId: number) => {
    setSelectedMessageIds(previousSelection => {
      const nextSelection = new Set(previousSelection);
      if (nextSelection.has(messageId)) {
        nextSelection.delete(messageId);
      } else {
        nextSelection.add(messageId);
      }
      return nextSelection;
    });
  };

  const toggleSelectAll = () => {
    setSelectedMessageIds(previousSelection => {
      if (!page || previousSelection.size === page.collection.length) {
        return new Set();
      }
      return new Set(page.collection.map(message => message.id));
    });
  };

  const markRead = async (markAsRead: boolean) => {
    const ids = [...selectedMessageIds];
    if (ids.length === 0) {
      return;
    }

    setPage(previousPage =>
      previousPage == null
        ? previousPage
        : {
            ...previousPage,
            collection: previousPage.collection.map(message =>
              ids.includes(message.id) ? { ...message, isRead: markAsRead } : message,
            ),
          },
    );
    setSelectedMessageIds(new Set());
    await markMessagesRead(ids, markAsRead);
    dispatchLegacyMessageEvent(MESSAGE_EVENTS.countChanged);
  };

  const markArchive = async (archive: boolean) => {
    const ids =
      selectedMessageIds.size > 0
        ? [...selectedMessageIds]
        : selectedMessage
          ? [selectedMessage.id]
          : [];
    if (ids.length === 0) {
      return;
    }

    const wasViewingDetail = moduleState === MESSAGE_MODULE_STATE.detail;
    await setArchiveMessages(ids, archive);
    setSelectedMessageIds(new Set());
    setSelectedMessage(null);
    setSendReplyState(initialSendReplyState);
    setModuleState(MESSAGE_MODULE_STATE.list);
    if (wasViewingDetail) {
      setRoute({ ...route, messageIdx: null, conversationId: null });
    } else {
      await loadCurrentRoute();
    }
    dispatchLegacyMessageEvent(MESSAGE_EVENTS.countChanged);
  };

  const changePage = (pageNumber: number) => {
    setSendReplyState(initialSendReplyState);
    setRoute({ tab: route.tab, page: pageNumber, messageIdx: null, conversationId: null });
  };

  const updateReplyContent = (replyContent: string) => {
    setSendReplyState(previousState => ({ ...previousState, replyContent }));
  };

  const updateIncludePreviousMessage = (includePreviousMessage: boolean) => {
    setSendReplyState(previousState => ({ ...previousState, includePreviousMessage }));
  };

  const sendReply = async () => {
    if (!selectedMessage || sendReplyState.replyContent.length === 0) {
      return;
    }

    setSendReplyState(previousState => ({ ...previousState, isSending: true }));
    try {
      await sendMessage({
        subject: selectedMessage.subject,
        body: sendReplyState.replyContent,
        recipientId: selectedMessage.sender.id,
        replyMessageId: selectedMessage.id,
        includePreviousMessage: sendReplyState.includePreviousMessage,
      });
      setFeedback({ type: "success", message: translate("Message.SendSuccessfully") });
      setSendReplyState(initialSendReplyState);
      dispatchLegacyMessageEvent(MESSAGE_EVENTS.messageSent);
    } catch (sendError) {
      setFeedback({
        type: "warning",
        message: getErrorMessage(sendError, translate("Message.UnknownError")),
      });
    } finally {
      setSendReplyState(previousState => ({ ...previousState, isSending: false }));
    }
  };

  return {
    route,
    rules,
    tabs,
    page,
    selectedMessage,
    selectedMessageIds,
    moduleState,
    loading,
    error,
    feedback,
    sendReplyState,
    openTab,
    openMessage,
    backToList,
    toggleMessageSelection,
    toggleSelectAll,
    markRead,
    markArchive,
    changePage,
    updateReplyContent,
    updateIncludePreviousMessage,
    sendReply,
    dismissFeedback: () => {
      setFeedback(null);
    },
    shouldShowSystemUser: (message: MessageItem) => shouldShowSystemUser(message, route.tab),
  };
};
