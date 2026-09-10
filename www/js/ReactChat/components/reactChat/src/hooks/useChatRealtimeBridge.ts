import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import realtimeFactory from "@rbx/core-scripts/realtime";
import { applyChatRealtimeCacheActions } from "../utils/chatRealtimeCacheActions";
import { dispatchRealtimeDetail } from "../utils/chatRealtimeDispatcher";
import { useChatUiPolicies } from "./useChatUiPolicies";

type TConnectionEventHandler = (dataReloadRequired: boolean) => void;

type TRealtimeClientBridge = {
  Subscribe: (namespace: string, handler: (detail: unknown) => void) => void;
  Unsubscribe: (namespace: string, handler: (detail: unknown) => void) => void;
  // Implemented by the runtime SignalR client but absent from its published types, so declared here.
  SubscribeToConnectionEvents: (
    onConnected: TConnectionEventHandler,
    onReconnected: TConnectionEventHandler,
    onDisconnected: () => void,
    namespace: string,
  ) => void;
  SubscribeToGapEvent: (namespace: string, handler: () => void) => void;
};

type TUseChatRealtimeBridgeOptions = {
  enabled: boolean;
  /**
   * When false (chat turned off via privacy settings), only UserSettingsChanged is subscribed so a
   * re-enable is still detected — the message namespaces are dropped so a disabled user receives no
   * chat, matching legacy's unsubscribeRealTimeForChat.
   */
  isChatEnabled: boolean;
};

export type TUseChatRealtimeBridgeResult = {
  /** True once the realtime connection has been lost long enough to mask the chat input. */
  isConnectionLost: boolean;
};

/** Conversation-model notifications (pre–trusted-communities chat backend). */
const CHAT_NOTIFICATIONS_NAMESPACE = "ChatNotifications";
/** Platform-chat / trusted-communities channel notifications (`platform-chat-api`). */
const COMMUNICATION_CHANNELS_NAMESPACE = "CommunicationChannels";
/** Moderation-consequence notifications (nudge / timeout) are delivered on this namespace. */
const FEATURE_INTERVENTION_NAMESPACE = "FeatureIntervention";
/**
 * Conversation-migration notifications (`ConversationBackfilled` / `ConversationReset`) that
 * swap a conversation id for a channel id as chat migrates onto `platform-chat-api`. Handling
 * them keeps an open conversation pointing at the migrated id.
 */
const CHAT_MIGRATION_NAMESPACE = "ChatMigration";
/** Friend add/remove — refresh the friends directory + conversation list (roster/presence). */
const FRIENDSHIP_NOTIFICATIONS_NAMESPACE = "FriendshipNotifications";
/** Chat privacy / user-settings changes — refresh chat settings + metadata. */
const USER_SETTINGS_CHANGED_NAMESPACE = "UserSettingsChanged";
/** Moderation-eligibility re-evaluation for a set of conversations (`channels_inspected`). */
const CHAT_MODERATION_ELIGIBILITY_NAMESPACE = "ChatModerationTypeEligibility";
/** Display-name / user-tag changes — refresh contact info in the friends directory. */
const USER_TAG_CHANGE_NAMESPACE = "UserTagChangeNotification";

const BASE_REALTIME_NAMESPACES = [
  CHAT_NOTIFICATIONS_NAMESPACE,
  COMMUNICATION_CHANNELS_NAMESPACE,
  CHAT_MIGRATION_NAMESPACE,
  FRIENDSHIP_NOTIFICATIONS_NAMESPACE,
  USER_SETTINGS_CHANGED_NAMESPACE,
  CHAT_MODERATION_ELIGIBILITY_NAMESPACE,
  USER_TAG_CHANGE_NAMESPACE,
] as const;

/**
 * How long the realtime connection must stay down before the chat shows its "no connection" mask.
 * The legacy chat sourced this from `signalRDisconnectionResponseInMilliseconds` in its metadata;
 * the React `/v1/metadata` response does not carry it, so we use a fixed debounce to avoid flashing
 * the mask on brief reconnect blips.
 */
const CONNECTION_LOST_MASK_DELAY_MS = 2000;

/**
 * Subscribes to SignalR chat namespaces and translates realtime events into React Query cache
 * invalidations and UI custom events, and tracks the connection's health so the chat can mask its
 * input when the socket is lost (parity with the legacy chat).
 *
 * Messages arrive on `CommunicationChannels` (`platform-chat-api`) and on `ChatNotifications`
 * during the migration window. We listen to both so rollout/gating differences still deliver.
 *
 * Typing events are dispatched as `reactChatTyping` CustomEvents, which `useChatLayout` already
 * listens for and manages with timer-based expiry.
 */
