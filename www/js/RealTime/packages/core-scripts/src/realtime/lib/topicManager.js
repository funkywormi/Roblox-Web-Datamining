/**
 * TopicManager - Manages topic-based notifications (source-agnostic)
 *
 * Responsibilities:
 * - Subscribe/unsubscribe to topic notifications
 * - Maintain callback registry (topicId → Set<callback>)
 * - Handle subscription errors and token expiry from server
 * - Delegate subscription and notification handling to source
 *
 * Does NOT know about:
 * - SignalR, pubSub, or kingmaker
 * - Leader/follower roles
 * - Cross-tab coordination (handled by sources)
 */

/**
 * Creates a TopicManager instance
 * @param {object} dependencies - Injected dependencies
 * @param {function} dependencies.log - Logger function(message, isVerbose)
 * @returns {object} TopicManager instance
 */
const createTopicManager = ({ log }) => {
  // ============================================================================
  // STATE
  // ============================================================================

  // Subscriptions: topicId → { token, callbacks: Set<fn>, onError }
  const subscriptions = {};

  // Reference to current source (set via onSourceChanged)
  let currentSource = null;

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Extract topicId from token
   * Token format: "{namespace}!{topic}.body.sig"
   * TopicId format: "{namespace}!{topic}"
   */
  const extractTopicId = token => {
    if (!token || typeof token !== "string") {
      return null;
    }

    const dotIndex = token.indexOf(".");
    if (dotIndex < 0) {
      return null;
    }

    const topicId = token.substring(0, dotIndex);

    if (!topicId.includes("!")) {
      return null;
    }

    return topicId;
  };

  const findSubscriptionByToken = token => {
    const topicId = extractTopicId(token);
    if (!topicId || !subscriptions[topicId]) {
      return null;
    }
    // Reject stale tokens: after rotation, late events for the old token must not affect the current subscription
    if (subscriptions[topicId].token !== token) {
      log(`Topic notifications: Ignoring event for stale token on ${topicId}`, true);
      return null;
    }
    return { topicId, sub: subscriptions[topicId] };
  };

  /**
   * Dispatch notification to local callbacks for a topic
   */
  const dispatchToCallbacks = (topicId, detail) => {
    const sub = subscriptions[topicId];
    if (!sub?.callbacks?.size) {
      return;
    }

    log(
      `Topic notifications: Dispatching to ${sub.callbacks.size} callback(s) for ${topicId}`,
      true,
    );

    for (const callback of [...sub.callbacks]) {
      try {
        callback(detail);
      } catch (e) {
        log(`Topic notifications: Error in callback for ${topicId}: ${e}`);
      }
    }
  };

  const dispatchError = (topicId, error) => {
    const sub = subscriptions[topicId];
    if (!sub?.onError) {
      return;
    }
    try {
      sub.onError(error);
    } catch (e) {
      log(`Topic notifications: Error in onError callback for ${topicId}: ${e}`);
    }
  };

  const removeSubscription = topicId => {
    delete subscriptions[topicId];
  };

  /**
   * Re-subscribe all current subscriptions via the source.
   * Called when source becomes ready (connect/reconnect).
   */
  const resubscribeAll = () => {
    const subs = Object.values(subscriptions);
    if (subs.length === 0) {
      return;
    }

    log(`Topic notifications: Re-subscribing to ${subs.length} topic(s)`);

    for (const sub of subs) {
      if (sub?.token) {
        currentSource?.SubscribeTopic?.(sub.token, null);
      }
    }
  };

  // ============================================================================
  // SERVER EVENT HANDLERS
  // ============================================================================

  const handleSubscriptionError = (token, errorCode, shouldRetry) => {
    const match = findSubscriptionByToken(token);
    if (!match) {
      return;
    }
    const { topicId } = match;

    log(
      `Topic notifications: Subscription error for ${topicId}: ${errorCode} (shouldRetry=${shouldRetry})`,
    );
    dispatchError(topicId, { type: "error", errorCode, shouldRetry });
    removeSubscription(topicId);
  };

  // _subscriptionActive: sent by server but not needed client-side (server uses it to distinguish warning vs expiry)
  const handleTokenExpiry = (token, shouldExchange, isSubscribable, _subscriptionActive) => {
    const match = findSubscriptionByToken(token);
    if (!match) {
      return;
    }
    const { topicId, sub } = match;

    if (isSubscribable) {
      log(`Topic notifications: Auto-resubscribing ${topicId} (still subscribable)`);
      currentSource?.SubscribeTopic?.(sub.token, null);
      return;
    }

    // Token is no longer subscribable -- notify consumer and clean up
    log(`Topic notifications: Token expired for ${topicId} (shouldExchange=${shouldExchange})`);
    dispatchError(topicId, { type: "expired", shouldExchange });
    removeSubscription(topicId);
  };

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  /**
   * Subscribe to topic notifications
   * @param {string} token - Topic token (format: "{namespace}!{topic}.body.sig")
   * @param {function} callback - Called when notification received
   * @param {object} [options] - Optional settings
   * @param {function} [options.onError] - Called on subscription error or token expiry
   * @returns {object} Handle with unsubscribe() method
   */
  const subscribe = (token, callback, { onError } = {}) => {
    const topicId = extractTopicId(token);
    if (!topicId) {
      log(`Topic notifications: Failed to extract topicId from token`);
      // eslint-disable-next-line no-empty-function
      return { unsubscribe: () => {} };
    }

    log(`Topic notifications: Subscribing to topicId: ${topicId}`);

    if (!subscriptions[topicId]) {
      subscriptions[topicId] = {
        token,
        callbacks: new Set(),
        onError: null,
      };
    }

    const sub = subscriptions[topicId];

    const oldToken = sub.token !== token ? sub.token : null;
    sub.token = token;

    sub.callbacks.add(callback);

    if (onError) {
      sub.onError = onError;
    }

    currentSource?.SubscribeTopic?.(token, oldToken);

    return {
      unsubscribe: () => {
        log(`Topic notifications: Unsubscribing callback from topicId: ${topicId}`);
        const subscription = subscriptions[topicId];
        if (subscription) {
          subscription.callbacks.delete(callback);
          if (subscription.callbacks.size === 0) {
            const tokenToUnsub = subscription.token;
            removeSubscription(topicId);
            currentSource?.UnsubscribeTopic?.(tokenToUnsub);
          }
        }
      },
    };
  };

  /**
   * Called by client when source changes.
   * Registers handlers with the source for notifications, readiness, errors, and expiry.
   * @param {object} newSource - The source instance
   */
  const onSourceChanged = newSource => {
    currentSource = newSource;

    if (!currentSource) {
      return;
    }

    currentSource.SetTopicNotificationHandler?.((topicId, detail) => {
      log(`Topic notifications: Received notification for topic: ${topicId}`, true);
      dispatchToCallbacks(topicId, detail);
    });

    // Resubscription is deferred to this handler to avoid sending SubscribeTopic
    // before the connection is established (which would fail with "Cannot send data")
    currentSource.SetTopicReadyHandler?.(() => {
      log("Topic notifications: Source ready, re-subscribing all topics");
      resubscribeAll();
    });

    currentSource.SetTopicSubscriptionErrorHandler?.((token, errorCode, shouldRetry) => {
      handleSubscriptionError(token, errorCode, shouldRetry);
    });

    currentSource.SetTopicTokenExpiryHandler?.(
      (token, shouldExchange, isSubscribable, subscriptionActive) => {
        handleTokenExpiry(token, shouldExchange, isSubscribable, subscriptionActive);
      },
    );
  };

  return {
    subscribe,
    onSourceChanged,
  };
};

export default createTopicManager;
