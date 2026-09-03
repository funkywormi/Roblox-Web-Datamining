import { pubSub } from "@rbx/core-scripts/util/cross-tab-communication";
import realtimeFactory from "./factory";
import realtimeStateTracker from "./stateTracker";
import { maybeSendEventToDataLake, sendDurableReplayEvent } from "../utils/events";
import createTopicManager from "./topicManager";
import createDurableReplayer from "./durableReplayer";
import createMessageDeduper from "./messageDeduper";
import { realtimeEvents } from "../constants/events";
import signalRSource from "../sources/signalRSource";
import hybridSource from "../sources/hybridSource";
import crossTabReplicatedSource from "../sources/crossTabReplicatedSource";

const RealtimeClient = function (sourceConstructors) {
  let currentSource = null;

  const namespaceConnectStatus = {};

  // Subscribed event handlers
  const notificationHandlers = {};

  const onConnectedHandlers = {};
  const onDisconnectedHandlers = {};
  const onReconnectedHandlers = {};
  const onGapDetectedHandlers = {};

  const onSignalRConnectionCallbacks = [];

  let customLogger = null;
  let logVerboseMessages = false;

  const log = (message, isVerbose) => {
    if (!isVerbose || logVerboseMessages) {
      if (customLogger) {
        customLogger(`RealTime Client: ${message}`);
      }
    }
  };
  let stateTracker = null;

  // Topic-based notifications manager
  const topicManager = createTopicManager({ log });

  // Durable replay manager (initialized after stateTracker is ready)
  let durableReplayer = null;
  let messageDeduper = null;

  const setCustomLogger = loggerCallback => {
    customLogger = loggerCallback;
  };

  const setVerboseLogging = newValue => {
    logVerboseMessages = newValue;
  };

  const onDisconnected = selectedNamespace => {
    log("Client Disconnected!");
    if (!selectedNamespace) {
      // TODO: old, migrated code
      // eslint-disable-next-line no-restricted-syntax, guard-for-in
      for (const namespace in onDisconnectedHandlers) {
        try {
          if (onDisconnectedHandlers[namespace]) {
            // BUG: this is an infinite loop?
            for (let i = 0; onDisconnectedHandlers[namespace].length > 0; i += 1) {
              onDisconnectedHandlers[namespace][i]();
            }
          }
        } catch (e) {
          log(`Error running subscribed event handler for disconnected:${e}`);
        }
      }
    } else {
      try {
        if (onDisconnectedHandlers[selectedNamespace]) {
          // BUG: this is an infinite loop?
          for (let i = 0; onDisconnectedHandlers[selectedNamespace].length > 0; i += 1) {
            onDisconnectedHandlers[selectedNamespace][i]();
          }
        }
      } catch (e) {
        log(`Error running subscribed event handler for disconnected:${e}`);
      }
    }
  };

  const refreshConnectionStatus = () => {
    if (
      namespaceConnectStatus.constructor === Object &&
      Object.keys(namespaceConnectStatus).length > 0
    ) {
      // TODO: old, migrated code
      // eslint-disable-next-line no-restricted-syntax
      for (const namespace in namespaceConnectStatus) {
        if (namespaceConnectStatus[namespace].isConnected) {
          namespaceConnectStatus[namespace].isConnected = false;
          onDisconnected(namespace);
        }
      }
    }
  };

  // Dedup, deliver to handlers, and update sequence number. Shared by both
  // live and replayed paths. Does NOT perform gap detection.
  const deliverNotification = (notificationSource, notification) => {
    if (notificationSource !== currentSource) {
      return false;
    }

    const namespaceId = notification.namespace;
    const details = notification.detail;

    if (messageDeduper) {
      const messageId = details && details.RealtimeMessageIdentifier;
      if (!messageDeduper.tryAdd(messageId)) {
        return false;
      }
    }

    const settings = realtimeFactory.GetSettings();
    if (settings.isRealtimeWebAnalyticsEnabled) {
      try {
        const payloadSize = JSON.stringify(notification.detail).length;
        maybeSendEventToDataLake(namespaceId, details, payloadSize);
      } catch (e) {
        log(`Error sending realtime event to datalake for notification [${namespaceId}]:${e}`);
      }
    }

    const namespaceHandlers = notificationHandlers[namespaceId];
    if (namespaceHandlers) {
      for (const handler of namespaceHandlers) {
        try {
          handler(details);
        } catch (e) {
          log(`Error running subscribed event handler for notification [${namespaceId}]:${e}`);
        }
      }
    }
    if (stateTracker) {
      stateTracker.UpdateSequenceNumber(namespaceId, notification.namespaceSequenceNumber);
    }
    return true;
  };

  // Live notification entry point: gap detection (before seqNum update) + delivery.
  const onNotification = (notificationSource, notification) => {
    if (notificationSource !== currentSource) {
      return;
    }
    // Gap detection must run before deliverNotification updates the sequence number,
    // otherwise lastSeen already equals seqNum and gaps are invisible.
    if (durableReplayer && notification.namespaceSequenceNumber != null) {
      durableReplayer.onLiveNotificationReceived(
        notification.namespace,
        notification.namespaceSequenceNumber,
      );
    }
    deliverNotification(notificationSource, notification);
  };

  const getLastSeenSequenceNumbers = () => {
    if (!stateTracker) return {};
    const state = stateTracker.GetLatestState();
    return (state && state.namespaceSequenceNumbersObj) || {};
  };

  const processReplayedNotification = (namespace, detail, seqNum) => {
    const notification = { namespace, detail, namespaceSequenceNumber: seqNum };
    deliverNotification(currentSource, notification);
    pubSub.publish(realtimeEvents.Notification, JSON.stringify(notification));
  };

  const updateSequenceNumber = (namespace, seqNum) => {
    if (stateTracker) {
      stateTracker.UpdateSequenceNumber(namespace, seqNum);
    }
  };

  const executeConnectionCallbacks = () => {
    onSignalRConnectionCallbacks.forEach(callback => {
      callback();
    });
  };

  const getConnectionStatus = namespace => {
    if (!namespace) {
      let isAnyNamespaceConnected = false;
      // TODO: old, migrated code
      // eslint-disable-next-line no-restricted-syntax
      for (const name in namespaceConnectStatus) {
        if (namespaceConnectStatus[name] && namespaceConnectStatus[name].isConnected) {
          isAnyNamespaceConnected = true;
        }
      }
      return {
        isConnected: isAnyNamespaceConnected,
      };
    }
    if (!namespaceConnectStatus[namespace]) {
      namespaceConnectStatus[namespace] = {
        isConnected: false,
        hasEverBeenConnected: false,
      };
    }
    return namespaceConnectStatus[namespace];
  };

  const onConnected = (dataReloadRequired, selectedNamespace) => {
    log("Client Connected!");
    if (!selectedNamespace) {
      // TODO: old, migrated code
      // eslint-disable-next-line no-restricted-syntax, guard-for-in
      for (const namespace in onConnectedHandlers) {
        try {
          if (onConnectedHandlers[namespace]) {
            for (const handler of onConnectedHandlers[namespace]) {
              handler(dataReloadRequired);
            }
          }
        } catch (e) {
          log(`Error running subscribed event handler for connected:${e}`);
        }
      }
    } else {
      try {
        if (onConnectedHandlers[selectedNamespace]) {
          for (const handler of onConnectedHandlers[selectedNamespace]) {
            handler(dataReloadRequired);
          }
        }
      } catch (e) {
        log(`Error running subscribed event handler for connected:${e}`);
      }
    }
  };

  const onReconnected = (dataReloadRequired, selectedNamespace) => {
    log(`Client Reconnected! Data Reload Required: ${dataReloadRequired}`);
    if (!selectedNamespace) {
      // TODO: old, migrated code
      // eslint-disable-next-line no-restricted-syntax, guard-for-in
      for (const namespace in onReconnectedHandlers) {
        try {
          if (onReconnectedHandlers[namespace]) {
            // BUG: this is an infinite loop?
            for (let i = 0; onReconnectedHandlers[namespace].length > 0; i += 1) {
              onReconnectedHandlers[namespace][i](dataReloadRequired);
            }
          }
        } catch (e) {
          log(`Error running subscribed event handler for reconnected:${e}`);
        }
      }
    } else {
      try {
        if (onReconnectedHandlers[selectedNamespace]) {
          // BUG: this is an infinite loop?
          for (let i = 0; onReconnectedHandlers[selectedNamespace].length > 0; i += 1) {
            onReconnectedHandlers[selectedNamespace][i](dataReloadRequired);
          }
        }
      } catch (e) {
        log(`Error running subscribed event handler for reconnected:${e}`);
      }
    }
  };

  const fireConnectionEventPerNamespace = (namespace, sequenceNumber) => {
    const isDurable = durableReplayer?.isDurableNamespace(namespace);

    const isDataReloadRequired = stateTracker
      ? stateTracker.IsDataRefreshRequired(namespace, sequenceNumber)
      : null;

    // Skip stateTracker update for durable namespaces — the replayer needs the
    // pre-reconnect seq nums to calculate the replay gap.
    if (stateTracker && !isDurable) {
      stateTracker.UpdateSequenceNumber(namespace, sequenceNumber);
    }

    const connectionStatus = getConnectionStatus(namespace);

    if (
      connectionStatus.isConnected &&
      isDataReloadRequired === stateTracker.RefreshRequiredEnum.IS_REQUIRED
    ) {
      log(
        `Have detected messages were missed. Triggering reconnect logic. Data Reload Required: ${isDataReloadRequired}`,
      );
      connectionStatus.isConnected = false;
      onDisconnected(namespace);
    }

    // If not connected, send the connection event with indication of whether or not a data refresh is required
    if (!connectionStatus.isConnected) {
      connectionStatus.isConnected = true;

      if (connectionStatus.hasEverBeenConnected) {
        const hasGapHandlers = onGapDetectedHandlers[namespace]?.length > 0;
        const needsReload = hasGapHandlers
          ? false
          : isDataReloadRequired === null ||
            isDataReloadRequired === stateTracker.RefreshRequiredEnum.IS_REQUIRED ||
            isDataReloadRequired === stateTracker.RefreshRequiredEnum.UNCLEAR;
        onReconnected(needsReload, namespace);
      } else {
        const hasGapHandlers = onGapDetectedHandlers[namespace]?.length > 0;
        const isHardReloadRequired = hasGapHandlers
          ? false
          : isDataReloadRequired !== stateTracker.RefreshRequiredEnum.NOT_REQUIRED;

        connectionStatus.hasEverBeenConnected = true;
        const { Performance } = window.Roblox;
        if (Performance) {
          const performanceLabel = `signalR_${currentSource.Name}_connected`;
          Performance.logSinglePerformanceMark(performanceLabel);
        }
        onConnected(isHardReloadRequired, namespace);
      }
    }
  };

  const fireDisconnectedEventPerNamespace = namespace => {
    const connectionStatus = getConnectionStatus(namespace);
    if (connectionStatus.isConnected) {
      connectionStatus.isConnected = false;
      onDisconnected(namespace);
    }
  };

  const onConnectionEvent = (connectionEventSource, connectionEvent) => {
    if (connectionEventSource !== currentSource) {
      // Ignore events from old sources
      return;
    }

    if (connectionEvent.isConnected) {
      executeConnectionCallbacks();

      if (connectionEvent.namespace) {
        const { namespace } = connectionEvent;
        const sequenceNumber = connectionEvent.namespaceSequenceNumber;
        fireConnectionEventPerNamespace(namespace, sequenceNumber);
      } else if (connectionEvent.namespaceSequenceNumbersObj) {
        // TODO: old, migrated code
        // eslint-disable-next-line no-restricted-syntax, guard-for-in
        for (const namespace in connectionEvent.namespaceSequenceNumbersObj) {
          const sequenceNumber = connectionEvent.namespaceSequenceNumbersObj[namespace];
          fireConnectionEventPerNamespace(namespace, sequenceNumber);
        }
      }

      // Replay and polling are triggered by the source itself via SetDurableReplayer
      // (leader sources call startPolling on connect; follower sources no-op)
    } else if (connectionEvent.namespace) {
      const { namespace } = connectionEvent;
      fireDisconnectedEventPerNamespace(namespace);
    } else if (connectionEvent.namespaceSequenceNumbersObj) {
      // TODO: old, migrated code
      // eslint-disable-next-line no-restricted-syntax, guard-for-in
      for (const namespace in connectionEvent.namespaceSequenceNumbersObj) {
        fireDisconnectedEventPerNamespace(namespace);
      }
    } else {
      // TODO: old, migrated code
      // TODO: old, migrated code
      // eslint-disable-next-line no-restricted-syntax, guard-for-in
      for (const namespace in namespaceConnectStatus) {
        fireDisconnectedEventPerNamespace(namespace);
      }
    }

    // Stop polling when fully disconnected
    if (!connectionEvent.isConnected && durableReplayer) {
      durableReplayer.stopPolling();
    }
  };

  const refreshSource = () => {
    if (currentSource) {
      log(`Stopping current source: ${currentSource.Name}`);
      currentSource.Stop();
      currentSource = null;
      if (durableReplayer) {
        durableReplayer.stopPolling();
      }
      refreshConnectionStatus();
    }

    const settings = realtimeFactory.GetSettings();
    for (const constructor of sourceConstructors) {
      const newSource = new constructor(settings, log);
      log(`Attempting to start a new source: ${newSource.Name}`);
      const started = newSource.Start(
        refreshSource,
        notification => {
          onNotification(newSource, notification);
        },
        connectionEvent => {
          onConnectionEvent(newSource, connectionEvent);
        },
      );
      if (started) {
        log(`New source started: ${newSource.Name}`);
        currentSource = newSource;

        // Notify topic manager of new source (handles topic subscriptions for new source)
        // Note: onConnectionEvent will also call this on connect, making it potentially redundant
        // but ensuring topic subscriptions work even if connection event timing varies
        topicManager.onSourceChanged(newSource);

        // Delegate durable replay to the source — leader sources fetch config and
        // trigger replay on connect; follower sources no-op.
        if (durableReplayer) {
          newSource.SetDurableReplayer(durableReplayer);
        }

        break;
      }
    }

    if (currentSource === null) {
      log("No source can be started!");
    }
  };

  const initialize = () => {
    if (realtimeStateTracker) {
      // TODO: old, migrated code
      // eslint-disable-next-line new-cap
      stateTracker = new realtimeStateTracker(
        realtimeFactory.IsLocalStorageEnabled(),
        realtimeFactory.IsEventPublishingEnabled(),
      );
    }

    const settings = realtimeFactory.GetSettings();
    if (settings.isRealtimeDurableReplayEnabled) {
      messageDeduper = createMessageDeduper({
        maxSize: settings.realtimeMessageDedupeLruCacheSize || 32,
        log,
      });

      durableReplayer = createDurableReplayer({
        getLastSeenSequenceNumbers,
        processNotification: processReplayedNotification,
        updateSequenceNumber,
        isPollingEnabled: settings.isRealtimeTailLossPollingEnabled,
        onGapDetected: namespaces => {
          for (const namespace of namespaces) {
            const handlers = onGapDetectedHandlers[namespace];
            if (handlers) {
              for (const handler of handlers) {
                try {
                  handler();
                } catch (_e) {
                  sendDurableReplayEvent("GapHandlerError");
                }
              }
            }
          }
        },
        log,
        pollingBaseIntervalMs: settings.realtimeTailLossPollingBaseIntervalMs,
        pollingMaxIntervalMs: settings.realtimeTailLossPollingMaxIntervalMs,
        pollingBackoffMultiplier: settings.realtimeTailLossPollingBackoffMultiplier,
        pollingRetryMaxAttempts: settings.realtimeTailLossPollingRetryMaxAttempts,
        isGapDetectionEnabled: settings.isRealtimeTailLossGapDetectionEnabled,
      });
    }

    refreshSource();

    const { Performance } = window.Roblox;
    if (Performance) {
      Performance.setPerformanceMark("signalR_initialized");
    }
  };

  const subscribeToNotifications = (namespace, handler) => {
    if (!notificationHandlers[namespace]) {
      notificationHandlers[namespace] = [];
    }

    const typeHandlers = notificationHandlers[namespace];
    typeHandlers.push(handler);
  };

  const unsubscribeFromNotifications = (namespace, handler) => {
    if (!notificationHandlers[namespace]) {
      // not actually subscribed
      return;
    }

    const typeHandlers = notificationHandlers[namespace];
    const handlerIndex = typeHandlers.indexOf(handler);
    if (handlerIndex >= 0) {
      typeHandlers.splice(handlerIndex, 1);
    }
  };

  const isConnectedMethod = namespace => {
    const connectionStatus = getConnectionStatus(namespace);
    return connectionStatus.isConnected;
  };

  const detectSignalConnection = onSignalRConnection => {
    onSignalRConnectionCallbacks.push(onSignalRConnection);
  };

  const subscribeToConnectionEvents = (
    onConnectedHandler,
    onReconnectedHandler,
    onDisconnectedHandler,
    namespace,
    // TODO: old, migrated code
    // eslint-disable-next-line consistent-return
  ) => {
    if (!namespace) {
      return false;
    }

    if (onConnectedHandler) {
      if (!onConnectedHandlers[namespace]) {
        onConnectedHandlers[namespace] = [];
      }
      onConnectedHandlers[namespace].push(onConnectedHandler);
    }
    if (onReconnectedHandler) {
      if (!onReconnectedHandlers[namespace]) {
        onReconnectedHandlers[namespace] = [];
      }
      onReconnectedHandlers[namespace].push(onReconnectedHandler);
    }
    if (onDisconnectedHandler) {
      if (!onDisconnectedHandlers[namespace]) {
        onDisconnectedHandlers[namespace] = [];
      }
      onDisconnectedHandlers[namespace].push(onDisconnectedHandler);
    }
  };

  const subscribeToGapEvent = (namespace, handler) => {
    if (!namespace || !handler) {
      return;
    }
    if (!onGapDetectedHandlers[namespace]) {
      onGapDetectedHandlers[namespace] = [];
    }
    onGapDetectedHandlers[namespace].push(handler);
  };

  // ============================================================================
  // TOPIC-BASED NOTIFICATIONS
  // ============================================================================

  /**
   * Subscribe to topic-based notifications
   *
   * @param {string} token - Topic token (format: "{namespace}!{topic}.body.sig")
   * @param {function} callback - Called when notification received
   * @param {object} [options] - Optional settings
   * @param {function} [options.onError] - Called on subscription error or token expiry.
   *   Receives { type: 'error', errorCode, shouldRetry } or { type: 'expired', shouldExchange }.
   * @returns {object} Handle with unsubscribe() method
   */
  const subscribeToTopicNotification = (token, callback, options) =>
    topicManager.subscribe(token, callback, options);

  // ============================================================================
  // END TOPIC-BASED NOTIFICATIONS
  // ============================================================================

  // Automatic Start
  initialize();
  // Public Interface
  this.Subscribe = subscribeToNotifications;
  this.Unsubscribe = unsubscribeFromNotifications;
  this.SubscribeToConnectionEvents = subscribeToConnectionEvents;
  this.DetectSignalConnection = detectSignalConnection;
  this.IsConnected = isConnectedMethod;
  this.SetLogger = setCustomLogger;
  this.SetVerboseLogging = setVerboseLogging;

  // Durable replay gap detection
  this.SubscribeToGapEvent = subscribeToGapEvent;

  // Topic-based notifications (Phase 1)
  this.SubscribeToTopicNotification = subscribeToTopicNotification;
};

let client = null;

const initialiseSingletonClient = () => {
  const sources = [];
  if (hybridSource) {
    const { DeviceMeta } = window.Roblox;
    const deviceType = DeviceMeta && new DeviceMeta();
    const isAndroidApp = deviceType ? deviceType.isAndroidApp : false;
    const isIosApp = deviceType ? deviceType.isIosApp : false;

    if (isAndroidApp === false && isIosApp === false) {
      sources.push(hybridSource);
    }
  }
  if (crossTabReplicatedSource) {
    sources.push(crossTabReplicatedSource);
  }
  if (signalRSource) {
    sources.push(signalRSource);
  }

  return new RealtimeClient(sources);
};

const getClient = () => {
  if (client === null) {
    client = initialiseSingletonClient();
  }
  return client;
};

export { getClient, RealtimeClient };
