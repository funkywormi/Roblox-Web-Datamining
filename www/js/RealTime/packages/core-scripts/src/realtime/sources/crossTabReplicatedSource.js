// TODO: old, migrated code
/* eslint-disable no-invalid-this */
import { pubSub, kingmaker } from "@rbx/core-scripts/util/cross-tab-communication";
import { realtimeEvents, topicChannels } from "../constants/events";

/**
 * Cross-tab replicated source for follower tabs.
 * Receives namespace notification broadcasts from master tab via localStorage pubSub.
 * Does NOT establish its own SignalR connection.
 * Does NOT handle topic subscription requests (client uses pubSub directly for topics).
 *
 * @param {Object} _settings - Realtime configuration settings (unused)
 * @param {Function} logger - Logging function
 */
const crossTabReplicatedSource = function (_settings, logger) {
  const subscriberNamespace = "Roblox.RealTime.Sources.CrossTabReplicatedSource";
  let isRunning = false;

  let onSourceExpiredHandler;
  let onNotificationHandler;
  let onConnectionEventHandler;

  // Topic handlers (set by TopicManager)
  let topicNotificationHandler = null;
  let topicReadyHandler = null;
  let topicSubscriptionErrorHandler = null;
  let topicTokenExpiryHandler = null;

  const log = (message, isVerbose) => {
    if (logger) {
      logger(`CrossTabReplicatedSource: ${message}`, isVerbose);
    }
  };

  const available = () => {
    if (!pubSub.isAvailable()) {
      log("CrossTabCommunication.Kingmaker not available - cannot pick a master tab");
      return false;
    }
    if (kingmaker.isMasterTab()) {
      log("This is the master tab - it needs to send the events, not listen to them");
      return false;
    }
    return true;
  };

  const subscribeToEvents = () => {
    kingmaker.subscribeToMasterChange(isMasterTab => {
      if (isMasterTab && isRunning && onSourceExpiredHandler) {
        log("Tab has been promoted to master tab - triggering end of this source");
        onSourceExpiredHandler();
      }
    });
    pubSub.subscribe(realtimeEvents.Notification, subscriberNamespace, notification => {
      log(`Notification Received: ${notification}`, true);
      if (notification) {
        onNotificationHandler(JSON.parse(notification));
      }
    });
    pubSub.subscribe(realtimeEvents.ConnectionEvent, subscriberNamespace, event => {
      log(`Connection Event Received: ${event}`);
      if (event) {
        onConnectionEventHandler(JSON.parse(event));
      }
    });

    // Subscribe to topic notifications from leader
    pubSub.subscribe(topicChannels.Notification, subscriberNamespace, message => {
      if (!message) return;
      try {
        const { topicId, detail } = JSON.parse(message);
        log(`Topic notification received from leader: ${topicId}`, true);
        if (topicNotificationHandler) {
          topicNotificationHandler(topicId, detail);
        }
      } catch (e) {
        log(`Failed to parse topic notification: ${e}`);
      }
    });

    // Subscribe to leader reconnection notifications
    // Guard against null from pubSub.publish's removeItem (fires a separate storage event)
    pubSub.subscribe(topicChannels.LeaderReconnected, subscriberNamespace, message => {
      if (message === null) return;
      log("Leader reconnected - triggering topic ready handler");
      if (topicReadyHandler) {
        topicReadyHandler();
      }
    });

    // Subscribe to topic subscription errors from leader
    pubSub.subscribe(topicChannels.SubscriptionError, subscriberNamespace, message => {
      if (!message) return;
      try {
        const { token, errorCode, shouldRetry } = JSON.parse(message);
        log(`Topic subscription error from leader: ${errorCode}`);
        topicSubscriptionErrorHandler?.(token, errorCode, shouldRetry);
      } catch (e) {
        log(`Failed to parse topic subscription error: ${e}`);
      }
    });

    // Subscribe to topic token expiry from leader
    pubSub.subscribe(topicChannels.TokenExpiry, subscriberNamespace, message => {
      if (!message) return;
      try {
        const { token, shouldExchange, isSubscribable, subscriptionActive } = JSON.parse(message);
        log(`Topic token expiry from leader: isSubscribable=${isSubscribable}`);
        topicTokenExpiryHandler?.(token, shouldExchange, isSubscribable, subscriptionActive);
      } catch (e) {
        log(`Failed to parse topic token expiry: ${e}`);
      }
    });
  };

  const requestConnectionStatus = () => {
    pubSub.publish(
      realtimeEvents.RequestForConnectionStatus,
      realtimeEvents.RequestForConnectionStatus,
    );
  };

  const stop = () => {
    log("Stopping. Unsubscribing from Cross-Tab events");
    isRunning = false;
    pubSub.unsubscribe(realtimeEvents.Notification, subscriberNamespace);
    pubSub.unsubscribe(realtimeEvents.ConnectionEvent, subscriberNamespace);
    pubSub.unsubscribe(topicChannels.Notification, subscriberNamespace);
    pubSub.unsubscribe(topicChannels.LeaderReconnected, subscriberNamespace);
    pubSub.unsubscribe(topicChannels.SubscriptionError, subscriberNamespace);
    pubSub.unsubscribe(topicChannels.TokenExpiry, subscriberNamespace);
  };

  const start = (onSourceExpired, onNotification, onConnectionEvent) => {
    if (!available()) {
      return false;
    }
    isRunning = true;

    onSourceExpiredHandler = onSourceExpired;
    onNotificationHandler = onNotification;
    onConnectionEventHandler = onConnectionEvent;

    subscribeToEvents();
    requestConnectionStatus();

    return true;
  };

  // ============================================================================
  // TOPIC NOTIFICATION SUPPORT
  // ============================================================================

  const subscribeTopic = (token, replaceToken = null) => {
    if (!pubSub?.isAvailable?.()) {
      log("Topic subscribe: pubSub not available");
      return;
    }

    const request = {
      token,
      replaceToken,
      timestamp: Date.now(),
    };
    log(`Topic subscribe: Sending request to leader for: ${token}`);
    pubSub.publish(topicChannels.SubscribeRequest, JSON.stringify(request));
  };

  const unsubscribeTopic = token => {
    if (!pubSub?.isAvailable?.()) {
      log("Topic unsubscribe: pubSub not available");
      return;
    }
    log(`Topic unsubscribe: Sending request to leader for: ${token}`);
    pubSub.publish(
      topicChannels.UnsubscribeRequest,
      JSON.stringify({ token, timestamp: Date.now() }),
    );
  };

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

  // Public API
  this.IsAvailable = available;
  this.Start = start;
  this.Stop = stop;
  this.Name = "CrossTabReplicatedSource";

  // Durable replay: no-op for follower tabs (leader handles replay)
  this.SetDurableReplayer = () => undefined;

  // Topic support
  this.SubscribeTopic = subscribeTopic;
  this.UnsubscribeTopic = unsubscribeTopic;
  this.SetTopicNotificationHandler = setTopicNotificationHandler;
  this.SetTopicReadyHandler = setTopicReadyHandler;
  this.SetTopicSubscriptionErrorHandler = setTopicSubscriptionErrorHandler;
  this.SetTopicTokenExpiryHandler = setTopicTokenExpiryHandler;
};

export default crossTabReplicatedSource;
