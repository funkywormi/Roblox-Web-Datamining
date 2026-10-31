import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { sendEventWithTarget, targetTypes } from "@rbx/core-scripts/event-stream";
import {
  MESSAGE_EVENTS,
  MESSAGE_MODULE_STATE,
  MESSAGE_TABS,
  NEWS_OPEN_CONTENT_CONTEXT,
  NEWS_OPEN_CONTENT_EVENT,
  RULES_WAIT_MS,
} from "../constants";
import {
  dispatchLegacyMessageEvent,
  linkifyMessageBody,
  shouldShowSystemUser,
} from "../utils/messageUtils";
import {
  getAnnouncementsMetadata,
  getMessageDetailById,
  getMessagesByPageToken,
  getPrivateMessagesRules,
  isInvalidPageTokenError,
  markMessagesRead,
  sendMessage,
  setArchiveMessages,
  updateMessages,
} from "../services/privateMessagesService";
import { useMessageRoute } from "./useMessageRoute";
import {
  host,
  trackCounter,
  trackCriticalError,
  trackError,
  type ErrorName,
} from "../observability";
import { getStatusCode } from "../utils/getStatusCode";
import type {
  FeedbackState,
  MessageItem,
  MessageModuleState,
  MessagePage,
  MessagePagination,
  MessageRoute,
  MessageTab,
  PageTarget,
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

// Cursor mode applies to inbox, sent, and archive when the GUAC flag is on. A page past the first
// without a token (an offset bookmark, or the offset pager shown when the server ignored cursor
// mode) still loads by page number.
export const shouldLoadByPageToken = (rules: PrivateMessagesRules, route: MessageRoute): boolean =>
  rules.enableCursorPagination === true &&
  route.tab !== MESSAGE_TABS.notifications &&
  (route.pageToken != null || route.page <= 1);

// Resolves to no rules if `rulesRequest` is still pending after RULES_WAIT_MS, so a slow GUAC
// response cannot block the list. That load uses offset paging; later loads see the real rules.
export const awaitRulesForListLoad = (
  rulesRequest: Promise<PrivateMessagesRules>,
): Promise<PrivateMessagesRules> =>
  Promise.race([
    rulesRequest,
    new Promise<PrivateMessagesRules>(resolve => {
      setTimeout(() => {
        resolve({});
      }, RULES_WAIT_MS);
    }),
  ]);

// Cursor paging when the response carries a page window; otherwise offset paging from the 0-based
// `pageNumber` and `totalPages`, falling back to the route's page while nothing is loaded.
export const toMessagePagination = (
  page: MessagePage | null,
  routePage: number,
): MessagePagination => {
  if (page?.cursorPagination) {
    return { kind: "cursor", ...page.cursorPagination };
  }
  return {
    kind: "offset",
    currentPage: page ? page.pageNumber + 1 : routePage,
    totalPages: page?.totalPages ?? 1,
  };
};

// Records the failure without changing the caller's rejection behaviour.
const trackAndRethrow =
  (name: ErrorName) =>
  (error: unknown): never => {
    trackError(name, { statusCode: getStatusCode(error) }, error);
    throw error;
  };

export const usePrivateMessages = ({ translate }: { translate: (key: string) => string }) => {
  const { route, setRoute } = useMessageRoute();
  // List loads wait for this, up to RULES_WAIT_MS, so the first request knows whether to use cursor
  // mode.
  const [rulesRequest] = useState(() =>
    getPrivateMessagesRules().catch((rulesError: unknown): PrivateMessagesRules => {
      trackError("RulesLoadFailed", { statusCode: getStatusCode(rulesError) }, rulesError);
      return {};
    }),
  );
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
  const initialTab = useRef(route.tab);

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
          // A mark-read failure shouldn't discard the message that already loaded.
          await markMessagesRead([message.id], true).then(
            () => {
              dispatchLegacyMessageEvent(MESSAGE_EVENTS.countChanged);
            },
            (markReadError: unknown) => {
              trackError(
                "MarkReadFailed",
                { statusCode: getStatusCode(markReadError) },
                markReadError,
              );
            },
          );
        }
      } else {
        const result = shouldLoadByPageToken(await awaitRulesForListLoad(rulesRequest), route)
          ? await getMessagesByPageToken(route.tab, route.pageToken)
          : await updateMessages(route.tab, route.page - 1);
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
      if (
        route.conversationId == null &&
        route.pageToken != null &&
        isInvalidPageTokenError(loadError)
      ) {
        setRoute({ ...route, page: 1, pageToken: null, messageIdx: null }, { replace: true });
        return;
      }

      trackCriticalError(
        "LoadFailed",
        { host, tab: route.tab, statusCode: getStatusCode(loadError) },
        loadError,
      );
      setPage(null);
      setSelectedMessage(null);
      setModuleState(MESSAGE_MODULE_STATE.list);
      setError(getErrorMessage(loadError, translate("Message.UnknownError")));
    } finally {
      setLoading(false);
    }
  }, [route, rulesRequest, setRoute, translate]);

  useEffect(() => {
    trackCounter("PageView", { host, tab: initialTab.current });

    // eslint-disable-next-line no-void
    void rulesRequest.then(setRules);

    getAnnouncementsMetadata()
      .then(metadata => {
        setNewsCount(metadata.numOfAnnouncements ?? 0);
      })
      .catch((metadataError: unknown) => {
        trackError(
          "NewsCountLoadFailed",
          { statusCode: getStatusCode(metadataError) },
          metadataError,
        );
        setNewsCount(0);
      });
  }, [rulesRequest]);

  useEffect(() => {
    if (skipNextRouteLoad.current) {
      skipNextRouteLoad.current = false;
      return;
    }

    // eslint-disable-next-line no-void
    void loadCurrentRoute();
  }, [loadCurrentRoute]);

  const openTab = (tab: MessageTab) => {
    trackCounter("OpenTab", { tab });
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
    setRoute({ tab, page: 1, pageToken: null, messageIdx: null, conversationId: null });
  };

  const openMessage = async (message: MessageItem, index: number) => {
    trackCounter("OpenMessage");
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
      await markMessagesRead([message.id], true).catch(trackAndRethrow("MarkReadFailed"));
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
    await markMessagesRead(ids, markAsRead).catch(trackAndRethrow("MarkReadFailed"));
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
    await setArchiveMessages(ids, archive).catch(trackAndRethrow("ArchiveFailed"));
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

  const pagination = useMemo(() => toMessagePagination(page, route.page), [page, route.page]);

  const changePage = ({ pageNumber, pageToken }: PageTarget) => {
    setSendReplyState(initialSendReplyState);
    setRoute({
      tab: route.tab,
      page: pageNumber,
      pageToken,
      messageIdx: null,
      conversationId: null,
    });
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
    pagination,
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
