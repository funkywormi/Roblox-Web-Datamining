import {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  ReactNode,
} from "react";
import { EventTypes } from "../telemetry/analytics";
import useSendNotApprovedPageEvent from "../telemetry/useSendNotApprovedPageEvent";
import { usePageNavigation } from "./PageNavigationContext";

type AdditionalProperties = Record<string, string | number>;

export interface PageAnalyticsContextValue {
  /**
   * Sends an analytics event with automatic page context.
   * Includes pageName and timeOnPage automatically.
   */
  sendPageEvent: (eventType: EventTypes, additionalProperties?: AdditionalProperties) => void;
}

const PageAnalyticsContext = createContext<PageAnalyticsContextValue | undefined>(undefined);

interface PageAnalyticsProviderProps {
  children: ReactNode;
}

/**
 * Context provider for page analytics tracking.
 *
 * Handles:
 * - Time-on-page tracking
 * - Automatic page name injection for events
 * - Continue/Back events when user navigates between pages
 * - Logging of unmapped violation keys
 *
 * Must be used within a PageNavigationProvider.
 */
export const PageAnalyticsProvider = ({ children }: PageAnalyticsProviderProps) => {
  const { currentPage, currentPageName, unmappedViolationKeys } = usePageNavigation();
  const sendEvent = useSendNotApprovedPageEvent();

  const pageEnterTimeRef = useRef(Date.now());
  const previousPageRef = useRef(currentPage);
  const previousPageNameRef = useRef(currentPageName);
  const isInitialMountRef = useRef(true);

  const getTimeOnPageMs = () => {
    return Date.now() - pageEnterTimeRef.current;
  };

  // Log any unmapped violation keys
  useEffect(() => {
    unmappedViolationKeys.forEach(unmappedViolationKey => {
      sendEvent(EventTypes.UnmappedViolationKey, { unmappedViolationKey });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sendEvent identity should not re-trigger
  }, [unmappedViolationKeys]);

  // Track page changes and send navigation events
  useEffect(() => {
    // Skip the initial mount - we don't want to send an event for a page we never entered
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    const timeOnPageMs = getTimeOnPageMs();
    const eventType =
      currentPage > previousPageRef.current ? EventTypes.ContinueClicked : EventTypes.BackClicked;

    sendEvent(eventType, {
      pageName: previousPageNameRef.current,
      timeOnPageMs,
    });

    // Reset tracking for the new page
    pageEnterTimeRef.current = Date.now();
    previousPageRef.current = currentPage;
    previousPageNameRef.current = currentPageName;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sendEvent identity should not re-trigger navigation events
  }, [currentPage, currentPageName]);

  // Context-aware event sender that auto-includes page context
  const sendPageEvent = useCallback(
    (eventType: EventTypes, additionalProperties?: AdditionalProperties) => {
      const timeOnPageMs = getTimeOnPageMs();
      sendEvent(eventType, {
        ...additionalProperties,
        pageName: currentPageName,
        timeOnPageMs,
      });
    },
    [currentPageName, sendEvent],
  );

  const contextValue = useMemo<PageAnalyticsContextValue>(
    () => ({ sendPageEvent }),
    [sendPageEvent],
  );

  return (
    <PageAnalyticsContext.Provider value={contextValue}>{children}</PageAnalyticsContext.Provider>
  );
};

/**
 * Hook to access page analytics context.
 * Must be used within a PageAnalyticsProvider (which must be within a PageNavigationProvider).
 */
export const usePageAnalytics = (): PageAnalyticsContextValue => {
  const context = useContext(PageAnalyticsContext);
  if (!context) {
    throw new Error("usePageAnalytics must be used within PageAnalyticsProvider");
  }
  return context;
};
