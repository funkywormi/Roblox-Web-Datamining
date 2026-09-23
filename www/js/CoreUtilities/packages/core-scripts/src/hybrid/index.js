import { getDeviceMeta } from "@rbx/core-scripts/meta/device";

const { Chat, Navigation, Overlay, Game, Localization } = window.Roblox?.Hybrid ?? {};

const AD_CONSENT_RETRY_INTERVAL_MS = 100;
const AD_CONSENT_RETRY_TIMEOUT_MS = 5000;
const AD_CONSENT_UNAVAILABLE_COUNTER = "HybridAdConsentUnavailable";

const getCallback = callback => {
  if (typeof callback === "undefined") {
    return () => {
      // do nothing
    };
  }
  return callback;
};

const pendingAdConsentChanges = [];
let adConsentRetryTimer;
let adConsentDispatchInProgress = false;

const publishAdConsentChange = ({ params, callback }) => {
  // Native WebView injects the generated AdConsent module after CoreUtilities evaluates.
  // Resolve at call time so a load-time capture does not stay undefined forever.
  const adConsentChanged = window.Roblox?.Hybrid?.AdConsent?.adConsentChanged;
  if (adConsentChanged) {
    try {
      adConsentDispatchInProgress = true;
      adConsentChanged(params, (...args) => {
        try {
          callback(...args);
        } catch (error) {
          // A consumer callback failure happened after native accepted the change. Contain it so
          // the dispatch is not mistaken for a bridge failure and retried.
          try {
            console.error("Roblox Hybrid ad consent callback failed.", error);
          } catch {
            // Callback reporting must not affect delivery state.
          }
        }
      });
      return true;
    } catch {
      // Keep the change queued. Native registration can still finish before the retry timeout.
    } finally {
      adConsentDispatchInProgress = false;
    }
  }

  return false;
};

const reportAdConsentUnavailable = () => {
  try {
    window.EventTracker?.fireEvent(AD_CONSENT_UNAVAILABLE_COUNTER);
  } catch {
    // Telemetry failure must not suppress the local diagnostic.
  }
  try {
    console.warn("Roblox Hybrid was unavailable; ad consent change was not published.");
  } catch {
    // Console implementations are not guaranteed in every embedded browser.
  }
};

const stopAdConsentRetryTimer = () => {
  if (adConsentRetryTimer !== undefined) {
    clearTimeout(adConsentRetryTimer);
    adConsentRetryTimer = undefined;
  }
};

const flushPendingAdConsentChanges = () => {
  const now = performance.now();
  let oldest = pendingAdConsentChanges[0];
  while (oldest !== undefined && oldest.expiresAt <= now) {
    pendingAdConsentChanges.splice(0, 1);
    reportAdConsentUnavailable();
    oldest = pendingAdConsentChanges[0];
  }

  while (oldest !== undefined) {
    // Remove the entry before calling native because its callback may synchronously queue another
    // change. Leaving it at the head would let that reentrant flush publish the same entry again.
    pendingAdConsentChanges.splice(0, 1);
    if (!publishAdConsentChange(oldest)) {
      pendingAdConsentChanges.unshift(oldest);
      return false;
    }
    oldest = pendingAdConsentChanges[0];
  }
  return true;
};

const retryPendingAdConsentChanges = () => {
  adConsentRetryTimer = undefined;

  try {
    flushPendingAdConsentChanges();
  } finally {
    if (pendingAdConsentChanges.length > 0) {
      adConsentRetryTimer = setTimeout(retryPendingAdConsentChanges, AD_CONSENT_RETRY_INTERVAL_MS);
    }
  }
};

const queueAdConsentChange = (params, callback) => {
  pendingAdConsentChanges.push({
    params,
    callback,
    expiresAt: performance.now() + AD_CONSENT_RETRY_TIMEOUT_MS,
  });

  adConsentRetryTimer ??= setTimeout(retryPendingAdConsentChanges, AD_CONSENT_RETRY_INTERVAL_MS);
};

export default {
  startChatConversation: (params, callback) => {
    // Android
    if (Chat) {
      Chat.startChatConversation(params, getCallback(callback));
    }
  },

  startWebChatConversation: (params, callback) => {
    // iOS
    if (Navigation) {
      Navigation.startWebChatConversation(params, getCallback(callback));
    }
  },

  navigateToFeature: (params, callback) => {
    if (Navigation) {
      Navigation.navigateToFeature(params, getCallback(callback));
    }
  },

  openUserProfile: (params, callback) => {
    if (Navigation) {
      Navigation.openUserProfile(params, getCallback(callback));
    }
  },

  close: callback => {
    if (Overlay) {
      Overlay.close(getCallback(callback));
    }
  },

  launchGame: (params, callback) => {
    if (Game) {
      Game.launchGame(params, getCallback(callback));
    }
  },

  localization: (localeCode, callback) => {
    if (Localization && Localization.languageChangeTrigger) {
      Localization.languageChangeTrigger(localeCode, getCallback(callback));
    }
  },

  adConsentChanged: (params, callback) => {
    // The account settings component also runs in desktop browsers. Keep the entire bridge path,
    // including a bridge-like global left by tests or extensions, inert outside the native app.
    if (!getDeviceMeta()?.isInApp) {
      return;
    }

    const resolvedCallback = getCallback(callback);
    if (pendingAdConsentChanges.length > 0 || adConsentDispatchInProgress) {
      queueAdConsentChange(params, resolvedCallback);
      if (!adConsentDispatchInProgress && flushPendingAdConsentChanges()) {
        stopAdConsentRetryTimer();
      }
      return;
    }

    if (publishAdConsentChange({ params, callback: resolvedCallback })) {
      if (flushPendingAdConsentChanges()) {
        stopAdConsentRetryTimer();
      }
      return;
    }

    queueAdConsentChange(params, resolvedCallback);
  },
};
