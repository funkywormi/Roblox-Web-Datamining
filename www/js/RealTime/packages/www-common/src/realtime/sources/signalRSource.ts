// Payloads are JSON from SignalR and this module's own cross-tab publishers.
/* eslint-disable @typescript-eslint/no-unsafe-type-assertion */
import * as signalR from "@microsoft/signalr";
import { pubSub, kingmaker } from "../../crossTabCommunication";
import { realtimeEvents, topicChannels } from "../constants/events";
import CoreSignalRConnectionWrapper, {
  type CoreSignalRConnection,
} from "../lib/coreSignalRConnectionWrapper";
import type { DurableReplayer } from "../lib/durableReplayer";
import type { RealtimeSettings } from "../lib/factory";
import type {
  ConnectionEvent,
  ConnectionEventHandler,
  Logger,
  NotificationDetail,
  NotificationHandler,
  RealtimeSource,
  RealtimeSourceConstructor,
  SourceExpiredHandler,
  TopicNotificationHandler,
  TopicReadyHandler,
  TopicSubscribeRequest,
  TopicSubscriptionErrorHandler,
  TopicTokenExpiryHandler,
  TopicUnsubscribeRequest,
} from "../lib/types";
import { sendConnectionEventToDataLake as sendConnectionEventToDataLakeUtil } from "../utils/events";

/**
 * SignalR-based realtime notification source.
 * Establishes WebSocket connection to SignalR server for namespace and topic notifications.
 * Used by master tabs or when localStorage unavailable (single-tab mode).
 *
 * @param {Object} settings - Realtime configuration settings
 * @param {Function} logger - Logging function
 */
type SubscriptionStatus = {
  SequenceNumber?: number;
  NamespaceSequenceNumbers?: Record<string, number> | null;
  MillisecondsBeforeHandlingReconnect: number;
  ConnectionId?: string;
};

type ConnectionStateKey = signalR.HubConnectionState | "NO_CONNECTION_UPDATE";

