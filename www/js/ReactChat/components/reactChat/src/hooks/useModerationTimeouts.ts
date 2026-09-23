import { useCallback, useEffect, useMemo, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { chatQueryKeys } from "../constants/queryKeys";
import { getChatModerationStatuses } from "../services/chatService";
import {
  buildModerationTimeoutMap,
  resolveConversationTimeout,
  type TChatModerationStatusesResponse,
  type TModerationTimeoutMap,
  type TResolvedTimeout,
} from "../adapters/chatModerationAdapters";
import { useChatUiPolicies } from "./useChatUiPolicies";

const EMPTY_MAP: TModerationTimeoutMap = {
  userTimedOutUntil: null,
  conversationTimedOutUntilById: new Map(),
};

const NOT_TIMED_OUT: TResolvedTimeout = { isTimedOut: false, expiresAtMs: null };

const MODERATION_TIMEOUTS_KEY_PREFIX = [...chatQueryKeys.all, "moderationTimeouts"] as const;

export type TUseModerationTimeoutsResult = {
  /** Resolves the effective timeout for one conversation (honors trusted_comms exemption + scoping). */
  resolveTimeout: (conversationId: string, moderationType: string | undefined) => TResolvedTimeout;
  /**
   * Fetches moderation statuses and returns the response data. When forceFresh is true, it cancels
   * any in-flight fetch for the current key and issues a new request instead of deduping onto
   * the stale one. retry is the number of times the POST request is re-attempted on failure.
   */
  refreshModerationStatuses: (options?: {
    forceFresh?: boolean;
    retry?: number;
    staleTime?: number;
  }) => Promise<TChatModerationStatusesResponse | undefined>;
};

const soonestFutureEndMs = (map: TModerationTimeoutMap, nowMs: number): number | null => {
  let soonest: number | null = null;
  const consider = (date: Date | null | undefined) => {
    if (!date) return;
    const ms = date.getTime();
    if (ms > nowMs && (soonest === null || ms < soonest)) {
      soonest = ms;
    }
  };
  consider(map.userTimedOutUntil?.endDate);
  for (const until of map.conversationTimedOutUntilById.values()) {
    consider(until);
  }
  return soonest;
};

/**
 * Owns the moderation-timeout state, gated by the `useChatTimeouts` rollout. Seeds a timeout map
 * from `get-chat-moderation-statuses` — the response's `user_timeout_range` is a **user-level**
 * timeout that applies to every non–trusted-comms conversation, so we fetch it even with no
 * conversation ids; `conversation_timeout_ranges` are per-conversation (callers pass the open
 * dialogs' channel ids). A realtime `FeatureIntervention` or acknowledgeable nudge refetches the
 * authoritative timeout rather than merging the notification payload into the store. A timer causes
 * a refetch of the moderation statuses (calls getChatModerationStatuses) at the next expiry so
 * the server decides whether to clear the restriction.
 */
export const useModerationTimeouts = (conversationIds: string[]): TUseModerationTimeoutsResult => {
  const { useChatTimeouts } = useChatUiPolicies();
  const queryClient = useQueryClient();

  const idsKey = useMemo(() => conversationIds.toSorted().join(","), [conversationIds]);
  const idsKeyRef = useRef(idsKey);
  idsKeyRef.current = idsKey;
  const conversationIdsRef = useRef(conversationIds);
  conversationIdsRef.current = conversationIds;

  const statusesQuery = useQuery({
    queryKey: chatQueryKeys.moderationTimeouts(idsKey),
    queryFn: () => getChatModerationStatuses(conversationIds),
    // Fetch whenever the rollout is on — a user-level timeout must be known even with no
    // conversation ids (e.g. only the friends placeholder is open).
    enabled: useChatTimeouts,
    staleTime: 60_000,
    // Keep the previous user-level result while a key change (conversation open/close) refetches,
    // so the known restriction doesn't briefly disappear and the chat bar is briefly enabled.
    keepPreviousData: true,
  });

  // dataUpdatedAt is included so that an expiry refetch returning identical JSON is still reprocessed
  // with the current time. The map only re-evaluates when the query data changes — a time-based
  // block clears solely on the authoritative refetch (the server decides whether it cleared), never
  // on the local clock alone.
  const timeoutMap = useMemo(
    () =>
      useChatTimeouts && statusesQuery.data
        ? buildModerationTimeoutMap(statusesQuery.data, new Date())
        : EMPTY_MAP,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [useChatTimeouts, statusesQuery.data, statusesQuery.dataUpdatedAt],
  );

  const refreshModerationStatuses = useCallback(
    async (options?: { forceFresh?: boolean; retry?: number; staleTime?: number }) => {
      if (!useChatTimeouts) return undefined;
      // Read the current key/ids from refs so that it reads the correct ids and keys even when
      // the UFR dialog is open and the open conversations/chat bar state changes (e.g. user gets
      // kicked out of a conversation while the UFR dialog is open).
      const currentIdsKey = idsKeyRef.current;
      const currentConversationIds = conversationIdsRef.current;
      // Drop everything that isn't the current key.
      queryClient.removeQueries({
        queryKey: MODERATION_TIMEOUTS_KEY_PREFIX,
        predicate: query => query.queryKey.at(-1) !== currentIdsKey,
      });

      // If a user acknowledges a restriction, then a call to getChatModerationStatuses is made. If
      // there's already a call to getChatModerationStatuses in flight, the response from the call in
      // flight will be returned. However, the call in-flight was made before the user acknowledged the
      // restriction so it'll return the wrong response. Thus, we must cancel that call, so we can get a
      // fresh response from the server that reflects the user's acknowledgement.
      if (options?.forceFresh) {
        await queryClient.cancelQueries({
          queryKey: chatQueryKeys.moderationTimeouts(currentIdsKey),
        });
      }

      return queryClient.fetchQuery({
        queryKey: chatQueryKeys.moderationTimeouts(currentIdsKey),
        queryFn: () => getChatModerationStatuses(currentConversationIds),
        staleTime: options?.staleTime ?? 0,
        // Only calls made after a user acknowledges a restriction retry. Realtime/expiry-timer
        // callers don't retry.
        retry: options?.retry ?? false,
      });
    },
    [useChatTimeouts, queryClient],
  );

  // Realtime FeatureIntervention timeouts and acknowledgeable nudges signal a refetch:
  // the authoritative user/conversation timeout is read back from get-chat-moderation-statuses.
  // The UFR dialog opens immediately off the same event in AppContainer, so UX isn't gated on
  // the refetch.
  useEffect(() => {
    if (!useChatTimeouts) {
      return undefined;
    }
    // A realtime event means the server state just changed, so we must refetch with forceFresh as
    // true to get the updated response from the server.
    const onFeatureIntervention = () => {
      refreshModerationStatuses({ forceFresh: true }).catch((): undefined => undefined);
    };
    const onNudge = (event: WindowEventMap["reactChatNudge"]) => {
      if (event.detail.acknowledgeable) {
        refreshModerationStatuses({ forceFresh: true }).catch((): undefined => undefined);
      }
    };
    window.addEventListener("reactChatFeatureIntervention", onFeatureIntervention);
    window.addEventListener("reactChatNudge", onNudge);
    return () => {
      window.removeEventListener("reactChatFeatureIntervention", onFeatureIntervention);
      window.removeEventListener("reactChatNudge", onNudge);
    };
  }, [useChatTimeouts, refreshModerationStatuses]);

  // Refetch at the soonest future expiry so the server decides whether the restriction clears.
  // Fires once, refetches, and schedules the next only if the new response has another
  // future expiry. On failure, the confirmed block stays until another lifecycle event (until
  // a new timeout is received or expires so timeoutMap updates).
  useEffect(() => {
    const soonest = soonestFutureEndMs(timeoutMap, Date.now());
    if (soonest === null) {
      return undefined;
    }
    const timerId = window.setTimeout(
      () => {
        refreshModerationStatuses().catch((): undefined => undefined);
      },
      // window.setTimeout stores its delay as a 32-bit signed int, and an overflowing delay fires it
      // immediately. The longest timeout is 14 days, far from overflowing the 32-bit int. However, if
      // timeouts ever exceed the 32-bit signed int, we should clamp it.
      Math.max(0, soonest - Date.now()) + 250,
    );
    return () => {
      window.clearTimeout(timerId);
    };
  }, [timeoutMap, refreshModerationStatuses]);

  const resolveTimeout = useCallback(
    (conversationId: string, moderationType: string | undefined): TResolvedTimeout =>
      useChatTimeouts
        ? resolveConversationTimeout(conversationId, moderationType, timeoutMap, new Date())
        : NOT_TIMED_OUT,
    [useChatTimeouts, timeoutMap],
  );

  return { resolveTimeout, refreshModerationStatuses };
};

export default useModerationTimeouts;
