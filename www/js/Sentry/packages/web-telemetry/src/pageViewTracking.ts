import { createFireTelemetryCounter } from "./v2/fireTelemetryCounter";

export const publishMetric = createFireTelemetryCounter("WWW_PageTelemetry");

/**
 * Internal page names that should not emit the global PageViewed counter.
 * Add names here when a page is not a distinct user-facing navigation.
 */
export const PAGE_VIEW_EXCLUDED_INTERNAL_PAGE_NAMES = new Set<string>(["ServerList"]);

const getInternalPageName = (): string | undefined => {
  const pageMeta = document.querySelector<HTMLMetaElement>('meta[name="page-meta"]');
  return pageMeta?.dataset.internalPageName;
};

export const trackPageView = (): void => {
  try {
    const maybeInternalPageName = getInternalPageName();
    if (
      maybeInternalPageName &&
      !PAGE_VIEW_EXCLUDED_INTERNAL_PAGE_NAMES.has(maybeInternalPageName)
    ) {
      publishMetric("PageViewed", {
        internalPageName: maybeInternalPageName,
      });
    }
  } catch {
    // best effort only
  }
};
