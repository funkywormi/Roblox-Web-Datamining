// The native bridge and its payloads are untyped; the checks below guard them at runtime.
/* eslint-disable @typescript-eslint/no-unnecessary-condition, @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/prefer-nullish-coalescing */
import options from "../constants/options";
import type { DurableReplayer } from "../lib/durableReplayer";
import type { RealtimeSettings } from "../lib/factory";
import { getRealtimeGlobals } from "../lib/realtimeConfig";
import type {
  ConnectionEventHandler,
  Logger,
  NotificationDetail,
  NotificationHandler,
  RealtimeSource,
  RealtimeSourceConstructor,
  SourceExpiredHandler,
  TopicNotificationHandler,
  TopicNotificationMessage,
  TopicReadyHandler,
  TopicSubscriptionErrorHandler,
  TopicSubscriptionErrorMessage,
  TopicTokenExpiryHandler,
  TopicTokenExpiryMessage,
} from "../lib/types";

type HybridResult<P> = { params?: P } | null | undefined;

type HybridEvent<P> = {
  subscribe: (handler: (result: HybridResult<P>) => void) => void;
  unsubscribe: (handler: (result: HybridResult<P>) => void) => void;
};

type HybridCallback<R = unknown> = (success: boolean, result: R) => void;

type HybridRealTime = {
  supports: (method: string, callback: (isSupported: boolean) => void) => void;
  isConnected: (
    callback: HybridCallback<{
      isConnected: boolean;
      sequenceNumber?: number;
      namespaceSequenceNumbers?: Record<string, number>;
    } | null>,
  ) => void;
  onNotification: HybridEvent<{ namespace?: string; detail: string; sequenceNumber?: number }>;
  onConnectionEvent: HybridEvent<{
    isConnected?: boolean;
    sequenceNumber?: number;
    namespaceSequenceNumbers?: Record<string, number>;
  }>;
  onTopicNotification?: HybridEvent<TopicNotificationMessage>;
  onTopicSubscriptionError?: HybridEvent<TopicSubscriptionErrorMessage>;
  onTopicTokenExpiry?: HybridEvent<TopicTokenExpiryMessage>;
  subscribeTopic?: (token: string, callback: HybridCallback, replaceToken: string | null) => void;
  unsubscribeTopic?: (token: string, callback: HybridCallback) => void;
};

type HybridBridge = { RealTime: HybridRealTime; Bridge: unknown };

/**
 * Hybrid source for mobile web views with native bridge.
 * Uses native app's notification system instead of SignalR.
 * Only available in web views (not native apps, not regular web).
 * @param {Object} _settings - Realtime configuration settings (unused)
 * @param {Function} logger - Logging function
 */
