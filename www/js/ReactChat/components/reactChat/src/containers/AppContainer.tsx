import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { window as browserWindow } from "@rbx/core-lib/browser";
import { useUniversalFeatureRestrictions } from "@rbx/universal-feature-restrictions";
import useChatTranslate from "../hooks/useChatTranslate";
import ChatBar from "../components/ChatBar/ChatBar";
import ConversationList from "../components/ChatBar/ConversationList";
import ChatDialog from "../components/ChatDialog/ChatDialog";
import ChatWindow from "../components/ChatWindow/ChatWindow";
import ChatWindowEmptyState from "../components/ChatWindow/ChatWindowEmptyState";
import GroupInviteDialog from "../components/GroupInviteDialog/GroupInviteDialog";
import MinimizedTray from "../components/MinimizedTray/MinimizedTray";
import SystemFeedback from "../components/SystemFeedback/SystemFeedback";
import { chatQueryKeys } from "../constants/queryKeys";
import { useChatBar } from "../hooks/useChatBar";
import { useChatData } from "../hooks/useChatData";
import { useChatLayout } from "../hooks/useChatLayout";
import { useChatMetadataConfig } from "../hooks/useChatMetadataConfig";
import { useChatRealtimeBridge } from "../hooks/useChatRealtimeBridge";
import { useChatUiPolicies } from "../hooks/useChatUiPolicies";
import { useIsSinglePaneViewport } from "../hooks/useIsSinglePaneViewport";
import { useUnifiedChatWindowExperiment } from "../hooks/useUnifiedChatWindowExperiment";
import { useMarkAsRead } from "../hooks/useMarkAsRead";
import { useModerationTimeouts } from "../hooks/useModerationTimeouts";
import { usePartyChatReactiveFeatureRestriction } from "../hooks/usePartyChatReactiveFeatureRestriction";
import { useUnreadTabTitle } from "../hooks/useUnreadTabTitle";
import {
  addUsersToConversation,
  createGroupConversation,
  createOneToOneConversation,
  getConversations,
  removeUsersFromConversation,
  renameGroupConversation,
} from "../services/chatService";
import { removeTrustedConnection } from "../services/chatFriendsService";
import {
  parseChatDeepLinkFromSearchString,
  replaceLocationRemovingChatDeepLinkParams,
} from "../utils/chatDeepLink";
import { resolveConsentVariant } from "../utils/consent";
import {
  getConversationIdForAnalytics,
  sendChatLandingConversationClicked,
  sendWebChatConversationsLoaded,
  sendWebChatRendered,
} from "../utils/chatAnalytics";
import { CHAT_UPDATE_STATUS } from "../constants/chatPolicyConstants";
import type { TChatConversation, TChatFeedback, TRenameResult } from "../types/chat";
import { applyModerationTimeouts } from "../utils/chatTransforms";
import { seedPendingConversation } from "../utils/chatQueryCache";
import { clearAllPersistedChatLayouts, readPersistedChatLayout } from "../utils/chatLayoutStorage";
import { getCurrentUserId } from "../utils/currentUser";

type TChatJQueryEventTarget = {
  on: (
    event: "Roblox.Chat.StartChat",
    handler: (event: unknown, args?: { userId?: number }) => void,
  ) => void;
  off: (
    event: "Roblox.Chat.StartChat",
    handler: (event: unknown, args?: { userId?: number }) => void,
  ) => void;
};

type TChatJQuery = (selector: Document) => TChatJQueryEventTarget;

declare global {
  interface Window {
    jQuery?: unknown;
  }
  interface DocumentEventMap {
    "Roblox.Chat.StartChat": CustomEvent<{ userId?: number } | null>;
  }
}

const isChatJQuery = (value: unknown): value is TChatJQuery => typeof value === "function";

/**
 * No-op handler for appeals. The UFR component will automatically handle proper appeals analytics
 * and UI behavior but we need to supply a dummy handler to enable appeals since these shorter,
 * proactive interventions typically don't require appeals.
 */
const handlePartyChatAppeal = () => undefined;

const CHAT_BAR_WIDTH_PX = 286;
const CHAT_DIALOG_WIDTH_PX = 260;
const GAP_TOKEN = "var(--gap-small)";
const PAGE_MARGIN_TOKEN = "var(--margin-small)";

// Anchors the minimized-chat trays immediately to the left of the visible dialog row,
// accounting for the chat bar, page margin, and each open panel's width + gap.
const getTrayRightOffset = (visiblePanelCount: number) => {
  const gapOffset = Array.from({ length: visiblePanelCount + 1 })
    .fill(GAP_TOKEN)
    .join(" + ");
  const dialogOffset = visiblePanelCount * CHAT_DIALOG_WIDTH_PX;

  return `calc(${CHAT_BAR_WIDTH_PX}px + ${PAGE_MARGIN_TOKEN} + ${gapOffset} + ${dialogOffset}px)`;
};

