import { useCallback, useEffect, useMemo } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatQueryKeys } from "../constants/queryKeys";
import {
  getChatMetadata,
  getConversationMetadata,
  getUserConversations,
} from "../services/chatService";
import { getUserPresences } from "../services/presenceService";
import { canFetchModerationStatusesForConversation } from "../adapters/chatPolicyAdapters";
import { configureChatEventSampling } from "../utils/chatAnalytics";
import { configureChatPerformanceSampling } from "../utils/chatTelemetry";
import { useChatMetadataConfig } from "./useChatMetadataConfig";
import type {
  TChatApiConversation,
  TGetUserConversationsResponse,
  TPresenceResponse,
} from "../types/api";
import type { TChatConversation } from "../types/chat";
import { prunePendingConversations } from "../utils/chatQueryCache";
import {
  applyPresences,
  filterRemovedFriendConversations,
  flattenConversationPages,
  pruneRemovedFriendUserIds,
} from "../utils/chatTransforms";
import { conversationsRetryDelayMs, shouldRetryConversations } from "../utils/conversationsRetry";
import { getChatDisabledReason, type TChatDisabledReason } from "../utils/chatEnabledState";
import { getCurrentUserId } from "../utils/currentUser";

export type TUseChatDataResult = {
  conversations: TChatConversation[];
  unreadConversationCount: number;
  isLoading: boolean;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  /**
   * Ids of conversations eligible for a conversation-level moderation timeout (moderated / channels;
   * not trusted_comms). AppContainer intersects this with the open dialogs to scope the timeout
   * fetch to what the user is actually viewing.
   */
  moderationEligibleIds: ReadonlySet<string>;
  /**
   * True once the conversation metadata query has resolved. The web-chat event sampling decision is
   * fixed off the same metadata (configureChatEventSampling above), so callers gate their one-shot
   * "rendered" / "conversations loaded" events on this to avoid emitting before sampling is set.
   */
  isMetadataLoaded: boolean;
  /**
   * True once the conversation-list query has *succeeded* (not merely stopped loading). Callers gate
   * the one-shot "conversations loaded" event on this so a failed fetch never emits a phantom
   * empty-list event (and never latches the one-shot ref before a later refetch succeeds).
   */
  areConversationsLoaded: boolean;
  /**
   * Why chat is disabled (region / privacy / unknown), or null when enabled. Derived from
   * `/v1/metadata`; drives the "change your privacy settings" CTA instead of the error/list.
   */
  chatDisabledReason: TChatDisabledReason | null;
};

