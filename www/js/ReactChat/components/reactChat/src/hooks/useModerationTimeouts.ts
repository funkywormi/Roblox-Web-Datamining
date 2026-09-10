import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { chatQueryKeys } from "../constants/queryKeys";
import { getChatModerationStatuses } from "../services/chatService";
import {
  buildModerationTimeoutMap,
  resolveConversationTimeout,
  type TModerationTimeoutMap,
  type TResolvedTimeout,
} from "../adapters/chatModerationAdapters";
import { useChatUiPolicies } from "./useChatUiPolicies";

const EMPTY_MAP: TModerationTimeoutMap = {
  userTimedOutUntil: null,
  conversationTimedOutUntilById: new Map(),
};

const NOT_TIMED_OUT: TResolvedTimeout = { isTimedOut: false, expiresAtMs: null };

// Prefix matching every moderation-timeout query regardless of its conversation-id set, so a
// realtime FeatureIntervention invalidates whichever variant is currently active.
const MODERATION_TIMEOUTS_KEY_PREFIX = [...chatQueryKeys.all, "moderationTimeouts"] as const;

export type TUseModerationTimeoutsResult = {
  /** Resolves the effective timeout for one conversation (honors trusted_comms exemption + scoping). */
  resolveTimeout: (conversationId: string, moderationType: string | undefined) => TResolvedTimeout;
};

const soonestFutureEndMs = (map: TModerationTimeoutMap, nowMs: number): number | null => {
  let soonest: number | null = null;
  const consider = (date: Date | null) => {
    if (date === null) return;
    const ms = date.getTime();
    if (ms > nowMs && (soonest === null || ms < soonest)) {
      soonest = ms;
    }
  };
  consider(map.userTimedOutUntil);
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
 * dialogs' channel ids). A realtime `FeatureIntervention` invalidates the query to refetch the
 * authoritative timeout rather than merging the notification payload into the store. A timer forces
 * a re-render at the next expiry so a timed-out input re-enables on time without a refetch.
 */
export const useModerationTimeouts = (conversationIds: string[]): TUseModerationTimeoutsResult => {
  const { useChatTimeouts } = useChatUiPolicies();
  const queryClient = useQueryClient();
  // Bumped only to force a re-render when a timeout crosses its expiry; the value is never read for
  // logic. Every time comparison below uses Date.now()/new Date() fresh, so there's no stored clock
  // that can go stale.
  const [expiryTick, setExpiryTick] = useState(0);

  const idsKey = useMemo(() => conversationIds.toSorted().join(","), [conversationIds]);
  const statusesQuery = useQuery({
    queryKey: chatQueryKeys.moderationTimeouts(idsKey),
    queryFn: () => getChatModerationStatuses(conversationIds),
    // Fetch whenever the rollout is on — a user-level timeout must be known even with no
    // conversation ids (e.g. only the friends placeholder is open).
    enabled: useChatTimeouts,
    staleTime: 60_000,
  });

  const timeoutMap = useMemo(
    () =>
      useChatTimeouts && statusesQuery.data
        ? buildModerationTimeoutMap(statusesQuery.data, new Date())
        : EMPTY_MAP,
    [useChatTimeouts, statusesQuery.data],
  );

  // Realtime FeatureIntervention timeouts signal a refetch (not a client-side merge): the
  // authoritative user/conversation timeout is read back from get-chat-moderation-statuses. The
  // UFR dialog opens immediately off the same event in AppContainer, so UX isn't gated on
  // the refetch.
  useEffect(() => {
    if (!useChatTimeouts) {
      return undefined;
    }
    const onFeatureIntervention = () => {
      queryClient
        .invalidateQueries({ queryKey: MODERATION_TIMEOUTS_KEY_PREFIX })
        .catch((): undefined => undefined);
    };
    window.addEventListener("reactChatFeatureIntervention", onFeatureIntervention);
    return () => {
      window.removeEventListener("reactChatFeatureIntervention", onFeatureIntervention);
    };
  }, [useChatTimeouts, queryClient]);

  // Re-render at the soonest future expiry so the disabled input clears on time (no refetch). The
  // delay is relative to the real wall clock; expiryTick is in the deps so that after one timeout
  // expires this effect re-runs and schedules the timer for the *next* one (timeoutMap alone is
  // unchanged by the passage of time, so it can't drive that).
  useEffect(() => {
    const soonest = soonestFutureEndMs(timeoutMap, Date.now());
    if (soonest === null) {
      return undefined;
    }
    const timerId = window.setTimeout(
      () => {
        setExpiryTick(tick => tick + 1);
      },
      Math.max(0, soonest - Date.now()) + 250,
    );
    return () => {
      window.clearTimeout(timerId);
    };
  }, [timeoutMap, expiryTick]);

  const resolveTimeout = useCallback(
    (conversationId: string, moderationType: string | undefined): TResolvedTimeout =>
      useChatTimeouts
        ? resolveConversationTimeout(conversationId, moderationType, timeoutMap, new Date())
        : NOT_TIMED_OUT,
    [useChatTimeouts, timeoutMap],
  );

  return { resolveTimeout };
};

export default useModerationTimeouts;
