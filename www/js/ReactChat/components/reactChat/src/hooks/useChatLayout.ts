import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { TChatConversation, TChatLayoutState, TDialogScreen } from "../types/chat";
import {
  readPersistedChatLayout,
  reconcilePersistedLayoutIds,
  writePersistedChatLayout,
} from "../utils/chatLayoutStorage";
import type { TTypingEventDetail } from "../utils/chatRealtimeEvents";
import { getCurrentUserId } from "../utils/currentUser";
import { useChatMetadataConfig } from "./useChatMetadataConfig";

export type TUseChatLayoutResult = {
  layout: TChatLayoutState;
  conversations: TChatConversation[];
  openConversation: (layoutId: string) => void;
  closeConversation: (layoutId: string) => void;
  toggleConversationCollapsed: (layoutId: string) => void;
  focusConversation: (layoutId: string) => void;
  renameConversation: (layoutId: string, title: string) => void;
  setConversationScreen: (layoutId: string, screen: TDialogScreen) => void;
  /** Routes the dialog to the in-app abuse-report confirmation screen for a specific participant. */
  reportParticipant: (layoutId: string, participantId: number) => void;
  /** Clears the blocking consent flags after the user accepts the group-OSA / U13 opt-in modal. */
  resolveConsent: (layoutId: string) => void;
  toggleCollapsed: () => void;
  openGroupInviteDialog: () => void;
  closeGroupInviteDialog: () => void;
};

const CHAT_BAR_WIDTH_PX = 286;
const CHAT_DIALOG_WIDTH_PX = 260;
const GAP_PX = 8;
const PAGE_MARGIN_PX = 8;
// Room kept to the left of the visible dialogs for the count-bubble minimized tray and its
// left-opening popover. Must be ≥ the popover width (220px, .react-chat-minimized-list) plus the
// page margin so the bubble stays far enough from the left edge for the list to open without
// clipping — the invariant legacy held (widthOfDialogMinimize == .minimize-list width). Like legacy,
// this trades one visible dialog for a popover that never runs off-screen (3 fit at 1500px).
const MINIMIZED_TRAY_RESERVE_PX = 228;

const getMaxVisiblePanelCount = () => {
  if (typeof window === "undefined") {
    return 1;
  }

  const availableWidth =
    window.innerWidth - CHAT_BAR_WIDTH_PX - PAGE_MARGIN_PX - GAP_PX - MINIMIZED_TRAY_RESERVE_PX;
  return Math.max(1, Math.floor((availableWidth + GAP_PX) / (CHAT_DIALOG_WIDTH_PX + GAP_PX)));
};

const getInitialOpenedConversationLayoutIds = (conversations: TChatConversation[]) =>
  conversations
    .filter(conversation => conversation.isOpen && !conversation.isMinimized)
    .map(conversation => conversation.layoutId);

const moveLayoutIdToNewest = (layoutIds: string[], layoutId: string) => [
  ...layoutIds.filter(currentLayoutId => currentLayoutId !== layoutId),
  layoutId,
];

/** Append still-pending restore ids that have not loaded yet, so persistence never drops them. */
const unionWithPending = (liveIds: string[], pendingIds: string[] = []): string[] => [
  ...liveIds,
  ...pendingIds.filter(layoutId => !liveIds.includes(layoutId)),
];