const signalRSource = function (
  this: RealtimeSource,
  settings: RealtimeSettings,
  logger: Logger | undefined,
) {
  const isAvailable = () => true;

  const subscriptionStatusUpdateTypes = {
    connectionLost: "ConnectionLost",
    reconnected: "Reconnected",
    subscribed: "Subscribed",
  };

  // Assigned in start before anything can call them.
  let onSourceExpiredHandler!: SourceExpiredHandler;
  let onNotificationHandler!: NotificationHandler;
  let onConnectionEventHandler!: ConnectionEventHandler;

  // Topic handlers (set by TopicManager)
  let topicNotificationHandler: TopicNotificationHandler | null = null;
  let topicReadyHandler: TopicReadyHandler | null = null;
  let topicSubscriptionErrorHandler: TopicSubscriptionErrorHandler | null = null;
  let topicTokenExpiryHandler: TopicTokenExpiryHandler | null = null;

  // State
  let isCurrentlyConnected = false;
  let isReplicationEnabled = false;
  let durableReplayerRef: DurableReplayer | null = null;

  let signalRConnectionTimeout: ReturnType<typeof setTimeout> | null = null;
  let hasConnectionSucceeded = false;
  let waitForSubscriptionStatusTimeout: ReturnType<typeof setTimeout> | null = null;
  const waitForSubscriptionStatusTimeoutWait = 2000;

  let lastSequenceNumber: number | undefined = -1;
  let lastNamespaceSequenceNumberObj: Record<string, number> = {};

  let signalRConnection: CoreSignalRConnection | null = null;

  // Null until start(); asserts once here instead of at each call site. Pre-start calls throw, as in the JS.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const connectionWrapper = () => signalRConnection!;

  let connectionId = "";

  const log = (message: string, isVerbose?: boolean) => {
    if (logger) {
      logger(`SignalRSource: ${message}`, isVerbose);
    }
  };

  // Defensive: test doubles of the wrapper omit GetConnection.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/prefer-nullish-coalescing
  const getConnection = () => signalRConnection?.GetConnection?.() || null;

  const subscribeTopic = (token: string, replaceToken: string | null = null) => {
    const connection = getConnection();
    if (!connection?.invoke) {
      log("Topic subscribe: connection not available");
      return;
    }
    log(`Topic subscribe: ${token}`);
    connection.invoke("SubscribeTopic", token, replaceToken).catch((e: unknown) => {
      log(`Topic subscribe failed: ${String(e)}`);
    });
  };

  const unsubscribeTopic = (token: string) => {
    const connection = getConnection();
    if (!connection?.invoke) {
      log("Topic unsubscribe: connection not available");
      return;
    }
    log(`Topic unsubscribe: ${token}`);
    connection.invoke("UnsubscribeTopic", token).catch((e: unknown) => {
      log(`Topic unsubscribe failed: ${String(e)}`);
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
          const connectionEvent: ConnectionEvent = {
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
          const { token, replaceToken } = JSON.parse(message) as TopicSubscribeRequest;
          log(`Topic subscribe request from follower: ${token}`);
          subscribeTopic(token, replaceToken);
        } catch (e) {
          log(`Failed to parse topic subscribe request: ${String(e)}`);
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
          const { token } = JSON.parse(message) as TopicUnsubscribeRequest;
          log(`Topic unsubscribe request from follower: ${token}`);
          unsubscribeTopic(token);
        } catch (e) {
          log(`Failed to parse topic unsubscribe request: ${String(e)}`);
        }
      },
    );
  };

  const handleNotificationMessage = (namespace: string, detail: string, sequenceNumber: number) => {
    const parsedDetail = JSON.parse(detail) as NotificationDetail;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
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

  const handleTopicNotificationMessage = (topicId: string, detail: unknown) => {
    log(`Topic notification received: ${topicId}`, true);
    if (topicNotificationHandler) {
      topicNotificationHandler(topicId, detail);
    }
    if (isReplicationEnabled) {
      log("Replicating topic notification to followers");
      pubSub.publish(topicChannels.Notification, JSON.stringify({ topicId, detail }));
    }
  };

  const handleTopicSubscriptionErrorMessage = (
    token: string,
    errorCode: string,
    shouldRetry: boolean,
  ) => {
    log(
      `Topic subscription error: ${errorCode} (shouldRetry=${String(shouldRetry)}) for token: ${token}`,
    );
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
    token: string,
    shouldExchange: boolean,
    isSubscribable: boolean,
    subscriptionActive: boolean,
  ) => {
    log(
      `Topic token expiry: shouldExchange=${String(shouldExchange)} isSubscribable=${String(isSubscribable)} subscriptionActive=${String(subscriptionActive)}`,
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

  const processConnectionEvent = (
    isConnected: boolean,
    subscriptionStatus?: SubscriptionStatus,
  ) => {
    isCurrentlyConnected = isConnected;

    const connectionEvent: ConnectionEvent = {
      isConnected,
    };

    const sequenceNumber = subscriptionStatus ? subscriptionStatus.SequenceNumber : null; // this is the default sequenceNumber
    let namespaceSequenceNumbersObj = subscriptionStatus
      ? subscriptionStatus.NamespaceSequenceNumbers
      : {};
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
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
        // eslint-disable-next-line e18e/prefer-object-has-own -- Object.hasOwn is missing on older Safari
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
      // Left unobserved as before; the replayer handles its own errors.
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      durableReplayerRef?.maybeRequestReplay();
      durableReplayerRef?.startPolling();
    }
  };

  // Holds the current "focus" listener so it can be removed later. Named (rather
  // than anonymous) because native removeEventListener requires a stable reference,
  // whereas the legacy jQuery implementation removed it by the "focus.enforceMaxTimeout" namespace.
  let enforceMaxTimeoutFocusHandler: (() => void) | null = null;

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
      connectionWrapper().Stop();
      enforceMaxTimeoutFocusHandler = () => {
        connectionWrapper().Start();
        setupSignalRTimeout();
      };
      window.addEventListener("focus", enforceMaxTimeoutFocusHandler);
    }, settings.maxConnectionTimeInMs);
  };

  const relayConnectionEventAfterWaitingRequestedTime = (
    subscriptionStatus: SubscriptionStatus,
  ) => {
    if (waitForSubscriptionStatusTimeout !== null) {
      clearTimeout(waitForSubscriptionStatusTimeout);
      waitForSubscriptionStatusTimeout = null;
    }

    if (subscriptionStatus.MillisecondsBeforeHandlingReconnect > 0) {
      log(
        `Waiting ${subscriptionStatus.MillisecondsBeforeHandlingReconnect}ms to send Reconnected signal`,
      );

      setTimeout(() => {
        if (connectionWrapper().IsConnected()) {
          processConnectionEvent(true, subscriptionStatus);
        }
      }, subscriptionStatus.MillisecondsBeforeHandlingReconnect);
    } else if (connectionWrapper().IsConnected()) {
      processConnectionEvent(true, subscriptionStatus);
    }
  };

  const sendConnectionEventToDataLake = (
    connectionState: ConnectionStateKey,
    subscriptionStatusUpdateType?: string,
  ) => {
    // subscriptionStatusUpdateType may be undefined, which is for a connection event

    // map connection states to expected values in proto schema
    // keep in sync with ConnectionState enum in realtime_clientside_connection_changes.proto
    // in proto-schemas
    const connectionStateMap: Partial<Record<ConnectionStateKey, number>> & {
      NO_CONNECTION_UPDATE: number;
    } = {
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

  const setConnectionId = (detailConnectionId: string | undefined) => {
    if (detailConnectionId) {
      connectionId = detailConnectionId;
    }
  };

  const handleSubscriptionStatusUpdateMessage = (updateType: string, detailString: string) => {
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
        connectionWrapper().Restart();
      } else if (updateType === subscriptionStatusUpdateTypes.reconnected) {
        log("Server reconnected");
        const detail = JSON.parse(detailString) as SubscriptionStatus;
        setConnectionId(detail.ConnectionId);
        relayConnectionEventAfterWaitingRequestedTime(detail);
      } else if (updateType === subscriptionStatusUpdateTypes.subscribed) {
        const detail = JSON.parse(detailString) as SubscriptionStatus;
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
        connectionWrapper().Restart();
      } else if (updateType === subscriptionStatusUpdateTypes.reconnected) {
        log("Server reconnected");
        relayConnectionEventAfterWaitingRequestedTime(
          JSON.parse(detailString) as SubscriptionStatus,
        );
      } else if (updateType === subscriptionStatusUpdateTypes.subscribed) {
        const detail = JSON.parse(detailString) as SubscriptionStatus;
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

  const handleSignalRConnectionChanged = (isConnected: boolean) => {
    if (isConnected) {
      // wait till we receive a subscription status message, but if we don't receive it take action
      waitForSubscriptionStatusTimeout = setTimeout(() => {
        waitForSubscriptionStatusTimeout = null;
        if (connectionWrapper().IsConnected()) {
          hasConnectionSucceeded = true;
          processConnectionEvent(true);
        }
      }, waitForSubscriptionStatusTimeoutWait);
    } else {
      processConnectionEvent(false);
    }
  };

  const start: RealtimeSource["Start"] = (onSourceExpired, onNotification, onConnectionEvent) => {
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

  const setTopicNotificationHandler = (handler: TopicNotificationHandler | null) => {
    topicNotificationHandler = handler;
  };

  const setTopicReadyHandler = (handler: TopicReadyHandler | null) => {
    topicReadyHandler = handler;
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

// Called with new; typed as a constructor at this boundary.
export default signalRSource as unknown as RealtimeSourceConstructor;
