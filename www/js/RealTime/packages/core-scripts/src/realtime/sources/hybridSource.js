// TODO: old, migrated code
/* eslint-disable no-invalid-this */
import options from "../constants/options";

const Hybrid = window.Roblox?.Hybrid;

/**
 * Hybrid source for mobile web views with native bridge.
 * Uses native app's notification system instead of SignalR.
 * Only available in web views (not native apps, not regular web).
 * @param {Object} _settings - Realtime configuration settings (unused)
 * @param {Function} logger - Logging function
 */
const hybridSource = function (_settings, logger) {
  let onSourceExpiredHandler;
  let onNotificationHandler;
  let onConnectionEventHandler;

  // Topic handlers (set by TopicManager)
  let topicNotificationHandler = null;
  let topicReadyHandler = null;
  let topicSubscriptionErrorHandler = null;
  let topicTokenExpiryHandler = null;
  let connectionReady = false;
  let durableReplayerRef = null;

  let heartbeatTriggerTime;
  const heartbeatInterval = 5000;
  const heartbeatBuffer = 3000;
  let heartbeatEnabled = true;

  const log = (message, isVerbose) => {
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
        Hybrid.RealTime.isConnected &&
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
    heartbeatTriggerTime = new Date().getTime();
    setTimeout(() => {
      if (heartbeatEnabled) {
        const now = new Date().getTime();
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

  const hybridOnNotificationHandler = result => {
    if (!result || !result.params) {
      log("onNotification event without sufficient data");
      return;
    }
    const details = JSON.parse(result.params.detail) || {};
    const namespaceSequenceNumber = details.sequenceNumber || 0;
    const parsedEvent = {
      namespace: result.params.namespace || "",
      detail: JSON.parse(result.params.detail) || {},
      sequenceNumber: result.params.sequenceNumber || -1,
      namespaceSequenceNumber,
    };
    log(`Relaying parsed notification: ${JSON.stringify(parsedEvent)}`, true);
    onNotificationHandler(parsedEvent);
  };

  const hybridOnConnectionEventHandler = result => {
    if (!result || !result.params) {
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
      durableReplayerRef?.maybeRequestReplay();
      durableReplayerRef?.startPolling();
    }
  };

  const hybridOnTopicNotificationHandler = result => {
    if (!result || !result.params) {
      log("onTopicNotification event without sufficient data");
      return;
    }
    const { topicId, detail } = result.params;
    log(`Topic notification received: ${topicId}`, true);
    topicNotificationHandler?.(topicId, detail);
  };

  const hybridOnTopicSubscriptionErrorHandler = result => {
    if (!result || !result.params) {
      log("onTopicSubscriptionError event without sufficient data");
      return;
    }
    const { token, errorCode, shouldRetry } = result.params;
    log(`Topic subscription error: ${errorCode} (shouldRetry=${shouldRetry})`);
    topicSubscriptionErrorHandler?.(token, errorCode, shouldRetry);
  };

  const hybridOnTopicTokenExpiryHandler = result => {
    if (!result || !result.params) {
      log("onTopicTokenExpiry event without sufficient data");
      return;
    }
    const { token, shouldExchange, isSubscribable, subscriptionActive } = result.params;
    log(
      `Topic token expiry: shouldExchange=${shouldExchange} isSubscribable=${isSubscribable} subscriptionActive=${subscriptionActive}`,
    );
    topicTokenExpiryHandler?.(token, shouldExchange, isSubscribable, subscriptionActive);
  };

  const subscribeTopic = (token, replaceToken) => {
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

  const unsubscribeTopic = token => {
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

  const start = (onSourceExpired, onNotification, onConnectionEvent) => {
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

  const setTopicNotificationHandler = handler => {
    topicNotificationHandler = handler;
  };

  const setTopicReadyHandler = handler => {
    topicReadyHandler = handler;
    if (handler && connectionReady) {
      log("Connection already ready, replaying ready signal to TopicManager");
      handler();
    }
  };

  const setTopicSubscriptionErrorHandler = handler => {
    topicSubscriptionErrorHandler = handler;
  };

  const setTopicTokenExpiryHandler = handler => {
    topicTokenExpiryHandler = handler;
  };

  const setDurableReplayer = replayer => {
    durableReplayerRef = replayer;
    if (replayer) {
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

export default hybridSource;