export const useChatData = (): TUseChatDataResult => {
  const currentUserId = getCurrentUserId();
  const queryClient = useQueryClient();
  const { partyChromeDisplayTimeStampInterval, relativeValueToRecordUiPerformance } =
    useChatMetadataConfig();

  // useInfiniteQuery keeps every loaded page in the query cache (keyed by
  // chatQueryKeys.conversations()), so realtime/presence invalidations refetch all loaded
  // pages and preserve pagination depth — a plain useState page accumulator would be reset
  // to page 1 on every invalidation. It also guards against overlapping fetchNextPage calls
  // (isFetchingNextPage), which the scroll trigger fires in bursts (UBIQUITY-3100).
  const conversationsQuery = useInfiniteQuery<TGetUserConversationsResponse, Error>({
    queryKey: chatQueryKeys.conversations(),
    queryFn: ({ pageParam }: { pageParam?: string | null }) => getUserConversations(pageParam),
    getNextPageParam: lastPage => lastPage.next_cursor ?? undefined,
    // The shared queryClient disables retries; without this a flaky cold-boot fetch strands the
    // list on the loading state forever. Retry transient failures, but back off hard on a 429 and
    // never hammer a rate-limited endpoint (ROACTCHAT-2678) — see conversationsRetry.
    retry: shouldRetryConversations,
    retryDelay: conversationsRetryDelayMs,
  });
  const metadataQuery = useQuery({
    queryKey: chatQueryKeys.metadata(),
    queryFn: getConversationMetadata,
  });
  // Chat settings/metadata (`/v1/metadata`) — separate from the unread-count metadata above. This is
  // the response that carries webChatEventSampleRate and the isChatEnabled* fields. staleTime keeps
  // it from background-refetching; a chat-privacy change refreshes it by invalidating chat_settings
  // (UserSettingsChanged), which refetches regardless of staleTime. getChatMetadata sends no-cache so
  // that refetch (and a cold reload) reads fresh enablement instead of a cached "disabled" body.
  const chatSettingsQuery = useQuery({
    queryKey: chatQueryKeys.chatSettings(),
    queryFn: getChatMetadata,
    staleTime: Infinity,
  });

  // Fix the web-chat eventstream sampling decision once, when the settings metadata is known: the
  // rate is applied as `Math.random()*100 <= webChatEventSampleRate`, computed a single time.
  const webChatEventSampleRate = chatSettingsQuery.data?.webChatEventSampleRate;
  useEffect(() => {
    if (webChatEventSampleRate !== undefined) {
      configureChatEventSampling(webChatEventSampleRate);
    }
  }, [webChatEventSampleRate]);

  // Fix the UI-performance recording decision once, the same way as event sampling: recording is
  // gated by `Math.random()*100 <= relativeValueToRecordUiPerformance` (default 100 = always record).
  useEffect(() => {
    configureChatPerformanceSampling(relativeValueToRecordUiPerformance);
  }, [relativeValueToRecordUiPerformance]);

  const {
    fetchNextPage: fetchNextConversationsPage,
    hasNextPage = false,
    isFetchingNextPage,
  } = conversationsQuery;
  const fetchNextPage = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) {
      return;
    }
    fetchNextConversationsPage().catch(() => undefined);
  }, [fetchNextConversationsPage, hasNextPage, isFetchingNextPage]);

  const conversationPages = conversationsQuery.data?.pages;

  // Client-only seed of just-created conversations, never fetched (seeded/pruned via setQueryData)
  // so it survives the refetch storm after create+send that would otherwise drop the new one.
  const { data: pendingConversations } = useQuery<TChatApiConversation[]>({
    queryKey: chatQueryKeys.pendingConversations(),
    queryFn: () => [],
    initialData: [],
    staleTime: Infinity,
  });

  // Drop a seed once the server's list actually returns it, so the fresher server copy wins.
  useEffect(() => {
    if (pendingConversations.length === 0) {
      return;
    }
    const serverConversationIds = new Set(
      (conversationPages ?? []).flatMap(page =>
        page.conversations
          .map(conversation => conversation.id)
          .filter((id): id is string => id != null),
      ),
    );
    prunePendingConversations(queryClient, serverConversationIds);
  }, [conversationPages, pendingConversations.length, queryClient]);

  const baseConversations = useMemo(() => {
    // Prepend the seeds so a newly created conversation is newest and wins de-dup over any
    // stale server copy; flattenConversationPages de-dupes by id (first occurrence wins).
    const pendingPage: TGetUserConversationsResponse[] =
      pendingConversations.length > 0
        ? [{ conversations: pendingConversations, next_cursor: null }]
        : [];
    return flattenConversationPages(
      [...pendingPage, ...(conversationPages ?? [])],
      currentUserId,
      partyChromeDisplayTimeStampInterval,
    );
  }, [conversationPages, pendingConversations, currentUserId, partyChromeDisplayTimeStampInterval]);

  // Unfriended/blocked users whose 1:1 stays in the server list until the removal propagates. Never
  // fetched — added via setQueryData in the realtime dispatcher — so it filters durably.
  const { data: removedFriendUserIds } = useQuery<number[]>({
    queryKey: chatQueryKeys.removedFriendUserIds(),
    queryFn: () => [],
    initialData: [],
    staleTime: Infinity,
  });

  // Drop a tombstone once the server stops returning that user's 1:1 (removal has propagated).
  useEffect(() => {
    if (conversationPages == null || removedFriendUserIds.length === 0) {
      return;
    }
    const pruned = pruneRemovedFriendUserIds(removedFriendUserIds, baseConversations);
    if (pruned !== removedFriendUserIds) {
      queryClient.setQueryData(chatQueryKeys.removedFriendUserIds(), pruned);
    }
  }, [baseConversations, conversationPages, removedFriendUserIds, queryClient]);

  const removedFriendUserIdSet = useMemo(
    () => new Set(removedFriendUserIds),
    [removedFriendUserIds],
  );
  const visibleConversations = useMemo(
    () => filterRemovedFriendConversations(baseConversations, removedFriendUserIdSet),
    [baseConversations, removedFriendUserIdSet],
  );
  const participantIds = useMemo(
    () => [
      ...new Set(
        visibleConversations.flatMap(conversation =>
          conversation.participants.map(participant => participant.id),
        ),
      ),
    ],
    [visibleConversations],
  );
  const presenceKeyHash = useMemo(
    () => participantIds.toSorted((a, b) => a - b).join(","),
    [participantIds],
  );
  const presenceQuery = useQuery<TPresenceResponse, Error>({
    queryKey: chatQueryKeys.presence(presenceKeyHash),
    queryFn: () => getUserPresences(participantIds),
    enabled: participantIds.length > 0,
  });
  const presencesByUserId = useMemo(
    () =>
      Object.fromEntries(
        presenceQuery.data?.userPresences.map(presence => [
          presence.userId,
          presence.userPresenceType,
        ]) ?? [],
      ),
    [presenceQuery.data?.userPresences],
  );
  const moderationEligibleIds = useMemo(() => {
    const ids = new Set<string>();
    for (const page of conversationPages ?? []) {
      for (const conversation of page.conversations) {
        if (conversation.id != null && canFetchModerationStatusesForConversation(conversation)) {
          ids.add(conversation.id);
        }
      }
    }
    return ids;
  }, [conversationPages]);

  const conversations = useMemo(
    () => applyPresences(visibleConversations, presencesByUserId),
    [visibleConversations, presencesByUserId],
  );

  return {
    conversations,
    unreadConversationCount: metadataQuery.data?.global_unread_message_count ?? 0,
    // status==='loading' — true only during the initial fetch (no data yet), false once it succeeds
    // OR errors. The bar shows the spinner only while this is true; a settled fetch (empty success or
    // a failed cold boot) shows the empty "make friends" state, never a spinner or error (QALC-1437).
    isLoading: conversationsQuery.isLoading,
    fetchNextPage,
    hasNextPage,
    moderationEligibleIds,
    isMetadataLoaded: chatSettingsQuery.data !== undefined,
    areConversationsLoaded: conversationsQuery.isSuccess,
    chatDisabledReason: getChatDisabledReason(chatSettingsQuery.data),
  };
};
