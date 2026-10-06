import type {
  Logger,
  RealtimeSource,
  TopicSubscribeOptions,
  TopicSubscriptionError,
} from "./types";

type TopicCallback = (detail: unknown) => void;

type TopicSubscription = {
  token: string;
  callbacks: Set<TopicCallback>;
  onError: ((error: TopicSubscriptionError) => void) | null;
};

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
const createTopicManager = ({ log }: { log: Logger }) => {
  // ============================================================================
  // STATE
  // ============================================================================

  // Subscriptions: topicId → { token, callbacks: Set<fn>, onError }
  const subscriptions: Record<string, TopicSubscription | undefined> = {};

  // Reference to current source (set via onSourceChanged)
  let currentSource: RealtimeSource | null = null;

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Extract topicId from token
   * Token format: "{namespace}!{topic}.body.sig"
   * TopicId format: "{namespace}!{topic}"
   */
  const extractTopicId = (token: unknown) => {
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

  const findSubscriptionByToken = (token: string) => {
    const topicId = extractTopicId(token);
    const sub = topicId ? subscriptions[topicId] : undefined;
    if (!topicId || !sub) {
      return null;
    }
    // Reject stale tokens: after rotation, late events for the old token must not affect the current subscription
    if (sub.token !== token) {
      log(`Topic notifications: Ignoring event for stale token on ${topicId}`, true);
      return null;
    }
    return { topicId, sub };
  };

  /**
   * Dispatch notification to local callbacks for a topic
   */
  const dispatchToCallbacks = (topicId: string, detail: unknown) => {
    const sub = subscriptions[topicId];
    if (!sub?.callbacks.size) {
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
        log(`Topic notifications: Error in callback for ${topicId}: ${String(e)}`);
      }
    }
  };

  const dispatchError = (topicId: string, error: TopicSubscriptionError) => {
    const sub = subscriptions[topicId];
    if (!sub?.onError) {
      return;
    }
    try {
      sub.onError(error);
    } catch (e) {
      log(`Topic notifications: Error in onError callback for ${topicId}: ${String(e)}`);
    }
  };

  const removeSubscription = (topicId: string) => {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
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

  const handleSubscriptionError = (token: string, errorCode: string, shouldRetry: boolean) => {
    const match = findSubscriptionByToken(token);
    if (!match) {
      return;
    }
    const { topicId } = match;

    log(
      `Topic notifications: Subscription error for ${topicId}: ${errorCode} (shouldRetry=${String(shouldRetry)})`,
    );
    dispatchError(topicId, { type: "error", errorCode, shouldRetry });
    removeSubscription(topicId);
  };

  // _subscriptionActive: sent by server but not needed client-side (server uses it to distinguish warning vs expiry)
  const handleTokenExpiry = (
    token: string,
    shouldExchange: boolean,
    isSubscribable: boolean,
    _subscriptionActive: boolean,
  ) => {
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
    log(
      `Topic notifications: Token expired for ${topicId} (shouldExchange=${String(shouldExchange)})`,
    );
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
  const subscribe = (
    token: string,
    callback: TopicCallback,
    { onError }: TopicSubscribeOptions = {},
  ) => {
    const topicId = extractTopicId(token);
    if (!topicId) {
      log(`Topic notifications: Failed to extract topicId from token`);
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      return { unsubscribe: () => {} };
    }

    log(`Topic notifications: Subscribing to topicId: ${topicId}`);

    let sub = subscriptions[topicId];
    if (!sub) {
      sub = {
        token,
        callbacks: new Set(),
        onError: null,
      };
      subscriptions[topicId] = sub;
    }

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
  const onSourceChanged = (newSource: RealtimeSource | null) => {
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
