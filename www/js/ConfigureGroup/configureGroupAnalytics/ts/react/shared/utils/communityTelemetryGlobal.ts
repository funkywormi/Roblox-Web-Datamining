import type {
  CommunityMetricBuilders,
  CommunityTelemetryApi,
  StructuredEvent
} from './communityTelemetryTypes';

let warned = false;
const warnMissingOnce = (): void => {
  if (warned) return;
  warned = true;
  // eslint-disable-next-line no-console -- surface a missing componentDependency without breaking the page
  console.warn(
    'Roblox.CommunityTelemetry is unavailable; community telemetry is disabled for this page. ' +
      'Ensure the "CommunityTelemetry" static content component is in this bundle\'s componentDependencies.'
  );
};

// Graceful fallback so a missing / late-loading SCC never throws into product code. Telemetry is
// fire-and-forget: loggers no-op, id minters return '', getCommonParams reports isValid:false.
let noopApi: CommunityTelemetryApi | null = null;
const getNoopTelemetry = (): CommunityTelemetryApi => {
  if (noopApi) return noopApi;
  // eslint-disable-next-line @typescript-eslint/no-empty-function -- intentional no-op telemetry sink
  const noop = (): void => {};
  const emptyId = (): string => '';
  const emptyEvent = (): StructuredEvent => ({} as StructuredEvent);
  noopApi = {
    getImpressionId: emptyId,
    updateImpressionId: emptyId,
    getMetricEvent: emptyEvent,
    CommunityMetric: new Proxy({} as CommunityMetricBuilders, { get: () => emptyEvent }),
    CommunityEventStream: { sendEvent: noop },
    getCommonParams: () => ({ pageRoute: '', locationTab: '', groupId: 0, isValid: false }),
    getPageRoute: emptyId,
    getSanitizedReferrer: emptyId,
    getCommunitySessionEnterFrom: emptyId,
    mintEntrypointImpressionId: emptyId,
    mintSearchId: emptyId,
    useEntrypointImpressionId: emptyId,
    logGroupPageExposureEvent: noop,
    logGroupPageClickEvent: noop,
    logCmntyEntrypointExposureEvent: noop,
    logCmntyEntrypointClickEvent: noop,
    logCmntySearchConductedEvent: noop,
    logCmntySearchResultsReturnedEvent: noop,
    logGroupForumsClickEvent: noop,
    logCmntyForumsSearchConductedEvent: noop,
    logCmntyForumsSearchResultsReturnedEvent: noop,
    logCmntyForumsSearchResultClickedEvent: noop,
    logCmntyForumsConcealedContentShownEvent: noop,
    logCmntyForumsConcealedContentRevealedEvent: noop,
    logCmntyForumsDeleteDialogShownEvent: noop,
    logCmntyForumsDeleteConfirmEvent: noop
  };
  return noopApi;
};

/**
 * Reads the `Roblox.CommunityTelemetry` global (published by the SCC listed in componentDependencies).
 * Read lazily per call because the SCC can finish loading after this module is imported — an eager
 * read at import time would capture `undefined`. If the global is missing, returns a no-op API (with
 * a one-time warning) rather than throwing, so telemetry can never break a page.
 */
const getCommunityTelemetry = (): CommunityTelemetryApi => {
  const api = ((window as unknown) as {
    Roblox?: { CommunityTelemetry?: CommunityTelemetryApi };
  }).Roblox?.CommunityTelemetry;

  if (!api) {
    warnMissingOnce();
    return getNoopTelemetry();
  }

  return api;
};

export default getCommunityTelemetry;
