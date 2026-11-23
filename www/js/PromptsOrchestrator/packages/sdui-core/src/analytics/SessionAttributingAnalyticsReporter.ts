import type { SduiAnalyticsReporter, SduiEventDescriptor, SduiPageContext } from "../types";
import { type SduiSessionData, type SduiSessionStore } from "./SduiSessionStore";

export function decorateAnalyticsPayloadWithSessionData(
  fields: Record<string, string | number>,
  sessionData: SduiSessionData,
): Record<string, string | number> {
  const { omniSearchSessionInfo, ...attributes } = { ...fields, ...sessionData };

  return omniSearchSessionInfo
    ? // we use omniSearchSessionInfo in code to be clear that it's not just for game search
      // but telemetry events still expect the old gameSearchSessionInfo name
      { ...attributes, gameSearchSessionInfo: omniSearchSessionInfo }
    : attributes;
}

/**
 * Decorate an analytics sink so every event carries the session values in
 * `sessionStore`, read at send time. Store values win over same-named event
 * fields; keys unset in the store leave event fields untouched.
 */
export function createSessionAttributingAnalyticsReporter(
  reporter: SduiAnalyticsReporter,
  sessionStore: SduiSessionStore,
): SduiAnalyticsReporter {
  return {
    reportOmniFeedStats(
      feedStats: Record<string, string | number>,
      pageContext?: SduiPageContext,
    ): void {
      reporter.reportOmniFeedStats(
        decorateAnalyticsPayloadWithSessionData(feedStats, sessionStore.getSessionData()),
        pageContext,
      );
    },

    logEvent(descriptor: SduiEventDescriptor, fields: Record<string, string | number>): void {
      reporter.logEvent(
        descriptor,
        decorateAnalyticsPayloadWithSessionData(fields, sessionStore.getSessionData()),
      );
    },
  };
}
