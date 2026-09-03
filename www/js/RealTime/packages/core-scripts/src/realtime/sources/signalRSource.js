// TODO: old, migrated code
/* eslint-disable no-invalid-this */
import * as signalR from "@microsoft/signalr";
import { pubSub, kingmaker } from "@rbx/core-scripts/util/cross-tab-communication";
import { realtimeEvents, topicChannels } from "../constants/events";
import CoreSignalRConnectionWrapper from "../lib/coreSignalRConnectionWrapper";
import { sendConnectionEventToDataLake as sendConnectionEventToDataLakeUtil } from "../utils/events";

/**
 * SignalR-based realtime notification source.
 * Establishes WebSocket connection to SignalR server for namespace and topic notifications.
 * Used by master tabs or when localStorage unavailable (single-tab mode).
 *
 * @param {Object} settings - Realtime configuration settings
 * @param {Function} logger - Logging function
 */
const signalRSource = function (settings, logger) {
  const isAvailable = () => true;

  const subscriptionStatusUpdateTypes = {
    connectionLost: "ConnectionLost",
    reconnected: "Reconnected",
    subscribed: "Subscribed",
  };

  let onSourceExpiredHandler;
  let onNotificationHandler;
  let onConnectionEventHandler;

  // Topic handlers (set by TopicManager)
  let topicNotificationHandler = null;
  let topicReadyHandler = null;
  let topicSubscriptionErrorHandler = null;
  let topicTokenExpiryHandler = null;

  // State
  let isCurrentlyConnected = false;
  let isReplicationEnabled = false;
  let durableReplayerRef = null;

  let signalRConnectionTimeout = null;
  let hasConnectionSucceeded = false;
  let waitForSubscriptionStatusTimeout = null;
  const waitForSubscriptionStatusTimeoutWait = 2000;

  let lastSequenceNumber = -1;
  let lastNamespaceSequenceNumberObj = {};

  let signalRConnection = null;

  let connectionId = "";

  const log = (message, isVerbose) => {
    if (logger) {
      logger(`SignalRSource: ${message}`, isVerbose);
    }
  };

  const getConnection = () => signalRConnection?.GetConnection?.() || null;

  const subscribeTopic = (token, replaceToken = null) => {
    const connection = getConnection();
    if (!connection?.invoke) {
      log("Topic subscribe: connection not available");
      return;
    }
    log(`Topic subscribe: ${token}`);
    connection.invoke("SubscribeTopic", token, replaceToken).catch(e => {
      log(`Topic subscribe failed: ${e}`);
    });
  };

  const unsubscribeTopic = token => {
    const connection = getConnection();
    if (!connection?.invoke) {
      log("Topic unsubscribe: connection not available");
      return;
    }
    log(`Topic unsubscribe: ${token}`);
    connection.invoke("UnsubscribeTopic", token).catch(e => {
      log(`Topic unsubscribe failed: ${e}`);
    });
  };

  const setupReplication = () => {
    kingmaker.subscribeToMasterChange(isMasterTab => {
      isReplicationEnabled = isMasterTab;
      if (!isMasterTab) {
        onSourceExpiredHandler();
      }
    });
    isReplicationEnabled = kingmaker.isMasterTab();
    pubSub.subscribe(
      realtimeEvents.RequestForConnectionStatus,
      "Roblox.RealTime.Sources.SignalRSource",
      () => {
        if (isReplicationEnabled) {
          const connectionEvent = {
            isConnected: isCurrentlyConnected,
            sequenceNumber: lastSequenceNumber,
            namespaceSequenceNumbersObj: lastNamespaceSequenceNumberObj,
          };
          log(`Responding to request for connection status: ${JSON.stringify(connectionEvent)}`);
          pubSub.publish(realtimeEvents.ConnectionEvent, JSON.stringify(connectionEvent));
        }
      },
    );

    // Listen for topic subscribe requests from follower tabs
    pubSub.subscribe(
      topicChannels.SubscribeRequest,
      "Roblox.RealTime.Sources.SignalRSource",
      message => {
        if (!isReplicationEnabled || !message) return;
        try {
          const { token, replaceToken } = JSON.parse(message);
          log(`Topic subscribe request from follower: ${token}`);
          subscribeTopic(token, replaceToken);
        } catch (e) {
          log(`Failed to parse topic subscribe request: ${e}`);
        }
      },
    );

    // Listen for topic unsubscribe requests from follower tabs
    pubSub.subscribe(
      topicChannels.UnsubscribeRequest,
      "Roblox.RealTime.Sources.SignalRSource",
      message => {
        if (!isReplicationEnabled || !message) return;
        try {
          const { token } = JSON.parse(message);
          log(`Topic unsubscribe request from follower: ${token}`);
          unsubscribeTopic(token);
        } catch (e) {
          log(`Failed to parse topic unsubscribe request: ${e}`);
        }
      },
    );
  };

  const handleNotificationMessage = (namespace, detail, sequenceNumber) => {
    const parsedDetail = JSON.parse(detail);
    const namespaceSequenceNumber = parsedDetail.SequenceNumber || 0;
    const notification = {
      namespace,
      detail: parsedDetail,
      sequenceNumber,
      namespaceSequenceNumber,
    };
    log(`Notification received: ${JSON.stringify(notification)}`, true);
    lastSequenceNumber = sequenceNumber || -1;
    lastNamespaceSequenceNumberObj[namespace] = namespaceSequenceNumber || -1;

    onNotificationHandler(notification);
    if (isReplicationEnabled) {
      log("Replicating Notification");
      pubSub.publish(realtimeEvents.Notification, JSON.stringify(notification));
    }
  };

  const handleTopicNotificationMessage = (topicId, detail) => {
    log(`Topic notification received: ${topicId}`, true);
    if (topicNotificationHandler) {
      topicNotificationHandler(topicId, detail);
    }
    if (isReplicationEnabled) {
      log("Replicating topic notification to followers");
      pubSub.publish(topicChannels.Notification, JSON.stringify({ topicId, detail }));
    }
  };

  const handleTopicSubscriptionErrorMessage = (token, errorCode, shouldRetry) => {
    log(`Topic subscription error: ${errorCode} (shouldRetry=${shouldRetry}) for token: ${token}`);
    if (topicSubscriptionErrorHandler) {
      topicSubscriptionErrorHandler(token, errorCode, shouldRetry);
    }
    if (isReplicationEnabled) {
      pubSub.publish(
        topicChannels.SubscriptionError,
        JSON.stringify({ token, errorCode, shouldRetry }),
      );
    }
  };

  const handleTopicTokenExpiryMessage = (
    token,
    shouldExchange,
    isSubscribable,
    subscriptionActive,
  ) => {
    log(
      `Topic token expiry: shouldExchange=${shouldExchange} isSubscribable=${isSubscribable} subscriptionActive=${subscriptionActive}`,
    );
    if (topicTokenExpiryHandler) {
      topicTokenExpiryHandler(token, shouldExchange, isSubscribable, subscriptionActive);
    }
    if (isReplicationEnabled) {
      pubSub.publish(
        topicChannels.TokenExpiry,
        JSON.stringify({ token, shouldExchange, isSubscribable, subscriptionActive }),
      );
    }
  };

  const notifyTopicReady = () => {
    if (topicReadyHandler) {
      topicReadyHandler();
    }
    if (isReplicationEnabled) {
      log("Broadcasting LeaderReconnected to followers");
      pubSub.publish(topicChannels.LeaderReconnected, "");
    }
  };

  const processConnectionEvent = (isConnected, subscriptionStatus) => {
    isCurrentlyConnected = isConnected;

    const connectionEvent = {
      isConnected,
    };

    const sequenceNumber = subscriptionStatus ? subscriptionStatus.SequenceNumber : null; // this is the default sequenceNumber
    let namespaceSequenceNumbersObj = subscriptionStatus
      ? subscriptionStatus.NamespaceSequenceNumbers
      : {};
    namespaceSequenceNumbersObj = namespaceSequenceNumbersObj || {};
    if (sequenceNumber !== null) {
      connectionEvent.sequenceNumber = sequenceNumber;
      lastSequenceNumber = sequenceNumber;
    } else {
      lastSequenceNumber = -1;
    }

    if (
      namespaceSequenceNumbersObj.constructor === Object &&
      Object.keys(namespaceSequenceNumbersObj).length > 0
    ) {
      connectionEvent.namespaceSequenceNumbersObj = namespaceSequenceNumbersObj;
      lastNamespaceSequenceNumberObj = namespaceSequenceNumbersObj;
    } else if (
      Object.keys(lastNamespaceSequenceNumberObj).length > 0 &&
      isConnected &&
      Object.keys(namespaceSequenceNumbersObj).length === 0
    ) {
      // TODO: old, migrated code
      // eslint-disable-next-line no-restricted-syntax
      for (const namespace in lastNamespaceSequenceNumberObj) {
        if (Object.prototype.hasOwnProperty.call(lastNamespaceSequenceNumberObj, namespace)) {
          lastNamespaceSequenceNumberObj[namespace] = 0;
        }
      }
      connectionEvent.namespaceSequenceNumbersObj = lastNamespaceSequenceNumberObj;
    }

    log(`Sending Connection Event: ${JSON.stringify(connectionEvent)}`);
    onConnectionEventHandler(connectionEvent);
    if (isReplicationEnabled) {
      log("Replicating Connection Event.");
      pubSub.publish(realtimeEvents.ConnectionEvent, JSON.stringify(connectionEvent));
    }

    // Notify topic ready on connection
    if (isConnected) {
      notifyTopicReady();
      durableReplayerRef?.maybeRequestReplay();
      durableReplayerRef?.startPolling();
    }
  };

  // Holds the current "focus" listener so it can be removed later. Named (rather
  // than anonymous) because native removeEventListener requires a stable reference,
  // whereas the legacy jQuery implementation removed it by the "focus.enforceMaxTimeout" namespace.
  let enforceMaxTimeoutFocusHandler = null;

  const stopExistingSignalRTimeout = () => {
    if (enforceMaxTimeoutFocusHandler) {
      window.removeEventListener("focus", enforceMaxTimeoutFocusHandler);
    }
    if (signalRConnectionTimeout !== null) {
      clearTimeout(signalRConnectionTimeout);
      signalRConnectionTimeout = null;
    }
  };

  const setupSignalRTimeout = () => {
    stopExistingSignalRTimeout();
    signalRConnectionTimeout = setTimeout(() => {
      processConnectionEvent(false); // This is done before endConnection so that the replicator doesnt get nulled out. We want to replicate this message.
      signalRConnection.Stop();
      enforceMaxTimeoutFocusHandler = () => {
        signalRConnection.Start();
        setupSignalRTimeout();
      };
      window.addEventListener("focus", enforceMaxTimeoutFocusHandler);
    }, settings.maxConnectionTimeInMs);
  };

  const relayConnectionEventAfterWaitingRequestedTime = subscriptionStatus => {
    if (waitForSubscriptionStatusTimeout !== null) {
      clearTimeout(waitForSubscriptionStatusTimeout);
      waitForSubscriptionStatusTimeout = null;
    }

    if (subscriptionStatus.MillisecondsBeforeHandlingReconnect > 0) {
      log(
        `Waiting ${subscriptionStatus.MillisecondsBeforeHandlingReconnect}ms to send Reconnected signal`,
      );

      setTimeout(() => {
        if (signalRConnection.IsConnected()) {
          processConnectionEvent(true, subscriptionStatus);
        }
      }, subscriptionStatus.MillisecondsBeforeHandlingReconnect);
    } else if (signalRConnection.IsConnected()) {
      processConnectionEvent(true, subscriptionStatus);
    }
  };

  const sendConnectionEventToDataLake = (connectionState, subscriptionStatusUpdateType) => {
    // subscriptionStatusUpdateType may be undefined, which is for a connection event

    // map connection states to expected values in proto schema
    // keep in sync with ConnectionState enum in realtime_clientside_connection_changes.proto
    // in proto-schemas
    const connectionStateMap = {
      [signalR.HubConnectionState.Connecting]: 0, // not used
      [signalR.HubConnectionState.Connected]: 1,
      [signalR.HubConnectionState.Reconnecting]: 2, // not used
      [signalR.HubConnectionState.Disconnected]: 3,
      NO_CONNECTION_UPDATE: 4,
    };

    sendConnectionEventToDataLakeUtil(
      connectionStateMap[connectionState] ?? connectionStateMap.NO_CONNECTION_UPDATE,
      connectionId,
      subscriptionStatusUpdateType,
    );
  };

  const setConnectionId = detailConnectionId => {
    if (detailConnectionId) {
      connectionId = detailConnectionId;
    }
  };

  const handleSubscriptionStatusUpdateMessage = (updateType, detailString) => {
    try {
      log(`Status Update Received: [${updateType}]${detailString}`);
    } catch {
      /* empty */
    }

    if (settings.isRealtimeWebAnalyticsConnectionEventsEnabled) {
      if (updateType === subscriptionStatusUpdateTypes.connectionLost) {
        // If the server loses its subscription to events, we will attempt
        // to restart the signalR connections and treat it like a standard
        // connection drop

        log("Server Backend Connection Lost!");
        signalRConnection.Restart();
      } else if (updateType === subscriptionStatusUpdateTypes.reconnected) {
        log("Server reconnected");
        const detail = JSON.parse(detailString);
        setConnectionId(detail.ConnectionId);
        relayConnectionEventAfterWaitingRequestedTime(detail);
      } else if (updateType === subscriptionStatusUpdateTypes.subscribed) {
        const detail = JSON.parse(detailString);
        setConnectionId(detail.ConnectionId);
        log("Server connected");

        if (!hasConnectionSucceeded) {
          // if this client hasn't connected before, allow them to connect immediately
          hasConnectionSucceeded = true;
          detail.MillisecondsBeforeHandlingReconnect = 0;
        }

        relayConnectionEventAfterWaitingRequestedTime(detail);
      }

      sendConnectionEventToDataLake("NO_CONNECTION_UPDATE", updateType);
    } else {
      // disabling for flag logic
      // eslint-disable-next-line no-lonely-if
      if (updateType === subscriptionStatusUpdateTypes.connectionLost) {
        // If the server loses its subscription to events, we will attempt
        // to restart the signalR connections and treat it like a standard
        // connection drop

        log("Server Backend Connection Lost!");
        signalRConnection.Restart();
      } else if (updateType === subscriptionStatusUpdateTypes.reconnected) {
        log("Server reconnected");
        relayConnectionEventAfterWaitingRequestedTime(JSON.parse(detailString));
      } else if (updateType === subscriptionStatusUpdateTypes.subscribed) {
        const detail = JSON.parse(detailString);
        log("Server connected");

        if (!hasConnectionSucceeded) {
          // if this client hasn't connected before, allow them to connect immediately
          hasConnectionSucceeded = true;
          detail.MillisecondsBeforeHandlingReconnect = 0;
        }

        relayConnectionEventAfterWaitingRequestedTime(detail);
      }
    }
  };

  const handleSignalRConnectionChanged = isConnected => {
    if (isConnected) {
      // wait till we receive a subscription status message, but if we don't receive it take action
      waitForSubscriptionStatusTimeout = setTimeout(() => {
        waitForSubscriptionStatusTimeout = null;
        if (signalRConnection.IsConnected()) {
          hasConnectionSucceeded = true;
          processConnectionEvent(true);
        }
      }, waitForSubscriptionStatusTimeoutWait);
    } else {
      processConnectionEvent(false);
    }
  };

  const start = (onSourceExpired, onNotification, onConnectionEvent) => {
    onSourceExpiredHandler = onSourceExpired;
    onNotificationHandler = onNotification;
    onConnectionEventHandler = onConnectionEvent;

    setupReplication();

    signalRConnection = new CoreSignalRConnectionWrapper(
      settings,
      logger,
      handleSignalRConnectionChanged,
      handleNotificationMessage,
      handleSubscriptionStatusUpdateMessage,
      handleTopicNotificationMessage,
      sendConnectionEventToDataLake,
      handleTopicSubscriptionErrorMessage,
      handleTopicTokenExpiryMessage,
    );
    log("Started Core SignalR connection");

    signalRConnection.Start();
    setupSignalRTimeout();

    return true;
  };

  const stop = () => {
    stopExistingSignalRTimeout();
    if (signalRConnection) {
      signalRConnection.Stop();
    }
  };

  // ============================================================================
  // TOPIC SUPPORT
  // ============================================================================

  const setTopicNotificationHandler = handler => {
    topicNotificationHandler = handler;
  };

  const setTopicReadyHandler = handler => {
    topicReadyHandler = handler;
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
  this.Name = "SignalRSource";

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

export default signalRSource;
