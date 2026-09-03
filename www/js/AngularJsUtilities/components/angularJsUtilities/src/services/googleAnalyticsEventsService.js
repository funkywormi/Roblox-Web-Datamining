import angularJsUtilitiesModule from "../angularJsUtilitiesModule";
import { isGoogleAnalyticsCookieConsentOptIn } from "@rbx/core-scripts/cookie";

function googleAnalyticsEventsService() {
  "ngInject";

  function getArgs(category, action, label, value) {
    var args = [];
    args.push(category);
    args.push(action);
    args.push(label);
    if (!isNaN(value)) {
      value = Math.floor(value);
      args.push(value);
    }
    return args;
  }
  return {
    eventCategories: {
      JSErrors: "JSErrors",
    },

    eventActions: {
      Chat: "Chat",
      ChatEmbedded: "ChatEmbedded",
    },

    getUserAgent: function () {
      if (navigator && navigator.userAgent) {
        return navigator.userAgent;
      }
      return "";
    },

    fireEvent: function (category, action, label, value) {
      if (!isGoogleAnalyticsCookieConsentOptIn()) return;
      var args = getArgs(category, action, label, value);
      GoogleAnalyticsEvents && GoogleAnalyticsEvents.FireEvent(args);
    },

    viewVirtual: function (relativeUrl) {
      if (!isGoogleAnalyticsCookieConsentOptIn()) return;
      GoogleAnalyticsEvents && GoogleAnalyticsEvents.ViewVirtual(relativeUrl);
    },
  };
}
angularJsUtilitiesModule.factory("googleAnalyticsEventsService", googleAnalyticsEventsService);

export default googleAnalyticsEventsService;