export const useChatLayout = (sourceConversations: TChatConversation[]): TUseChatLayoutResult => {
  const { typingInChatForReceiverExpirationMs } = useChatMetadataConfig();
  const [layout, setLayout] = useState<TChatLayoutState>({
    isCollapsed: true,
    focusedLayoutId:
      sourceConversations.find(conversation => conversation.isFocused)?.layoutId ?? null,
    conversationInviteDialogLayoutId: null,
    maxVisiblePanelCount: getMaxVisiblePanelCount(),
    openedConversationLayoutIds: getInitialOpenedConversationLayoutIds(sourceConversations),
  });
  const [conversationOverrides, setConversationOverrides] = useState<
    Record<string, Partial<TChatConversation>>
  >({});
  const currentUserIdRef = useRef(getCurrentUserId());
  const hasHydratedRef = useRef(false);
  const hasLoadedPersistedRef = useRef(false);
  const pendingRestoreRef = useRef<{
    openedConversationLayoutIds: string[];
    minimizedConversationLayoutIds: string[];
    collapsedConversationLayoutIds: string[];
    focusedLayoutId: string | null;
  } | null>(null);
  const lastPersistedRef = useRef<string | null>(null);

  const conversations = useMemo(
    () =>
      sourceConversations.map(conversation => {
        const merged = {
          ...conversation,
          ...conversationOverrides[conversation.layoutId],
          isFocused: layout.focusedLayoutId === conversation.layoutId,
        };

        // A collapsed dialog (header only) hides its messages, so it is not "read" yet — keep its
        // unread count so the header shows a badge and expanding it can mark it read (legacy parity).
        if (merged.isOpen && !merged.isMinimized && !merged.isCollapsed) {
          return { ...merged, unreadCount: 0 };
        }

        return merged;
      }),
    [conversationOverrides, layout.focusedLayoutId, sourceConversations],
  );

  // Restore dialogs that were open before the last reload. The conversation list can arrive
  // incrementally, so hold the full restore target in memory and restore each persisted dialog
  // as its conversation appears — each once — instead of a single pass that would drop
  // conversations that had not loaded yet.
  useLayoutEffect(() => {
    if (sourceConversations.length === 0) {
      return;
    }

    if (!hasLoadedPersistedRef.current) {
      hasLoadedPersistedRef.current = true;
      hasHydratedRef.current = true;
      // Resolve the user id here (conversations have loaded, so auth is ready) rather
      // than trusting the mount-time value, which can be null before auth resolves and
      // would strand every read/write on the shared "anonymous" bucket.
      currentUserIdRef.current = getCurrentUserId();
      const persisted = readPersistedChatLayout(currentUserIdRef.current);
      if (persisted) {
        pendingRestoreRef.current = {
          openedConversationLayoutIds: persisted.openedConversationLayoutIds,
          minimizedConversationLayoutIds: persisted.minimizedConversationLayoutIds,
          collapsedConversationLayoutIds: persisted.collapsedConversationLayoutIds ?? [],
          focusedLayoutId: persisted.focusedLayoutId,
        };
        setLayout(current => ({ ...current, isCollapsed: persisted.isCollapsed }));
      }
    }

    const pending = pendingRestoreRef.current;
    if (!pending) {
      return;
    }

    // Restore any persisted dialog whose conversation currently exists — including
    // friend-started placeholders (source "friends", conv_friends-* ids), which are
    // real open windows the user had up. Ids with no conversation yet stay pending
    // until their page loads.
    const restorableLayoutIds = new Set(
      sourceConversations.map(conversation => conversation.layoutId),
    );
    const openedToRestore = reconcilePersistedLayoutIds(
      pending.openedConversationLayoutIds,
      restorableLayoutIds,
    );
    const minimizedToRestore = reconcilePersistedLayoutIds(
      pending.minimizedConversationLayoutIds,
      restorableLayoutIds,
    );
    // Collapsed dialogs are a subset of the opened (open-intent) list, so they restore via
    // openedToRestore and just need isCollapsed re-applied.
    const collapsedToRestore = new Set(
      reconcilePersistedLayoutIds(pending.collapsedConversationLayoutIds, restorableLayoutIds),
    );
    if (openedToRestore.length === 0 && minimizedToRestore.length === 0) {
      return;
    }

    const focusedToRestore =
      pending.focusedLayoutId != null && restorableLayoutIds.has(pending.focusedLayoutId)
        ? pending.focusedLayoutId
        : null;

    pending.openedConversationLayoutIds = pending.openedConversationLayoutIds.filter(
      layoutId => !restorableLayoutIds.has(layoutId),
    );
    pending.minimizedConversationLayoutIds = pending.minimizedConversationLayoutIds.filter(
      layoutId => !restorableLayoutIds.has(layoutId),
    );
    pending.collapsedConversationLayoutIds = pending.collapsedConversationLayoutIds.filter(
      layoutId => !restorableLayoutIds.has(layoutId),
    );
    if (focusedToRestore != null) {
      pending.focusedLayoutId = null;
    }
    if (
      pending.openedConversationLayoutIds.length === 0 &&
      pending.minimizedConversationLayoutIds.length === 0
    ) {
      pendingRestoreRef.current = null;
    }

    // Opened dialogs go back on the open-intent list (the width effect decides which
    // are visible vs parked); manually minimized dialogs stay off the list so they
    // remain minimized regardless of viewport width.
    setConversationOverrides(current => {
      const next = { ...current };
      openedToRestore.forEach(layoutId => {
        next[layoutId] = {
          ...next[layoutId],
          isOpen: true,
          isMinimized: false,
          isCollapsed: collapsedToRestore.has(layoutId),
        };
      });
      minimizedToRestore.forEach(layoutId => {
        next[layoutId] = { ...next[layoutId], isOpen: true, isMinimized: true };
      });
      return next;
    });
    setLayout(current => ({
      ...current,
      focusedLayoutId: focusedToRestore ?? current.focusedLayoutId,
      openedConversationLayoutIds: [
        ...current.openedConversationLayoutIds.filter(
          layoutId => !openedToRestore.includes(layoutId),
        ),
        ...openedToRestore,
      ],
    }));
  }, [sourceConversations]);

  // Persist open/minimized dialog state (after hydration) so it survives a reload.
  useEffect(() => {
    if (!hasHydratedRef.current || currentUserIdRef.current == null) {
      return;
    }

    // Persist only MANUALLY minimized dialogs (open + minimized, but not on the
    // open-intent list). Width-overflow minimized dialogs stay on
    // openedConversationLayoutIds and are re-derived from the viewport on reload, so a
    // wider reload reopens them instead of freezing them minimized.
    const openedLayoutIdSet = new Set(layout.openedConversationLayoutIds);
    const manuallyMinimizedLayoutIds = conversations
      .filter(
        conversation =>
          conversation.isOpen &&
          conversation.isMinimized &&
          !openedLayoutIdSet.has(conversation.layoutId),
      )
      .map(conversation => conversation.layoutId);

    // Dialogs collapsed in place (header only) so they reload collapsed, matching legacy chat.
    const collapsedLayoutIds = conversations
      .filter(conversation => conversation.isOpen && conversation.isCollapsed === true)
      .map(conversation => conversation.layoutId);

    // Dialogs whose conversations have not loaded yet are still held in
    // pendingRestoreRef. Union them into what we persist so an early reload — before
    // later conversation pages arrive — cannot drop them from storage (this is what
    // made only a subset of dialogs survive a reload).
    const pending = pendingRestoreRef.current;
    const openedConversationLayoutIds = unionWithPending(
      layout.openedConversationLayoutIds,
      pending?.openedConversationLayoutIds,
    );
    const openedFinalSet = new Set(openedConversationLayoutIds);
    const nextLayout = {
      openedConversationLayoutIds,
      // A dialog is either open or minimized, never both — the opened list wins so a
      // dialog can't be written to both lists (and then restored as frozen-minimized).
      minimizedConversationLayoutIds: unionWithPending(
        manuallyMinimizedLayoutIds,
        pending?.minimizedConversationLayoutIds,
      ).filter(layoutId => !openedFinalSet.has(layoutId)),
      // Only persist collapse for dialogs we're keeping open — a collapsed dialog is always on the
      // opened list, so this drops any stale id that isn't.
      collapsedConversationLayoutIds: unionWithPending(
        collapsedLayoutIds,
        pending?.collapsedConversationLayoutIds,
      ).filter(layoutId => openedFinalSet.has(layoutId)),
      focusedLayoutId: layout.focusedLayoutId ?? pending?.focusedLayoutId ?? null,
      isCollapsed: layout.isCollapsed,
    };

    const serialized = JSON.stringify(nextLayout);
    if (serialized === lastPersistedRef.current) {
      return;
    }
    lastPersistedRef.current = serialized;
    writePersistedChatLayout(currentUserIdRef.current, nextLayout);
  }, [
    conversations,
    layout.isCollapsed,
    layout.focusedLayoutId,
    layout.openedConversationLayoutIds,
  ]);

  useLayoutEffect(() => {
    const updateMaxVisiblePanelCount = () => {
      setLayout(current => ({
        ...current,
        maxVisiblePanelCount: getMaxVisiblePanelCount(),
      }));
    };

    window.addEventListener("resize", updateMaxVisiblePanelCount);

    return () => {
      window.removeEventListener("resize", updateMaxVisiblePanelCount);
    };
  }, []);

  useLayoutEffect(() => {
    const timers = new Map<string, number>();

    const clearTyping = (layoutId: string, userId: number) => {
      setConversationOverrides(current => {
        const currentTypingParticipantIds = current[layoutId]?.typingParticipantIds ?? [];
        const typingParticipantIds = currentTypingParticipantIds.filter(
          typingParticipantId => typingParticipantId !== userId,
        );

        return {
          ...current,
          [layoutId]: {
            ...current[layoutId],
            isTyping: typingParticipantIds.length > 0,
            typingParticipantIds,
          },
        };
      });
    };

    const clearAllTyping = (layoutId: string) => {
      for (const [timerKey, timer] of timers.entries()) {
        if (timerKey.startsWith(`${layoutId}:`)) {
          window.clearTimeout(timer);
          timers.delete(timerKey);
        }
      }

      setConversationOverrides(current => ({
        ...current,
        [layoutId]: {
          ...current[layoutId],
          isTyping: false,
          typingParticipantIds: [],
        },
      }));
    };

    const handleTyping = (event: CustomEvent<TTypingEventDetail>) => {
      const { conversationId, userId, isTyping = true } = event.detail;
      if (!conversationId) {
        return;
      }

      const layoutId = `conv_${conversationId}`;

      if (!isTyping) {
        if (userId == null) {
          clearAllTyping(layoutId);
        } else {
          const timerKey = `${layoutId}:${userId}`;
          window.clearTimeout(timers.get(timerKey));
          timers.delete(timerKey);
          clearTyping(layoutId, userId);
        }
        return;
      }

      if (userId == null) {
        return;
      }

      const timerKey = `${layoutId}:${userId}`;
      window.clearTimeout(timers.get(timerKey));

      setConversationOverrides(current => {
        const currentTypingParticipantIds = current[layoutId]?.typingParticipantIds ?? [];
        const typingParticipantIds = currentTypingParticipantIds.includes(userId)
          ? currentTypingParticipantIds
          : [...currentTypingParticipantIds, userId];

        return {
          ...current,
          [layoutId]: {
            ...current[layoutId],
            isTyping: true,
            typingParticipantIds,
          },
        };
      });

      timers.set(
        timerKey,
        window.setTimeout(() => {
          clearTyping(layoutId, userId);
          timers.delete(timerKey);
        }, typingInChatForReceiverExpirationMs),
      );
    };

    window.addEventListener("reactChatTyping", handleTyping);

    return () => {
      window.removeEventListener("reactChatTyping", handleTyping);
      timers.forEach(timer => {
        window.clearTimeout(timer);
      });
    };
  }, [typingInChatForReceiverExpirationMs]);

  useLayoutEffect(() => {
    const conversationSlotCount = Math.max(
      0,
      layout.maxVisiblePanelCount - (layout.conversationInviteDialogLayoutId ? 1 : 0),
    );
    const openedLayoutIds = layout.openedConversationLayoutIds;
    // The newest `conversationSlotCount` opened chats stay visible; anything older is
    // parked in the minimized tray. Visibility is derived purely from width here — the
    // open-intent list is never trimmed — so widening the window automatically brings
    // parked dialogs back, while chats the user minimized manually (removed from this
    // list) stay minimized.
    const visibleLayoutIdSet = new Set(
      openedLayoutIds.slice(Math.max(0, openedLayoutIds.length - conversationSlotCount)),
    );

    setConversationOverrides(current => {
      const staleLayoutIds = openedLayoutIds.filter(layoutId => {
        const existing = current[layoutId] as Partial<TChatConversation> | undefined;
        const shouldMinimize = !visibleLayoutIdSet.has(layoutId);
        return !existing?.isOpen || (existing.isMinimized ?? false) !== shouldMinimize;
      });
      if (staleLayoutIds.length === 0) {
        return current;
      }

      const next = { ...current };
      staleLayoutIds.forEach(layoutId => {
        const existing = current[layoutId] as Partial<TChatConversation> | undefined;
        const shouldMinimize = !visibleLayoutIdSet.has(layoutId);
        next[layoutId] = {
          ...existing,
          isOpen: true,
          isMinimized: shouldMinimize,
          currentScreen: shouldMinimize ? "Default" : (existing?.currentScreen ?? "Default"),
        };
      });
      return next;
    });
    setLayout(current => {
      const focusedIsParked =
        current.focusedLayoutId != null &&
        openedLayoutIds.includes(current.focusedLayoutId) &&
        !visibleLayoutIdSet.has(current.focusedLayoutId);
      return focusedIsParked
        ? { ...current, focusedLayoutId: openedLayoutIds.at(-1) ?? null }
        : current;
    });
  }, [
    layout.conversationInviteDialogLayoutId,
    layout.maxVisiblePanelCount,
    layout.openedConversationLayoutIds,
  ]);

  const openConversation = useCallback((layoutId: string) => {
    setConversationOverrides(current => ({
      ...current,
      [layoutId]: {
        ...current[layoutId],
        currentScreen: "Default",
        isOpen: true,
        isMinimized: false,
        isCollapsed: false,
      },
    }));
    setLayout(current => ({
      ...current,
      conversationInviteDialogLayoutId:
        current.conversationInviteDialogLayoutId && current.maxVisiblePanelCount <= 1
          ? null
          : current.conversationInviteDialogLayoutId,
      focusedLayoutId: layoutId,
      openedConversationLayoutIds: moveLayoutIdToNewest(
        current.openedConversationLayoutIds,
        layoutId,
      ),
    }));
  }, []);

  const closeConversation = useCallback((layoutId: string) => {
    setConversationOverrides(current => ({
      ...current,
      [layoutId]: {
        ...current[layoutId],
        currentScreen: "Default",
        isOpen: false,
        isMinimized: false,
      },
    }));
    setLayout(current => ({
      ...current,
      focusedLayoutId: current.focusedLayoutId === layoutId ? null : current.focusedLayoutId,
      openedConversationLayoutIds: current.openedConversationLayoutIds.filter(
        currentLayoutId => currentLayoutId !== layoutId,
      ),
    }));
  }, []);

  // Collapse in place (header only, stays in the row), toggled from the dialog header — parity with
  // legacy web chat. Minimize-to-tray is width-overflow only, so this never leaves the open list.
  const toggleConversationCollapsed = useCallback((layoutId: string) => {
    setConversationOverrides(current => ({
      ...current,
      [layoutId]: {
        ...current[layoutId],
        isCollapsed: !current[layoutId]?.isCollapsed,
      },
    }));
  }, []);

  const focusConversation = useCallback((layoutId: string) => {
    setConversationOverrides(current => ({
      ...current,
      [layoutId]: {
        ...current[layoutId],
        isOpen: true,
        isMinimized: false,
        isCollapsed: false,
      },
    }));
    setLayout(current => ({
      ...current,
      conversationInviteDialogLayoutId:
        current.conversationInviteDialogLayoutId && current.maxVisiblePanelCount <= 1
          ? null
          : current.conversationInviteDialogLayoutId,
      focusedLayoutId: layoutId,
      openedConversationLayoutIds: moveLayoutIdToNewest(
        current.openedConversationLayoutIds,
        layoutId,
      ),
    }));
  }, []);

  const renameConversation = useCallback((layoutId: string, title: string) => {
    setConversationOverrides(current => ({
      ...current,
      [layoutId]: {
        ...current[layoutId],
        title,
      },
    }));
  }, []);

  const setConversationScreen = useCallback((layoutId: string, screen: TDialogScreen) => {
    setConversationOverrides(current => ({
      ...current,
      [layoutId]: {
        ...current[layoutId],
        currentScreen: screen,
        // Leaving any screen clears the abuse-report target; routing INTO the confirmation goes
        // through reportParticipant, which sets it.
        abuseReportTargetId: undefined,
        isOpen: true,
        isMinimized: false,
      },
    }));
    // Focus the dialog but keep its position — navigating an already-open dialog to another screen
    // must not reorder it to the newest slot, which would shift it to the far left.
    setLayout(current => ({
      ...current,
      focusedLayoutId: layoutId,
    }));
  }, []);

  const reportParticipant = useCallback((layoutId: string, participantId: number) => {
    setConversationOverrides(current => ({
      ...current,
      [layoutId]: {
        ...current[layoutId],
        currentScreen: "AbuseReportConfirmation",
        abuseReportTargetId: participantId,
        isOpen: true,
        isMinimized: false,
      },
    }));
    // Focus but keep position (see setConversationScreen) — navigating screens must not reorder.
    setLayout(current => ({
      ...current,
      focusedLayoutId: layoutId,
    }));
  }, []);

  const resolveConsent = useCallback((layoutId: string) => {
    setConversationOverrides(current => ({
      ...current,
      [layoutId]: {
        ...current[layoutId],
        isGroupOsaUnacknowledged: false,
        isChatOptInBlocked: false,
      },
    }));
  }, []);

  const toggleCollapsed = useCallback(() => {
    setLayout(current => ({ ...current, isCollapsed: !current.isCollapsed }));
  }, []);

  const openGroupInviteDialog = useCallback(() => {
    setLayout(current => ({
      ...current,
      conversationInviteDialogLayoutId: "new-group",
    }));
  }, []);

  const closeGroupInviteDialog = useCallback(() => {
    setLayout(current => ({
      ...current,
      conversationInviteDialogLayoutId: null,
    }));
  }, []);

  return {
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
  };
};
