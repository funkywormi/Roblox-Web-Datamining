import { createContext, useContext, ReactNode } from "react";
import { EventName, StatefulSendEvent } from "./analyticsService";

export type AbuseReportAnalytics = {
  sendEvent: StatefulSendEvent;
  EventName: typeof EventName;
};

const AbuseReportAnalyticsContext = createContext<AbuseReportAnalytics | undefined>(undefined);

export interface AbuseReportAnalyticsProviderProps {
  children: ReactNode;
  analytics: AbuseReportAnalytics;
}

/**
 * Provider for the AbuseReportAnalyticsContext.
 * Makes analytics methods available to child components via the useAbuseReportAnalytics hook.
 */
export const AbuseReportAnalyticsProvider = ({
  children,
  analytics,
}: AbuseReportAnalyticsProviderProps): React.ReactElement => (
  <AbuseReportAnalyticsContext.Provider value={analytics}>
    {children}
  </AbuseReportAnalyticsContext.Provider>
);

/**
 * Hook to access abuse report analytics methods.
 * Must be used within an AbuseReportAnalyticsProvider.
 */
export const useAbuseReportAnalytics = (): AbuseReportAnalytics => {
  const context = useContext(AbuseReportAnalyticsContext);

  if (!context) {
    throw new Error(
      "Invalid use of `useAbuseReportAnalytics` hook. Ensure your component has an ancestor wrapped in `AbuseReportAnalyticsProvider`",
    );
  }

  return context;
};