export function useChatRealtimeBridge({
  enabled,
  isChatEnabled,
}: TUseChatRealtimeBridgeOptions): TUseChatRealtimeBridgeResult {
  const queryClient = useQueryClient();
  const { useChatTimeouts, useDurableReplayGapRefetch } = useChatUiPolicies();
  const [isConnectionLost, setIsConnectionLost] = useState(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Chat off: subscribe only to UserSettingsChanged so a re-enable re-runs this effect and
    // re-subscribes the rest. The FeatureIntervention (nudge/timeout) stream is added only for
    // users in the timeout rollout.
    let namespaces: readonly string[];
    if (!isChatEnabled) {
      namespaces = [USER_SETTINGS_CHANGED_NAMESPACE];
    } else if (useChatTimeouts) {
      namespaces = [...BASE_REALTIME_NAMESPACES, FEATURE_INTERVENTION_NAMESPACE];
    } else {
      namespaces = BASE_REALTIME_NAMESPACES;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- runtime client forwards payloads despite typed as zero-arg
    const client = realtimeFactory.GetClient() as unknown as TRealtimeClientBridge;

    const handler = (detail: unknown) => {
      dispatchRealtimeDetail(queryClient, detail);
    };

    for (const namespace of namespaces) {
      client.Subscribe(namespace, handler);
    }

    return () => {
      for (const namespace of namespaces) {
        client.Unsubscribe(namespace, handler);
      }
    };
  }, [enabled, isChatEnabled, queryClient, useChatTimeouts]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // A friend going online/offline fires Roblox.Presence.Update. Presence is layered onto
    // conversations from a separate presence query (useChatData), so refresh that query (and the
    // friends directory) — invalidating the conversation list alone left the stale presence data
    // in place, so dots/labels never moved until a navigation changed the participant set.
    const onPresenceUpdate = () => {
      applyChatRealtimeCacheActions(queryClient, [
        { kind: "invalidate_presence" },
        { kind: "invalidate_friends_directory" },
      ]).catch((): undefined => undefined);
    };

    document.addEventListener("Roblox.Presence.Update", onPresenceUpdate);
    return () => {
      document.removeEventListener("Roblox.Presence.Update", onPresenceUpdate);
    };
  }, [enabled, queryClient]);

  // Connection lifecycle (reconnect reload + "no connection" mask).
  const connectionRegisteredRef = useRef(false);
  const isMountedRef = useRef(true);
  const maskTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasConnectedRef = useRef(false);
  // Latest `enabled`, read inside the once-registered handlers (which never re-run on a dep
  // change) so they reflect current state without re-subscribing.
  const enabledRef = useRef(enabled);
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    // Set on mount (not just once at ref init) so a remount / effect double-invoke re-arms it.
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (maskTimerRef.current !== null) {
        clearTimeout(maskTimerRef.current);
        maskTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // The realtime client has NO unsubscribe for connection events and appends every handler to a
    // per-namespace list, so we must register exactly once for the hook's lifetime — never on a
    // dependency change — or handlers accumulate and misfire. reactChat mounts once per page load.
    if (!enabled || connectionRegisteredRef.current) {
      return;
    }
    connectionRegisteredRef.current = true;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- connection APIs exist at runtime but are missing from the published client types
    const client = realtimeFactory.GetClient() as unknown as TRealtimeClientBridge;

    const clearMaskTimer = () => {
      if (maskTimerRef.current !== null) {
        clearTimeout(maskTimerRef.current);
        maskTimerRef.current = null;
      }
    };

    // A reconnect after a drop can mean we missed events; refetch the conversation list, the open
    // dialogs' messages, and metadata so state is consistent (mirrors the legacy reconnect reload).
    const reloadAfterReconnect = () => {
      applyChatRealtimeCacheActions(queryClient, [
        { kind: "invalidate_user_conversations" },
        { kind: "invalidate_conversation_metadata" },
        { kind: "invalidate_all_conversation_messages" },
      ]).catch((): undefined => undefined);
    };

    const clearConnectionLost = () => {
      clearMaskTimer();
      if (isMountedRef.current) {
        setIsConnectionLost(false);
      }
    };

    // Connect and reconnect share one handler. The FIRST connection callback — connect OR reconnect
    // — never reloads: react-query's mount fetch already has fresh data (mirrors the legacy chat's
    // single pageInitializing gate for both). Only a later reconnect signalling missed data reloads.
    // The isMountedRef guard neutralizes a stale handler if this hook ever leaks across a remount
    // (the client exposes no unsubscribe for connection events).
    const handleConnectionRestored: TConnectionEventHandler = dataReloadRequired => {
      if (!isMountedRef.current || !enabledRef.current) {
        return;
      }
      clearConnectionLost();
      if (!hasConnectedRef.current) {
        hasConnectedRef.current = true;
        return;
      }
      if (dataReloadRequired) {
        reloadAfterReconnect();
      }
    };

    const onDisconnected = () => {
      if (!isMountedRef.current || !enabledRef.current) {
        return;
      }
      // Debounce: only mask after the connection stays down past the delay, so a brief blip that
      // reconnects quickly never flashes the "no connection" banner.
      clearMaskTimer();
      maskTimerRef.current = setTimeout(() => {
        maskTimerRef.current = null;
        if (isMountedRef.current) {
          setIsConnectionLost(true);
        }
      }, CONNECTION_LOST_MASK_DELAY_MS);
    };

    client.SubscribeToConnectionEvents(
      handleConnectionRestored,
      handleConnectionRestored,
      onDisconnected,
      CHAT_NOTIFICATIONS_NAMESPACE,
    );
  }, [enabled, queryClient]);

  // Gap-event subscription — reactive to the policy flag so it subscribes once the GUAC query
  // resolves. Registering a gap handler also signals the client to suppress connection-event
  // reloads for this namespace (the replayer + gap events handle catch-up instead).
  const gapRegisteredRef = useRef(false);
  useEffect(() => {
    if (!enabled || !useDurableReplayGapRefetch || gapRegisteredRef.current) {
      return;
    }
    gapRegisteredRef.current = true;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- runtime API
    const client = realtimeFactory.GetClient() as unknown as TRealtimeClientBridge;
    client.SubscribeToGapEvent(COMMUNICATION_CHANNELS_NAMESPACE, () => {
      if (!isMountedRef.current) {
        return;
      }
      applyChatRealtimeCacheActions(queryClient, [
        { kind: "invalidate_user_conversations" },
        { kind: "invalidate_conversation_metadata" },
        { kind: "invalidate_all_conversation_messages" },
      ]).catch((): undefined => undefined);
    });
  }, [enabled, useDurableReplayGapRefetch, queryClient]);

  return { isConnectionLost };
}