const AppContainer = () => {
  const translate = useChatTranslate();
  const queryClient = useQueryClient();
  const chatData = useChatData();
  const isLiveData = !chatData.isLoading && chatData.conversations.length > 0;

  // Surface the global unread count on the browser tab (e.g. "(3) Roblox").
  useUnreadTabTitle(chatData.unreadConversationCount);

  // Subscribe once initial eligibility/data loading completes, even when the list is empty.
  // Otherwise this tab can never receive the realtime event that creates its first conversation.
  const { isConnectionLost } = useChatRealtimeBridge({
    enabled: !chatData.isLoading,
    isChatEnabled: chatData.chatDisabledReason === null && chatData.isChatVisible,
  });
  const { shouldRespectConversationHasUnreadMessageToMarkAsRead, isGroupChatEnabled } =
    useChatMetadataConfig();
  const { scheduleMarkRead } = useMarkAsRead({
    enabled: isLiveData,
    shouldRespectUnread: shouldRespectConversationHasUnreadMessageToMarkAsRead,
  });

  const {
    isEnabled: isUnifiedChatWindowEnabled,
    isSettled: isUnifiedChatWindowSettled,
    logExposureOnce,
  } = useUnifiedChatWindowExperiment();
  const isSinglePane = useIsSinglePaneViewport();
  const {
    layout,
    conversations,
    openConversation,
    closeConversation,
    toggleConversationCollapsed,
    focusConversation,
    renameConversation,
    setConversationScreen,
    reportParticipant,
    confirmRemoveParticipant,
    resolveConsent,
    toggleCollapsed,
    toggleExpanded,
    openGroupInviteDialog,
    closeGroupInviteDialog,
  } = useChatLayout(chatData.conversations, {
    isUnifiedWindow: isUnifiedChatWindowEnabled,
    // Reopen saved chats once the layout is known, so the restore runs once, in that layout.
    isRestoreReady: isUnifiedChatWindowSettled,
  });
  // Fetch conversation-level timeouts only for conversations that are currently open dialogs.
  // The user-level timeout is fetched regardless (inside useModerationTimeouts) and applies to
  // every conversation.
  const openModerationIds = useMemo(
    () =>
      conversations
        .filter(
          conversation =>
            conversation.isOpen && chatData.moderationEligibleIds.has(conversation.id),
        )
        .map(conversation => conversation.id),
    [conversations, chatData.moderationEligibleIds],
  );
  const { resolveTimeout, refreshModerationStatuses } = useModerationTimeouts(openModerationIds);
  const {
    conversations: filteredConversations,
    searchTerm,
    setSearchTerm,
  } = useChatBar(conversations, chatData.unreadConversationCount);

  // A consent-blocked conversation (group-OSA / U13 opt-in) must not be marked read until the user
  // accepts — that happens in handleConsentResolved. Defined above the realtime + open/restore
  // handlers so every mark-read path can gate on it.
  const { expandedChatEnabled } = useChatUiPolicies();
  const isConsentBlocked = useCallback(
    (conversation: TChatConversation) =>
      resolveConsentVariant(conversation, expandedChatEnabled) != null,
    [expandedChatEnabled],
  );

  /**
   * Universal feature restriction for party chat presentation matrix.
   * Restrictions are either PROACTIVE (never require acknowledgment) or REACTIVE (require the user
   * to acknowledge). Each can arrive over realtime (live SignalR event) or already be in effect when
   * the user loads/opens chat (non-realtime, discovered by fetching moderation statuses):
   *
   *   Proactive             Whether to show the UFR dialog
   *     • Realtime          → always show the dialog
   *     • Non-realtime      → only show when the user clicks the "chat disabled" bar
   *   Reactive
   *     • Realtime          → always show the dialog
   *     • Non-realtime, acknowledged    → only show on "chat disabled" bar click
   *     • Non-realtime, un-acknowledged → auto-show once the chat surface becomes visible. Chat surface is
   *                                       visible when the chat bar is expanded OR a conversation dialog
   *                                       is open (not minimized/collapsed).
   */
  const { showFeatureRestriction, showFeatureRestrictionFromRealtime } =
    useUniversalFeatureRestrictions();
  // On a successful acknowledgment the server state has changed, so we issue a fresh request
  // (forceFresh) rather than dedupe onto a pre-acknowledgment fetch that may still be in flight and
  // could still report requires_acknowledgement as true, leaving the input blocked.
  const handleAcknowledgmentSuccess = useCallback(() => {
    refreshModerationStatuses({ forceFresh: true, retry: 3 }).catch((): undefined => undefined);
  }, [refreshModerationStatuses]);
  const showPartyChatFeatureRestriction = useCallback(() => {
    showFeatureRestriction({
      abuseVector: "party_chat",
      onAppeal: handlePartyChatAppeal,
      onAcknowledgmentSuccess: handleAcknowledgmentSuccess,
    });
  }, [showFeatureRestriction, handleAcknowledgmentSuccess]);

  const [feedback, setFeedback] = useState<TChatFeedback | null>(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const { useChatTimeouts } = useChatUiPolicies();
  const conversationsRef = useRef(conversations);
  conversationsRef.current = conversations;

  const hasVisibleConversation = conversations.some(
    conversation => conversation.isOpen && !conversation.isMinimized && !conversation.isCollapsed,
  );
  const isChatSurfaceVisible = !layout.isCollapsed || hasVisibleConversation;

  // isPartyChatReactiveRestrictionEligible is true only when useChatTimeouts rollout is on,
  // chat data has loaded, chat is enabled, AND chat surface is visible. Chat surface is considered
  // visible if either the chat bar is expanded so you can see the list of friends you can chat with
  // OR a conversation dialog is open so you can see the content of the conversation.
  const isPartyChatReactiveRestrictionEligible =
    useChatTimeouts &&
    !chatData.isLoading &&
    chatData.isMetadataSettled &&
    chatData.chatDisabledReason === null &&
    isChatSurfaceVisible;
  // The reactive entry check reuses a recent cached status (up to the query's 60s staleTime) so
  // repeatedly toggling the chat bar doesn't POST get-chat-moderation-statuses on every toggle.
  const refreshModerationStatusesForEntryCheck = useCallback(
    () => refreshModerationStatuses({ staleTime: 60_000 }),
    [refreshModerationStatuses],
  );
  usePartyChatReactiveFeatureRestriction({
    isEligible: isPartyChatReactiveRestrictionEligible,
    refreshModerationStatuses: refreshModerationStatusesForEntryCheck,
    showPartyChatFeatureRestriction,
  });

  // When chat starts collapsed (no chat left open and no chat deep link), both layouts show the same
  // bar, so it renders before the layer answers instead of waiting for it.
  const [startsCollapsed] = useState(() => {
    const persisted = readPersistedChatLayout(getCurrentUserId());
    const hasDeepLink =
      parseChatDeepLinkFromSearchString(browserWindow?.location.search ?? "").kind !== "none";
    return (
      !hasDeepLink &&
      (persisted == null ||
        (persisted.isCollapsed &&
          persisted.openedConversationLayoutIds.length === 0 &&
          persisted.minimizedConversationLayoutIds.length === 0))
    );
  });

  // Exposure is the first moment the two layouts can differ, detected from events that are the same
  // in both arms: chat starts open, the user opens the bar, the window, or Create group, a message
  // arrives, or a "Chat with" event. What is on screen differs by arm, so it is not used.
  const [hasExposureTrigger, setHasExposureTrigger] = useState(!startsCollapsed);
  const isGroupInviteDialogRequested = layout.conversationInviteDialogLayoutId != null;
  useEffect(() => {
    if (
      isUnifiedChatWindowSettled &&
      chatData.isMetadataLoaded &&
      chatData.isChatVisible &&
      (hasExposureTrigger || !layout.isCollapsed || isGroupInviteDialogRequested)
    ) {
      logExposureOnce();
    }
  }, [
    chatData.isChatVisible,
    chatData.isMetadataLoaded,
    hasExposureTrigger,
    isGroupInviteDialogRequested,
    isUnifiedChatWindowSettled,
    layout.isCollapsed,
    logExposureOnce,
  ]);

  const deepLinkConsumedRef = useRef(false);
  const webChatRenderedSentRef = useRef(false);
  const conversationsLoadedSentRef = useRef(false);

  // Opens the 1:1 with `userId`, creating it if needed. A dialog only renders for a conversation that
  // is in the list, and this one may sit on a list page that has not loaded yet — so seed it first
  // (legacy chat likewise put the started conversation at the front of its list).
  const startConversationWithUser = useCallback(
    async (userId: number) => {
      const created = await createOneToOneConversation(userId);
      const conversationId = created.id;
      if (!conversationId) {
        return;
      }
      // create-conversations leaves out the OSA and pending status the dialog needs (the UK OSA card,
      // for one), so read the conversation back before it opens. If that fails, the create response
      // still opens the chat.
      const [conversation = created] = await getConversations([conversationId]).catch(() => []);
      seedPendingConversation(queryClient, conversation);
      openConversation(`conv_${conversationId}`);
      queryClient
        .invalidateQueries({ queryKey: chatQueryKeys.conversations() })
        .catch((): undefined => undefined);
    },
    [openConversation, queryClient],
  );

  // "Chat with" and incoming-message events can arrive before the layer answers. Listen from the
  // start and queue them; they are handled once the layout is known, in the layout the user keeps.
  const [pendingStartChatUserId, setPendingStartChatUserId] = useState<number | null>(null);
  const [pendingIncomingConversationIds, setPendingIncomingConversationIds] = useState<string[]>(
    [],
  );
  const isGroupInviteDialogInOnlySlot =
    layout.conversationInviteDialogLayoutId != null && layout.maxVisiblePanelCount <= 1;

  useEffect(() => {
    if (!isLiveData) {
      return;
    }

    const queueStartChat = (userId: number | undefined) => {
      if (!userId) {
        return;
      }
      setHasExposureTrigger(true);
      setPendingStartChatUserId(userId);
    };

    // Native event works without jQuery (Next.js); triggerHandler senders only reach $.on.
    const handleNativeStartChat = (event: DocumentEventMap["Roblox.Chat.StartChat"]) => {
      queueStartChat(event.detail?.userId);
    };
    document.addEventListener("Roblox.Chat.StartChat", handleNativeStartChat);

    const $ = window.jQuery;
    const $doc = isChatJQuery($) ? $(document) : null;
    // $.on also fires for native dispatches, without args; those are handled above.
    const handleJQueryStartChat = (_event: unknown, args?: { userId?: number }) => {
      queueStartChat(args?.userId);
    };
    $doc?.on("Roblox.Chat.StartChat", handleJQueryStartChat);

    return () => {
      document.removeEventListener("Roblox.Chat.StartChat", handleNativeStartChat);
      $doc?.off("Roblox.Chat.StartChat", handleJQueryStartChat);
    };
  }, [isLiveData]);

  useEffect(() => {
    if (pendingStartChatUserId == null || !isUnifiedChatWindowSettled) {
      return;
    }
    setPendingStartChatUserId(null);

    const existing = conversationsRef.current.find(
      c => c.dialogType === "Direct" && c.participants.some(p => p.id === pendingStartChatUserId),
    );
    if (existing) {
      openConversation(existing.layoutId);
      return;
    }
    startConversationWithUser(pendingStartChatUserId).catch(() => undefined);
  }, [
    isUnifiedChatWindowSettled,
    openConversation,
    pendingStartChatUserId,
    startConversationWithUser,
  ]);

  useEffect(() => {
    if (!isLiveData) {
      return undefined;
    }

    const handleIncomingMessage = (event: CustomEvent<{ conversationId: string }>) => {
      const { conversationId } = event.detail;
      setHasExposureTrigger(true);
      setPendingIncomingConversationIds(current =>
        current.includes(conversationId) ? current : [...current, conversationId],
      );
    };

    window.addEventListener("reactChatIncomingMessage", handleIncomingMessage);
    return () => {
      window.removeEventListener("reactChatIncomingMessage", handleIncomingMessage);
    };
  }, [isLiveData]);

  useEffect(() => {
    if (pendingIncomingConversationIds.length === 0 || !isUnifiedChatWindowSettled) {
      return;
    }
    setPendingIncomingConversationIds([]);
    // The unified window never opens or switches on an incoming message; the unread badges show it.
    // Nor does the floating chat while Create group fills the only slot: opening the chat would
    // close Create group and lose the group the user is making.
    if (isUnifiedChatWindowEnabled || isGroupInviteDialogInOnlySlot) {
      return;
    }

    pendingIncomingConversationIds.forEach(conversationId => {
      const match = conversationsRef.current.find(
        conversation => conversation.id === conversationId,
      );
      if (!match?.layoutId) {
        return;
      }

      if (!match.isOpen) {
        openConversation(match.layoutId);
        if (match.unreadCount > 0 && !isConsentBlocked(match)) {
          scheduleMarkRead(match.id);
        }
        return;
      }

      if (match.isMinimized) {
        focusConversation(match.layoutId);
        if (match.unreadCount > 0 && !isConsentBlocked(match)) {
          scheduleMarkRead(match.id);
        }
      }
    });
  }, [
    focusConversation,
    isConsentBlocked,
    isGroupInviteDialogInOnlySlot,
    isUnifiedChatWindowEnabled,
    isUnifiedChatWindowSettled,
    openConversation,
    pendingIncomingConversationIds,
    scheduleMarkRead,
  ]);

  // Force-close a dialog when the current user is removed from a conversation/channel or it is
  // archived/deleted (parity with the legacy chat, which removes the dialog on these events). The
  // conversation-list refresh is handled separately by the realtime cache actions.
  useEffect(() => {
    if (!isLiveData) {
      return undefined;
    }

    const handleConversationRemoved = (event: WindowEventMap["reactChatConversationRemoved"]) => {
      const { conversationId } = event.detail;
      const match = conversationsRef.current.find(
        conversation => conversation.id === conversationId,
      );
      // No open dialog for this conversation ⇒ nothing to close (matches the legacy chat's
      // removeConversationFromUI, which looks the conversation up and no-ops when absent). Don't
      // fabricate a layoutId — a guessed id could collide with and close an unrelated dialog.
      if (!match) {
        return;
      }
      closeConversation(match.layoutId);
    };

    window.addEventListener("reactChatConversationRemoved", handleConversationRemoved);
    return () => {
      window.removeEventListener("reactChatConversationRemoved", handleConversationRemoved);
    };
  }, [isLiveData, closeConversation]);

  // Navigation fires this DOM event on logout right before reloading; clear the persisted dialog
  // layout so open windows don't restore after logging back in (parity with legacy destroyChatCookie).
  useEffect(() => {
    const handleLogout = () => {
      clearAllPersistedChatLayouts();
    };
    document.addEventListener("Roblox.Logout", handleLogout);
    return () => {
      document.removeEventListener("Roblox.Logout", handleLogout);
    };
  }, []);

  // When chat flips to disabled, close open dialogs so the bar shows the privacy CTA, not stale
  // conversations — no reload needed.
  useEffect(() => {
    if (chatData.chatDisabledReason === null) {
      return;
    }
    conversations
      .filter(conversation => conversation.isOpen)
      .forEach(conversation => {
        closeConversation(conversation.layoutId);
      });
  }, [chatData.chatDisabledReason, conversations, closeConversation]);

  // Real-time moderation consequences auto-pop their modal. The disabled input bar is driven
  // separately by useModerationTimeouts. Gated by the useChatTimeouts rollout so out-of-rollout
  // users never see a restriction dialog — the realtime subscription is also gated
  // (useChatRealtimeBridge), this is defense-in-depth.
  useEffect(() => {
    if (!useChatTimeouts) {
      return undefined;
    }
    const onTimeout = (event: WindowEventMap["reactChatFeatureIntervention"]) => {
      showFeatureRestrictionFromRealtime({
        abuseVector: "party_chat",
        intervention: event.detail,
        onAppeal: handlePartyChatAppeal,
        onAcknowledgmentSuccess: handleAcknowledgmentSuccess,
      });
    };
    const onNudge = (event: WindowEventMap["reactChatNudge"]) => {
      showFeatureRestrictionFromRealtime({
        abuseVector: "party_chat",
        intervention: event.detail,
        onAppeal: handlePartyChatAppeal,
        onAcknowledgmentSuccess: handleAcknowledgmentSuccess,
      });
    };
    window.addEventListener("reactChatFeatureIntervention", onTimeout);
    window.addEventListener("reactChatNudge", onNudge);
    return () => {
      window.removeEventListener("reactChatFeatureIntervention", onTimeout);
      window.removeEventListener("reactChatNudge", onNudge);
    };
  }, [showFeatureRestrictionFromRealtime, useChatTimeouts, handleAcknowledgmentSuccess]);

  useEffect(() => {
    if (
      deepLinkConsumedRef.current ||
      chatData.isLoading ||
      !chatData.isChatVisible ||
      !isUnifiedChatWindowSettled ||
      conversations.length === 0
    ) {
      return;
    }

    const intent = parseChatDeepLinkFromSearchString(window.location.search);
    if (intent.kind === "none") {
      deepLinkConsumedRef.current = true;
      return;
    }

    deepLinkConsumedRef.current = true;

    if (intent.kind === "openConversationById") {
      const match = conversations.find(c => c.id === intent.conversationId);
      if (match) {
        openConversation(match.layoutId);
      }
      replaceLocationRemovingChatDeepLinkParams();
      return;
    }

    const existingDirect = conversations.find(
      c => c.dialogType === "Direct" && c.participants.some(p => p.id === intent.userId),
    );
    if (existingDirect) {
      openConversation(existingDirect.layoutId);
      replaceLocationRemovingChatDeepLinkParams();
      return;
    }

    const consumeStartIntent = async () => {
      try {
        await startConversationWithUser(intent.userId);
      } finally {
        replaceLocationRemovingChatDeepLinkParams();
      }
    };
    consumeStartIntent().catch(() => undefined);
  }, [
    chatData.isLoading,
    chatData.isChatVisible,
    conversations,
    isUnifiedChatWindowSettled,
    openConversation,
    startConversationWithUser,
  ]);

  // webChatRendered — one-shot, once the chat has rendered and event sampling is configured off the
  // metadata (isMetadataLoaded). Skipped when hidden (U9 kids) so a chat that never renders isn't
  // counted; isChatOpen mirrors the expanded (non-collapsed) bar.
  // A chat that starts open renders only once the two-pane layer answers (see the render gate).
  useEffect(() => {
    if (
      !chatData.isMetadataLoaded ||
      !chatData.isChatVisible ||
      !(isUnifiedChatWindowSettled || startsCollapsed) ||
      webChatRenderedSentRef.current
    ) {
      return;
    }
    webChatRenderedSentRef.current = true;
    sendWebChatRendered({ isChatEnabled: true, isChatOpen: !layout.isCollapsed });
  }, [
    chatData.isMetadataLoaded,
    chatData.isChatVisible,
    isUnifiedChatWindowSettled,
    layout.isCollapsed,
    startsCollapsed,
  ]);

  // webChatConversationsLoaded — one-shot, fired once the conversation list has *succeeded* (gating
  // on areConversationsLoaded, not merely !isLoading, so a failed fetch never emits a phantom empty
  // event). conversationIds are the channels-source conversation ids; friendsConversationIds are the
  // friend participant ids of the friends-source placeholders. Ids are stringified without quotes:
  // the eventstream string-array field double-parses quoted values, so they must be stripped.
  useEffect(() => {
    if (
      !chatData.isMetadataLoaded ||
      !chatData.areConversationsLoaded ||
      !chatData.isChatVisible ||
      conversationsLoadedSentRef.current
    ) {
      return;
    }
    conversationsLoadedSentRef.current = true;
    const currentUserId = getCurrentUserId();
    const channelIds = chatData.conversations
      .filter(conversation => conversation.source !== "friends" && conversation.id)
      .map(conversation => conversation.id);
    const friendsConversationIds = chatData.conversations
      .filter(conversation => conversation.source === "friends")
      .map(conversation => conversation.participants.find(p => p.id !== currentUserId)?.id)
      .filter((id): id is number => id != null);
    sendWebChatConversationsLoaded({
      isChatOpen: !layout.isCollapsed,
      conversationIds: JSON.stringify(channelIds).replace(/"/g, ""),
      friendsConversationIds: JSON.stringify(friendsConversationIds).replace(/"/g, ""),
    });
  }, [
    chatData.isMetadataLoaded,
    chatData.areConversationsLoaded,
    chatData.isChatVisible,
    chatData.conversations,
    layout.isCollapsed,
  ]);

  const mergedConversations = filteredConversations.map(filteredConversation => {
    const conversation = conversations.find(({ id }) => id === filteredConversation.id);
    return conversation ?? filteredConversation;
  });
  // Visible dialogs render newest-first (most-recently-opened on the far left, oldest
  // nearest the chat bar), driven by the stable interaction order — NOT the server
  // conversation-list order, which reshuffles on send/receive activity.
  const visibleConversationsNewestFirst = layout.openedConversationLayoutIds
    .map(layoutId => conversations.find(conversation => conversation.layoutId === layoutId))
    .filter(
      (conversation): conversation is TChatConversation =>
        conversation != null && conversation.isOpen && !conversation.isMinimized,
    )
    .reverse();
  const openDialogCount = visibleConversationsNewestFirst.length;
  const isGroupInviteDialogOpen = Boolean(layout.conversationInviteDialogLayoutId);
  const activePanelCount = openDialogCount + (isGroupInviteDialogOpen ? 1 : 0);

  // Every minimized chat — whether minimized by the user or pushed out by viewport
  // overflow — collapses into the single count-bubble MinimizedTray.
  const minimizedConversations = conversations.filter(
    conversation => conversation.isOpen && conversation.isMinimized,
  );

  // Keep EVERY open dialog (including minimized ones) mounted so ChatDialog preserves
  // its local draft text and loaded message pages across minimize/restore and viewport
  // resize — minimized dialogs render null (ChatDialog.tsx) but stay mounted. Rendering
  // the null minimized instances first keeps the visible ones laid out newest-first.
  // Layer the resolved moderation timeout onto the dialogs we actually render (open + minimized),
  // so the input disables/re-enables for the conversation the user is viewing.
  const dialogsToRender = applyModerationTimeouts(
    [...minimizedConversations, ...visibleConversationsNewestFirst],
    resolveTimeout,
  );

  // Unified window: the one open conversation. It may be parked (minimized) while the window is
  // collapsed or Create group fills the pane; it stays mounted then, so its draft survives.
  const activeLayoutId = layout.openedConversationLayoutIds.at(-1);
  const [activeConversation] = applyModerationTimeouts(
    conversations.filter(
      conversation => conversation.isOpen && conversation.layoutId === activeLayoutId,
    ),
    resolveTimeout,
  );
  const isActiveConversationShown = activeConversation != null && !activeConversation.isMinimized;

  const handleOpenConversation = useCallback(
    (layoutId: string) => {
      openConversation(layoutId);
      const match = conversations.find(c => c.layoutId === layoutId);
      if (!match) {
        return;
      }
      // chatLandingConversationClicked — the user picked a conversation from the chat-bar list.
      sendChatLandingConversationClicked({
        isChatEnabled: true,
        isFiltered: searchTerm.length > 0,
        selectedConversationId: getConversationIdForAnalytics(match),
        hasUnreadMessages: match.unreadCount > 0,
      });
      if (match.unreadCount > 0 && !isConsentBlocked(match)) {
        scheduleMarkRead(match.id);
      }
    },
    [openConversation, conversations, scheduleMarkRead, isConsentBlocked, searchTerm],
  );

  const handlePromoteFriendPlaceholder = useCallback(
    (layoutId: string, newConversationId: string) => {
      closeConversation(layoutId);
      openConversation(`conv_${newConversationId}`);
    },
    [closeConversation, openConversation],
  );

  const handleRestoreConversation = useCallback(
    (layoutId: string) => {
      focusConversation(layoutId);
      const match = conversations.find(c => c.layoutId === layoutId);
      if (match && match.unreadCount > 0 && !isConsentBlocked(match)) {
        scheduleMarkRead(match.id);
      }
    },
    [focusConversation, conversations, scheduleMarkRead, isConsentBlocked],
  );

  // A parked chat shows again when Create group closes, the window widens, or the unified window
  // reopens. Mark it read then — parity with restoring it from the tray. useChatLayout reports
  // unreadCount 0 once a chat's messages are on screen (a collapsed floating dialog keeps its count),
  // so read the server count from chatData.
  const parkedLayoutIdsRef = useRef(new Set<string>());
  useEffect(() => {
    conversations.forEach(conversation => {
      const isShownAgain =
        parkedLayoutIdsRef.current.has(conversation.layoutId) &&
        conversation.isOpen &&
        !conversation.isMinimized &&
        conversation.unreadCount === 0;
      if (!isShownAgain || isConsentBlocked(conversation)) {
        return;
      }
      const serverUnreadCount =
        chatData.conversations.find(c => c.layoutId === conversation.layoutId)?.unreadCount ?? 0;
      if (serverUnreadCount > 0) {
        scheduleMarkRead(conversation.id);
      }
    });
    parkedLayoutIdsRef.current = new Set(
      conversations.filter(c => c.isOpen && c.isMinimized).map(c => c.layoutId),
    );
  }, [chatData.conversations, conversations, isConsentBlocked, scheduleMarkRead]);

  // Unified window: drafts are kept per chat while the user switches chats or goes Back, because only
  // the active chat is mounted. Closing a chat with X discards its draft, as the floating chat does.
  const draftsRef = useRef(new Map<string, string>());
  const handleDraftChange = useCallback((layoutId: string, draftMessage: string) => {
    if (draftMessage) {
      draftsRef.current.set(layoutId, draftMessage);
    } else {
      draftsRef.current.delete(layoutId);
    }
  }, []);
  const handleCloseEmbeddedConversation = useCallback(
    (layoutId: string) => {
      draftsRef.current.delete(layoutId);
      closeConversation(layoutId);
    },
    [closeConversation],
  );

  const handleToggleCollapsed = useCallback(
    (layoutId: string) => {
      const match = conversations.find(c => c.layoutId === layoutId);
      toggleConversationCollapsed(layoutId);
      // Expanding a collapsed dialog reveals its messages, so mark it read — parity with restoring a
      // minimized one. A collapsed dialog keeps its real unreadCount (useChatLayout), so this fires.
      if (match?.isCollapsed && match.unreadCount > 0 && !isConsentBlocked(match)) {
        scheduleMarkRead(match.id);
      }
    },
    [conversations, toggleConversationCollapsed, scheduleMarkRead, isConsentBlocked],
  );

  const handleCreateGroup = useCallback(
    async (groupName: string, participantIds: number[]) => {
      setIsCreatingGroup(true);
      try {
        const result = await createGroupConversation(groupName, participantIds);
        await queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
        closeGroupInviteDialog();
        if (result.id) {
          openConversation(`conv_${result.id}`);
        }
      } catch {
        setFeedback({
          id: Date.now(),
          type: "warning",
          message: translate("Message.Error"),
        });
      } finally {
        setIsCreatingGroup(false);
      }
    },
    [closeGroupInviteDialog, openConversation, queryClient, translate],
  );

  const handleLeaveGroupConversation = useCallback(
    async (layoutId: string) => {
      const match = conversations.find(c => c.layoutId === layoutId);
      const currentUserId = getCurrentUserId();
      if (!match || !currentUserId) {
        return;
      }
      try {
        await removeUsersFromConversation(match.id, [currentUserId]);
        closeConversation(layoutId);
        await queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
      } catch {
        setFeedback({
          id: Date.now(),
          type: "warning",
          message: translate("Message.Error"),
        });
      }
    },
    [closeConversation, conversations, queryClient, translate],
  );

  const handleRenameConversation = useCallback(
    async (layoutId: string, title: string): Promise<TRenameResult> => {
      const match = conversations.find(c => c.layoutId === layoutId);
      if (!match) {
        return "failed";
      }
      try {
        const updated = await renameGroupConversation(match.id, title);
        // The server answers 200 with status "moderated" (name blocked) or "failed" (not renamed) and
        // keeps the old title. The panel shows why, so only a real success changes the title.
        if (updated.status === CHAT_UPDATE_STATUS.moderated) {
          return "moderated";
        }
        if (updated.status === CHAT_UPDATE_STATUS.failed) {
          return "failed";
        }
        const updatedTitle = updated.name ?? title;
        renameConversation(layoutId, updatedTitle);
        await queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
        return "success";
      } catch {
        // Includes HTTP 429 from the server's per-group rename limit, which a moderated attempt uses
        // up too. The panel shows the failure, so there is no toast here.
        return "failed";
      }
    },
    [conversations, queryClient, renameConversation],
  );

  const handleAddFriends = useCallback(
    async (conversationId: string, userIds: number[]) => {
      const match = conversations.find(c => c.id === conversationId);
      const existingIds = new Set(match?.participants.map(p => p.id) ?? []);
      const newUserIds = userIds.filter(id => !existingIds.has(id));
      if (newUserIds.length === 0) {
        return;
      }
      try {
        await addUsersToConversation(conversationId, newUserIds);
        await queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
      } catch {
        setFeedback({
          id: Date.now(),
          type: "warning",
          message: translate("Message.Error"),
        });
      }
    },
    [conversations, queryClient, translate],
  );

  // Accepting the blocking consent modal clears its flags (dialog opens) and marks the
  // conversation read. Don't gate on match.unreadCount: useChatLayout zeroes unreadCount for open
  // dialogs, so it's already 0 here even though the server still has the conversation unread
  // (handleOpenConversation deliberately skips mark-read for consent-blocked conversations), so the
  // guard would never fire.
  const handleConsentResolved = useCallback(
    (layoutId: string) => {
      resolveConsent(layoutId);
      const match = conversationsRef.current.find(c => c.layoutId === layoutId);
      if (match) {
        scheduleMarkRead(match.id);
      }
    },
    [resolveConsent, scheduleMarkRead],
  );

  const handleRemoveParticipant = useCallback(
    async (conversationId: string, userId: number) => {
      const match = conversations.find(c => c.id === conversationId);
      // Only the group's creator may remove other members. The ChatDetails menu already
      // hides the action for non-owners; this is the authoritative server-facing guard.
      const currentUserId = getCurrentUserId();
      if (
        !match ||
        currentUserId == null ||
        match.createdBy !== currentUserId ||
        userId === currentUserId
      ) {
        return;
      }
      try {
        await removeUsersFromConversation(conversationId, [userId]);
        await queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
      } catch {
        setFeedback({
          id: Date.now(),
          type: "warning",
          message: translate("Message.Error"),
        });
      }
    },
    [conversations, queryClient, translate],
  );

  const handleRemoveTrustedConnection = useCallback(
    async (friendId: number) => {
      try {
        await removeTrustedConnection(friendId);
        setFeedback({
          id: Date.now(),
          type: "success",
          message: translate("TrustedFriend.Toast.TrustedFriendRemoved"),
        });
      } catch {
        setFeedback({
          id: Date.now(),
          type: "warning",
          message: translate("Message.Error"),
        });
      }
    },
    [translate],
  );

  // Hide the whole widget until metadata resolves, and whenever hidden (U9 kids). Legacy keeps
  // #chat-container hidden until isChatVisible !== false, so U9 never flashes. Until the two-pane
  // layer answers, show only the collapsed bar (the same in both layouts), or nothing if chat starts
  // open, so the layout never switches on screen.
  if (
    !chatData.isMetadataLoaded ||
    !chatData.isChatVisible ||
    (!isUnifiedChatWindowSettled && !startsCollapsed)
  ) {
    return null;
  }

  const canCreateGroup = isGroupChatEnabled && chatData.conversations.length > 0;

  const renderChatBar = ({
    isCollapsed,
    canCreateGroup: isCreateGroupShown,
    onToggleCollapsed,
    onOpenGroupInviteDialog,
  }: Pick<
    ComponentProps<typeof ChatBar>,
    "isCollapsed" | "canCreateGroup" | "onToggleCollapsed" | "onOpenGroupInviteDialog"
  >) => (
    <ChatBar
      conversations={mergedConversations}
      searchTerm={searchTerm}
      unreadConversationCount={chatData.unreadConversationCount}
      isCollapsed={isCollapsed}
      isLoaded={!chatData.isLoading}
      chatDisabledReason={chatData.chatDisabledReason}
      canCreateGroup={isCreateGroupShown}
      hasNextPage={chatData.hasNextPage}
      onSearchTermChange={setSearchTerm}
      onOpenConversation={handleOpenConversation}
      onToggleCollapsed={onToggleCollapsed}
      onOpenGroupInviteDialog={onOpenGroupInviteDialog}
      onLoadMore={chatData.fetchNextPage}
    />
  );

  const renderChatDialog = (conversation: TChatConversation, isEmbedded = false) => (
    <ChatDialog
      key={conversation.id}
      conversation={conversation}
      onClose={isEmbedded ? handleCloseEmbeddedConversation : closeConversation}
      onLeaveGroupConversation={layoutId => {
        handleLeaveGroupConversation(layoutId).catch(() => undefined);
      }}
      onToggleCollapsed={handleToggleCollapsed}
      onRenameConversation={handleRenameConversation}
      onAddFriends={(conversationId, userIds) => {
        handleAddFriends(conversationId, userIds).catch(() => undefined);
      }}
      onRemoveParticipant={(conversationId, userId) => {
        handleRemoveParticipant(conversationId, userId).catch(() => undefined);
      }}
      onSetScreen={setConversationScreen}
      onRequestRemoveParticipant={confirmRemoveParticipant}
      onReportParticipant={reportParticipant}
      onPromoteFriendPlaceholder={handlePromoteFriendPlaceholder}
      onRemoveTrustedConnection={friendId => {
        handleRemoveTrustedConnection(friendId).catch(() => undefined);
      }}
      onOpenPartyChatRestriction={showPartyChatFeatureRestriction}
      onConsentResolved={handleConsentResolved}
      isMetadataLoaded={chatData.isMetadataLoaded}
      isConnectionLost={isConnectionLost}
      isEmbedded={isEmbedded}
      onBack={isEmbedded && isSinglePane ? closeConversation : undefined}
      // On a narrow screen the window's own Minimize is in the hidden list pane.
      onMinimize={isEmbedded && isSinglePane ? toggleCollapsed : undefined}
      initialDraft={isEmbedded ? draftsRef.current.get(conversation.layoutId) : undefined}
      onDraftChange={isEmbedded ? handleDraftChange : undefined}
    />
  );

  const renderGroupInviteDialog = (isEmbedded = false) => (
    <GroupInviteDialog
      isOpen={isGroupInviteDialogOpen}
      isSubmitting={isCreatingGroup}
      isEmbedded={isEmbedded}
      onClose={closeGroupInviteDialog}
      onCreateGroup={(groupName, participantIds) => {
        handleCreateGroup(groupName, participantIds).catch(() => undefined);
      }}
    />
  );

  return (
    <div className="react-chat-root fixed bottom-[0] right-[var(--margin-small)] pointer-events-none content-default">
      {!isUnifiedChatWindowSettled ? (
        // An early click opens chat once the layer answers, in the layout the user will keep. The bar
        // still looks collapsed, so a second click must not cancel the first.
        renderChatBar({
          isCollapsed: true,
          canCreateGroup: false,
          onToggleCollapsed: () => {
            if (layout.isCollapsed) {
              toggleCollapsed();
            }
          },
          onOpenGroupInviteDialog: openGroupInviteDialog,
        })
      ) : isUnifiedChatWindowEnabled ? (
        <ChatWindow
          isCollapsed={layout.isCollapsed}
          isExpanded={layout.isExpanded}
          isSinglePane={isSinglePane}
          isConversationPaneActive={isActiveConversationShown || isGroupInviteDialogOpen}
          unreadConversationCount={chatData.unreadConversationCount}
          canCreateGroup={canCreateGroup}
          onToggleCollapsed={toggleCollapsed}
          onToggleExpanded={toggleExpanded}
          onOpenGroupInviteDialog={openGroupInviteDialog}
          collapsedBar={renderChatBar({
            isCollapsed: true,
            canCreateGroup,
            onToggleCollapsed: toggleCollapsed,
            onOpenGroupInviteDialog: () => {
              openGroupInviteDialog();
              toggleCollapsed();
            },
          })}
          list={
            <ConversationList
              conversations={mergedConversations}
              searchTerm={searchTerm}
              isLoaded={!chatData.isLoading}
              chatDisabledReason={chatData.chatDisabledReason}
              hasNextPage={chatData.hasNextPage}
              activeLayoutId={isActiveConversationShown ? activeConversation.layoutId : undefined}
              onSearchTermChange={setSearchTerm}
              onOpenConversation={handleOpenConversation}
              onLoadMore={chatData.fetchNextPage}
            />
          }
        >
          {activeConversation && renderChatDialog(activeConversation, true)}
          {renderGroupInviteDialog(true)}
          {!activeConversation && !isGroupInviteDialogOpen && <ChatWindowEmptyState />}
        </ChatWindow>
      ) : (
        <React.Fragment>
          <div className="fixed bottom-[0] right-[calc(286px+var(--gap-small)+var(--margin-small))] flex items-end justify-end gap-small pointer-events-none">
            {dialogsToRender.map(conversation => renderChatDialog(conversation))}
            {renderGroupInviteDialog()}
          </div>
          <div
            className="react-chat-tray-area fixed bottom-[0] flex items-end gap-small pointer-events-none"
            style={{ right: getTrayRightOffset(activePanelCount) }}
          >
            <MinimizedTray
              conversations={minimizedConversations}
              onRestoreConversation={handleRestoreConversation}
              onCloseConversation={closeConversation}
            />
          </div>
          {renderChatBar({
            isCollapsed: layout.isCollapsed,
            canCreateGroup,
            onToggleCollapsed: toggleCollapsed,
            onOpenGroupInviteDialog: openGroupInviteDialog,
          })}
        </React.Fragment>
      )}
      <SystemFeedback
        feedback={feedback}
        onClose={() => {
          setFeedback(null);
        }}
      />
    </div>
  );
};

export default AppContainer;
