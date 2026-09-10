import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@rbx/core-scripts/react";
import { useUniversalFeatureRestrictions } from "@rbx/universal-feature-restrictions";
import ChatBar from "../components/ChatBar/ChatBar";
import ChatDialog from "../components/ChatDialog/ChatDialog";
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
import { useMarkAsRead } from "../hooks/useMarkAsRead";
import { useModerationTimeouts } from "../hooks/useModerationTimeouts";
import { useUnreadTabTitle } from "../hooks/useUnreadTabTitle";
import {
  addUsersToConversation,
  createGroupConversation,
  createOneToOneConversation,
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
import type { TChatConversation, TChatFeedback } from "../types/chat";
import { applyModerationTimeouts } from "../utils/chatTransforms";
import { clearAllPersistedChatLayouts } from "../utils/chatLayoutStorage";
import { getCurrentUserId } from "../utils/currentUser";

type TChatJQueryEventTarget = {
  on: (
    event: "Roblox.Chat.StartChat",
    handler: (event: unknown, args: { userId?: number }) => void,
  ) => void;
  off: (
    event: "Roblox.Chat.StartChat",
    handler: (event: unknown, args: { userId?: number }) => void,
  ) => void;
};

type TChatJQuery = (selector: Document) => TChatJQueryEventTarget;

declare global {
  interface Window {
    jQuery?: unknown;
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
  const { translate } = useTranslation();
  const queryClient = useQueryClient();
  const chatData = useChatData();
  const isLiveData = !chatData.isLoading && chatData.conversations.length > 0;

  // Surface the global unread count on the browser tab (e.g. "(3) Roblox").
  useUnreadTabTitle(chatData.unreadConversationCount);

  // Subscribe once initial eligibility/data loading completes, even when the list is empty.
  // Otherwise this tab can never receive the realtime event that creates its first conversation.
  const { isConnectionLost } = useChatRealtimeBridge({
    enabled: !chatData.isLoading,
    isChatEnabled: chatData.chatDisabledReason === null,
  });
  const { shouldRespectConversationHasUnreadMessageToMarkAsRead } = useChatMetadataConfig();
  const { scheduleMarkRead } = useMarkAsRead({
    enabled: isLiveData,
    shouldRespectUnread: shouldRespectConversationHasUnreadMessageToMarkAsRead,
  });

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
    resolveConsent,
    toggleCollapsed,
    openGroupInviteDialog,
    closeGroupInviteDialog,
  } = useChatLayout(chatData.conversations);
  // Fetch conversation-level timeouts only for conversations that are currently open dialogs.
  // The user-level timeout is fetched regardless (inside useModerationTimeouts) and applies to
  // every non–trusted-comms conversation.
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
  const { resolveTimeout } = useModerationTimeouts(openModerationIds);
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

  const { showFeatureRestriction, showFeatureRestrictionFromRealtime } =
    useUniversalFeatureRestrictions();
  const showPartyChatFeatureRestriction = useCallback(() => {
    showFeatureRestriction({ abuseVector: "party_chat", onAppeal: handlePartyChatAppeal });
  }, [showFeatureRestriction]);

  const [feedback, setFeedback] = useState<TChatFeedback | null>(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const { useChatTimeouts } = useChatUiPolicies();
  const conversationsRef = useRef(conversations);
  conversationsRef.current = conversations;

  const deepLinkConsumedRef = useRef(false);
  const webChatRenderedSentRef = useRef(false);
  const conversationsLoadedSentRef = useRef(false);

  useEffect(() => {
    if (!isLiveData) {
      return;
    }

    const $ = window.jQuery;
    if (!isChatJQuery($)) {
      return;
    }

    const handleStartChat = (_event: unknown, args: { userId?: number }) => {
      const { userId } = args;
      if (!userId) {
        return;
      }

      const existing = conversationsRef.current.find(
        c => c.dialogType === "Direct" && c.participants.some(p => p.id === userId),
      );
      if (existing) {
        openConversation(existing.layoutId);
        return;
      }

      createOneToOneConversation(userId)
        .then(async result => {
          await queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
          if (result.id) {
            openConversation(`conv_${result.id}`);
          }
        })
        .catch(() => undefined);
    };

    const $doc = $(document);
    $doc.on("Roblox.Chat.StartChat", handleStartChat);
    return () => {
      $doc.off("Roblox.Chat.StartChat", handleStartChat);
    };
  }, [isLiveData, openConversation, queryClient]);

  useEffect(() => {
    if (!isLiveData) {
      return;
    }

    const handleIncomingMessage = (event: CustomEvent<{ conversationId: string }>) => {
      const { conversationId } = event.detail;
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
    };

    window.addEventListener("reactChatIncomingMessage", handleIncomingMessage);
    return () => {
      window.removeEventListener("reactChatIncomingMessage", handleIncomingMessage);
    };
  }, [focusConversation, isLiveData, openConversation, scheduleMarkRead, isConsentBlocked]);

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
      });
    };
    const onNudge = (event: WindowEventMap["reactChatNudge"]) => {
      showFeatureRestrictionFromRealtime({
        abuseVector: "party_chat",
        intervention: event.detail,
        onAppeal: handlePartyChatAppeal,
      });
    };
    window.addEventListener("reactChatFeatureIntervention", onTimeout);
    window.addEventListener("reactChatNudge", onNudge);
    return () => {
      window.removeEventListener("reactChatFeatureIntervention", onTimeout);
      window.removeEventListener("reactChatNudge", onNudge);
    };
  }, [showFeatureRestrictionFromRealtime, useChatTimeouts]);

  useEffect(() => {
    if (deepLinkConsumedRef.current || chatData.isLoading || conversations.length === 0) {
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
        const result = await createOneToOneConversation(intent.userId);
        await queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
        openConversation(`conv_${result.id}`);
      } finally {
        replaceLocationRemovingChatDeepLinkParams();
      }
    };
    consumeStartIntent().catch(() => undefined);
  }, [chatData.isLoading, conversations, openConversation, queryClient]);

  // webChatRendered — one-shot, fired once the chat has rendered and event sampling is configured off
  // the conversation metadata (isMetadataLoaded, whose effect in useChatData runs earlier this
  // commit). isChatEnabled is always true here: reactChat only mounts for chat-enabled users;
  // isChatOpen mirrors the expanded (non-collapsed) chat bar.
  useEffect(() => {
    if (!chatData.isMetadataLoaded || webChatRenderedSentRef.current) {
      return;
    }
    webChatRenderedSentRef.current = true;
    sendWebChatRendered({ isChatEnabled: true, isChatOpen: !layout.isCollapsed });
  }, [chatData.isMetadataLoaded, layout.isCollapsed]);

  // webChatConversationsLoaded — one-shot, fired once the conversation list has *succeeded* (gating
  // on areConversationsLoaded, not merely !isLoading, so a failed fetch never emits a phantom empty
  // event). conversationIds are the channels-source conversation ids; friendsConversationIds are the
  // friend participant ids of the friends-source placeholders. Ids are stringified without quotes:
  // the eventstream string-array field double-parses quoted values, so they must be stripped.
  useEffect(() => {
    if (
      !chatData.isMetadataLoaded ||
      !chatData.areConversationsLoaded ||
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
    async (layoutId: string, title: string) => {
      const match = conversations.find(c => c.layoutId === layoutId);
      if (!match) {
        return;
      }
      try {
        const updated = await renameGroupConversation(match.id, title);
        const updatedTitle = updated.name ?? title;
        renameConversation(layoutId, updatedTitle);
        await queryClient.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
      } catch {
        setFeedback({
          id: Date.now(),
          type: "warning",
          message: translate("Message.Error"),
        });
      }
    },
    [conversations, queryClient, renameConversation, translate],
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

  return (
    <div className="react-chat-root fixed bottom-[0] right-[var(--margin-small)] pointer-events-none content-default">
      <div className="fixed bottom-[0] right-[calc(286px+var(--gap-small)+var(--margin-small))] flex items-end justify-end gap-small pointer-events-none">
        {dialogsToRender.map(conversation => (
          <ChatDialog
            key={conversation.id}
            conversation={conversation}
            onClose={closeConversation}
            onLeaveGroupConversation={layoutId => {
              handleLeaveGroupConversation(layoutId).catch(() => undefined);
            }}
            onToggleCollapsed={handleToggleCollapsed}
            onRenameConversation={(layoutId, title) => {
              handleRenameConversation(layoutId, title).catch(() => undefined);
            }}
            onAddFriends={(conversationId, userIds) => {
              handleAddFriends(conversationId, userIds).catch(() => undefined);
            }}
            onRemoveParticipant={(conversationId, userId) => {
              handleRemoveParticipant(conversationId, userId).catch(() => undefined);
            }}
            onSetScreen={setConversationScreen}
            onReportParticipant={reportParticipant}
            onPromoteFriendPlaceholder={handlePromoteFriendPlaceholder}
            onRemoveTrustedConnection={friendId => {
              handleRemoveTrustedConnection(friendId).catch(() => undefined);
            }}
            onOpenPartyChatRestriction={showPartyChatFeatureRestriction}
            onConsentResolved={handleConsentResolved}
            isMetadataLoaded={chatData.isMetadataLoaded}
            isConnectionLost={isConnectionLost}
          />
        ))}
        <GroupInviteDialog
          isOpen={isGroupInviteDialogOpen}
          isSubmitting={isCreatingGroup}
          onClose={closeGroupInviteDialog}
          onCreateGroup={(groupName, participantIds) => {
            handleCreateGroup(groupName, participantIds).catch(() => undefined);
          }}
        />
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
      <ChatBar
        conversations={mergedConversations}
        searchTerm={searchTerm}
        unreadConversationCount={chatData.unreadConversationCount}
        isCollapsed={layout.isCollapsed}
        isLoaded={!chatData.isLoading}
        chatDisabledReason={chatData.chatDisabledReason}
        hasNextPage={chatData.hasNextPage}
        onSearchTermChange={setSearchTerm}
        onOpenConversation={handleOpenConversation}
        onToggleCollapsed={toggleCollapsed}
        onOpenGroupInviteDialog={openGroupInviteDialog}
        onLoadMore={chatData.fetchNextPage}
      />
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
