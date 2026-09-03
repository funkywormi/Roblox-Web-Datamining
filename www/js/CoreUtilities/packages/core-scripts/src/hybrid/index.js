const { Chat, Navigation, Overlay, Game, Localization, AdConsent } = window.Roblox?.Hybrid ?? {};

const getCallback = callback => {
  if (typeof callback === "undefined") {
    return () => {
      // do nothing
    };
  }
  return callback;
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
    if (AdConsent && AdConsent.adConsentChanged) {
      AdConsent.adConsentChanged(params, getCallback(callback));
    }
  },
};