const hybridSource = function (
  this: RealtimeSource,
  _settings: RealtimeSettings,
  logger: Logger | undefined,
) {
  // Resolved at instantiation (not import) so Init(config) applies; absent on Next → source no-ops.
  const Hybrid = getRealtimeGlobals().Hybrid as HybridBridge;
  // Assigned in start before any native event can fire.
  let onSourceExpiredHandler!: SourceExpiredHandler;
  let onNotificationHandler!: NotificationHandler;
  let onConnectionEventHandler!: ConnectionEventHandler;

  // Topic handlers (set by TopicManager)
  let topicNotificationHandler: TopicNotificationHandler | null = null;
  let topicReadyHandler: TopicReadyHandler | null = null;
  let topicSubscriptionErrorHandler: TopicSubscriptionErrorHandler | null = null;
  let topicTokenExpiryHandler: TopicTokenExpiryHandler | null = null;
  let connectionReady = false;
  let durableReplayerRef: DurableReplayer | null = null;

  let heartbeatTriggerTime: number;
  const heartbeatInterval = 5000;
  const heartbeatBuffer = 3000;
  let heartbeatEnabled = true;

  const log = (message: string, isVerbose?: boolean) => {
    if (logger) {
      logger(`HybridSource: ${message}`, isVerbose);
    }
  };

  const isAvailable = () => {
    // Ensure Hybrid.RealTime module present
    if (Hybrid?.RealTime?.supports == null) {
      log("Roblox.Hybrid or its RealTime module not present. Cannot use Hybrid Source");
      return false;
    }
    // And that it contains all required methods
    if (
      !(
        Boolean(Hybrid.RealTime.isConnected) &&
        Hybrid.RealTime.onNotification &&
        Hybrid.RealTime.onConnectionEvent
      )
    ) {
      log(
        "Roblox.Hybrid.RealTime module does not provide all required methods. Cannot use Hybrid Source",
      );
      return false;
    }
    // check bridge existing
    if (!Hybrid?.Bridge) {
      log("Roblox.Hybrid.Bridge is missing");
      return false;
    }
    // Once we have determinied it is not going to work, don't let it try again
    if (options.hybridSourceDisabled) {
      log("Roblox.Hybrid has previously told us it is not supported. Will not try again");
      return false;
    }

    return true;
  };

  const requestConnectionStatus = () => {
    Hybrid.RealTime.isConnected((success, result) => {
      if (success && result) {
        log(`ConnectionStatus response received: ${JSON.stringify(result)}`);
        onConnectionEventHandler({
          isConnected: result.isConnected,
          sequenceNumber: result.sequenceNumber || 0,
          namespaceSequenceNumbers: result.namespaceSequenceNumbers,
        });
        connectionReady = result.isConnected;
        if (connectionReady) {
          // Left unobserved as before; the replayer handles its own errors.
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          durableReplayerRef?.maybeRequestReplay();
          durableReplayerRef?.startPolling();
          if (topicReadyHandler) {
            log("Connection confirmed ready, notifying TopicManager");
            topicReadyHandler();
          }
        }
      } else {
        log("ConnectionStatus request failed! Aborting attempt to use HybridSource");
        if (onSourceExpiredHandler) {
          onSourceExpiredHandler();
        }
      }
    });
  };

  const scheduleHeartbeat = () => {
    heartbeatTriggerTime = Date.now();
    setTimeout(() => {
      if (heartbeatEnabled) {
        const now = Date.now();
        if (now - heartbeatTriggerTime > heartbeatInterval + heartbeatBuffer) {
          log("possible resume from suspension detected: polling for status");
          requestConnectionStatus();
        }
        scheduleHeartbeat();
      }
    }, heartbeatInterval);
  };

  const stopHeartbeat = () => {
    heartbeatEnabled = false;
  };

  const hybridOnNotificationHandler = (
    result: HybridResult<{ namespace?: string; detail: string; sequenceNumber?: number }>,
  ) => {
    if (!result?.params) {
      log("onNotification event without sufficient data");
      return;
    }
    const details = (JSON.parse(result.params.detail) as { sequenceNumber?: number } | null) || {};
    const namespaceSequenceNumber = details.sequenceNumber || 0;
    const parsedEvent = {
      namespace: result.params.namespace || "",
      detail: (JSON.parse(result.params.detail) as NotificationDetail | null) || {},
      sequenceNumber: result.params.sequenceNumber || -1,
      namespaceSequenceNumber,
    };
    log(`Relaying parsed notification: ${JSON.stringify(parsedEvent)}`, true);
    onNotificationHandler(parsedEvent);
  };

  const hybridOnConnectionEventHandler = (
    result: HybridResult<{
      isConnected?: boolean;
      sequenceNumber?: number;
      namespaceSequenceNumbers?: Record<string, number>;
    }>,
  ) => {
    if (!result?.params) {
      log("onConnectionEvent event without sufficient data");
      return;
    }

    log(`ConnectionEvent received: ${JSON.stringify(result)}`, true);
    const isConnected = result.params.isConnected || false;
    onConnectionEventHandler({
      isConnected,
      sequenceNumber: result.params.sequenceNumber || -1,
      namespaceSequenceNumbersObj: result.params.namespaceSequenceNumbers || {},
    });
    connectionReady = isConnected;
    if (isConnected) {
      if (topicReadyHandler) {
        log("Reconnection detected, notifying TopicManager to resubscribe topics");
        topicReadyHandler();
      }
      // Left unobserved as before; the replayer handles its own errors.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      durableReplayerRef?.maybeRequestReplay();
      durableReplayerRef?.startPolling();
    }
  };

  const hybridOnTopicNotificationHandler = (result: HybridResult<TopicNotificationMessage>) => {
    if (!result?.params) {
      log("onTopicNotification event without sufficient data");
      return;
    }
    const { topicId, detail } = result.params;
    log(`Topic notification received: ${topicId}`, true);
    topicNotificationHandler?.(topicId, detail);
  };

  const hybridOnTopicSubscriptionErrorHandler = (
    result: HybridResult<TopicSubscriptionErrorMessage>,
  ) => {
    if (!result?.params) {
      log("onTopicSubscriptionError event without sufficient data");
      return;
    }
    const { token, errorCode, shouldRetry } = result.params;
    log(`Topic subscription error: ${errorCode} (shouldRetry=${String(shouldRetry)})`);
    topicSubscriptionErrorHandler?.(token, errorCode, shouldRetry);
  };

  const hybridOnTopicTokenExpiryHandler = (result: HybridResult<TopicTokenExpiryMessage>) => {
    if (!result?.params) {
      log("onTopicTokenExpiry event without sufficient data");
      return;
    }
    const { token, shouldExchange, isSubscribable, subscriptionActive } = result.params;
    log(
      `Topic token expiry: shouldExchange=${String(shouldExchange)} isSubscribable=${String(isSubscribable)} subscriptionActive=${String(subscriptionActive)}`,
    );
    topicTokenExpiryHandler?.(token, shouldExchange, isSubscribable, subscriptionActive);
  };

  const subscribeTopic = (token: string, replaceToken: string | null) => {
    if (!Hybrid?.RealTime?.subscribeTopic) {
      log("subscribeTopic not available on bridge, skipping");
      return;
    }
    log(`Topic subscribe: ${token}`);
    Hybrid.RealTime.subscribeTopic(
      token,
      (success, result) => {
        if (!success) {
          log(`Topic subscribe failed: ${JSON.stringify(result)}`);
        }
      },
      replaceToken,
    );
  };

  const unsubscribeTopic = (token: string) => {
    if (!Hybrid?.RealTime?.unsubscribeTopic) {
      log("unsubscribeTopic not available on bridge, skipping");
      return;
    }
    log(`Topic unsubscribe: ${token}`);
    Hybrid.RealTime.unsubscribeTopic(token, (success, result) => {
      if (!success) {
        log(`Topic unsubscribe failed: ${JSON.stringify(result)}`);
      }
    });
  };

  const subscribeToHybridEvents = () => {
    Hybrid.RealTime.supports("isConnected", isSupported => {
      if (isSupported) {
        log("Roblox.Hybrid.RealTime isConnected is supported. Subscribing to events");
        // Wire up events
        Hybrid.RealTime.onNotification.subscribe(hybridOnNotificationHandler);
        Hybrid.RealTime.onConnectionEvent.subscribe(hybridOnConnectionEventHandler);
        Hybrid.RealTime.onTopicNotification?.subscribe(hybridOnTopicNotificationHandler);
        Hybrid.RealTime.onTopicSubscriptionError?.subscribe(hybridOnTopicSubscriptionErrorHandler);
        Hybrid.RealTime.onTopicTokenExpiry?.subscribe(hybridOnTopicTokenExpiryHandler);

        // Query the current state
        requestConnectionStatus();
      } else {
        log(
          "Roblox.Hybrid.RealTime isConnected not supported. Aborting attempt to use HybridSource",
        );
        // If the method is not supported, we should disable this source and not waste time attempting it
        // again.
        options.hybridSourceDisabled = true;
        if (onSourceExpiredHandler) {
          onSourceExpiredHandler();
        }
      }
    });
  };

  const detachHybridEventHandlers = () => {
    Hybrid.RealTime.onNotification.unsubscribe(hybridOnNotificationHandler);
    Hybrid.RealTime.onConnectionEvent.unsubscribe(hybridOnConnectionEventHandler);
    Hybrid.RealTime.onTopicNotification?.unsubscribe(hybridOnTopicNotificationHandler);
    Hybrid.RealTime.onTopicSubscriptionError?.unsubscribe(hybridOnTopicSubscriptionErrorHandler);
    Hybrid.RealTime.onTopicTokenExpiry?.unsubscribe(hybridOnTopicTokenExpiryHandler);
  };

  const stop = () => {
    log("Stopping. Detaching from native events");
    detachHybridEventHandlers();
    stopHeartbeat();
  };

  const start: RealtimeSource["Start"] = (onSourceExpired, onNotification, onConnectionEvent) => {
    log("Starting");
    if (!isAvailable()) {
      return false;
    }

    onSourceExpiredHandler = onSourceExpired;
    onNotificationHandler = onNotification;
    onConnectionEventHandler = onConnectionEvent;

    subscribeToHybridEvents();
    scheduleHeartbeat();
    return true;
  };

  const setTopicNotificationHandler = (handler: TopicNotificationHandler | null) => {
    topicNotificationHandler = handler;
  };

  const setTopicReadyHandler = (handler: TopicReadyHandler | null) => {
    topicReadyHandler = handler;
    if (handler && connectionReady) {
      log("Connection already ready, replaying ready signal to TopicManager");
      handler();
    }
  };

  const setTopicSubscriptionErrorHandler = (handler: TopicSubscriptionErrorHandler | null) => {
    topicSubscriptionErrorHandler = handler;
  };

  const setTopicTokenExpiryHandler = (handler: TopicTokenExpiryHandler | null) => {
    topicTokenExpiryHandler = handler;
  };

  const setDurableReplayer = (replayer: DurableReplayer | null) => {
    durableReplayerRef = replayer;
    if (replayer) {
      // Left unobserved as before; the replayer handles its own errors.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      replayer.fetchConfig();
    }
  };

  // Public API
  this.IsAvailable = isAvailable;
  this.Start = start;
  this.Stop = stop;
  this.Name = "HybridSource";

  // Durable replay support
  this.SetDurableReplayer = setDurableReplayer;

  // Topic support
  this.SubscribeTopic = subscribeTopic;
  this.UnsubscribeTopic = unsubscribeTopic;
  this.SetTopicNotificationHandler = setTopicNotificationHandler;
  this.SetTopicReadyHandler = setTopicReadyHandler;
  this.SetTopicSubscriptionErrorHandler = setTopicSubscriptionErrorHandler;
  this.SetTopicTokenExpiryHandler = setTopicTokenExpiryHandler;
};

// Called with new; typed as a constructor at this boundary.
export default hybridSource as unknown as RealtimeSourceConstructor;
