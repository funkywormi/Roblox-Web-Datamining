import {
  init as initSentry,
  browserTracingIntegration,
  makeBrowserOfflineTransport,
  makeFetchTransport,
  setUser,
  setTag,
  startSpan,
  getActiveSpan,
  flush,
  captureException,
} from "@sentry/browser";
import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { sendToOtel } from "@rbx/www-common/sentry/sentryToOtel";
import { browserFromUserAgent, type DeviceInfo } from "@rbx/www-common/device";
import { getOtelCollectorTracesEndpoint } from "@rbx/www-common/sentry/otelEndpoint";
import environmentUrls from "@rbx/environment-urls";
import { reportWebVitals } from "@rbx/www-common/webVitals";
import { buildSampleRate } from "./src/utils/buildSampleRate";
import {
  normalizeLocalePath,
  shouldSendTraceToSentry,
  buildTracesSampler,
} from "./src/utils/tracesSampler";
import { filterSentryTransaction } from "./src/utils/filterSentryTransaction";

declare global {
  interface Window {
    Sentry?: {
      startSpan: typeof startSpan;
      getActiveSpan: typeof getActiveSpan;
      flush: typeof flush;
      captureException: typeof captureException;
    };
  }
}

// Expose Sentry as a global for non-module consumers.
if (typeof window !== "undefined") {
  window.Sentry = {
    startSpan,
    getActiveSpan,
    flush,
    captureException,
  };
}

const metaTag = document.querySelector<HTMLMetaElement>('meta[name="sentry-meta"]');
const environmentMetaTag = document.querySelector<HTMLMetaElement>('meta[name="environment-meta"]');
const { dsn, envName, sampleRate, tracesSampleRate } = metaTag?.dataset ?? {};
const otelEndpoint = getOtelCollectorTracesEndpoint(
  window.location.hostname,
  environmentMetaTag?.dataset,
);

const parsedSampleRate = sampleRate == null ? 0.001 : parseFloat(sampleRate);
const parsedTracesSampleRate = tracesSampleRate == null ? 0 : parseFloat(tracesSampleRate);
const isTransactionOff = parsedTracesSampleRate === 0;
// 0.8% is the targeted trace sample rate for WWW telemetry
// Ramping up can be done by changing SentryTracesSampleRate on the admin site
const perfBase = Math.min(parsedTracesSampleRate, 0.008);
const SENTRY_BASE = 0.0005;

// Derived once and reused by beforeSendTransaction and the DOMContentLoaded handler.
const user = authenticatedUser as typeof authenticatedUser | undefined;
const getPageMetaTag = () => document.querySelector<HTMLMetaElement>('meta[name="page-meta"]');

const deviceMeta = getDeviceMeta();
const deviceInfo: DeviceInfo = {
  deviceType: deviceMeta?.deviceType,
  browser: browserFromUserAgent(navigator.userAgent),
};

initSentry({
  dsn:
    dsn ?? "https://24df60727c94bd0aa14ab1269d104a21@o293668.ingest.us.sentry.io/4509158985826304",
  integrations: [
    browserTracingIntegration({
      detectRedirects: true,
    }),
  ],
  environment: envName ?? "staging",
  /// Keep a base perf rate visible (docs/telemetry). If tracesSampler is present,
  tracesSampleRate: perfBase,
  // Spans are created at source; Sentry ingest is filtered in beforeSendTransaction.
  tracesSampler: isTransactionOff ? undefined : buildTracesSampler(perfBase),
  sampleRate: buildSampleRate(parsedSampleRate),
  replaysOnErrorSampleRate: parsedSampleRate,
  beforeSendTransaction: event => {
    // Full transaction to OTEL; filtered copy to Sentry for quota reduction.
    sendToOtel(otelEndpoint, event, deviceInfo);
    // The trace was oversampled to the OTEL rate; deterministically downsample
    // to the Sentry target rate. Mirror the tracesSampler input (transaction
    // name first) so the decision uses the same rule that sampled this trace.
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    const path = normalizeLocalePath(event.transaction ?? pathname);
    const traceId = event.contexts?.trace?.trace_id ?? "";
    const parentSampled =
      event.sdkProcessingMetadata?.capturedSpanScope?.getPropagationContext().sampled;
    if (!shouldSendTraceToSentry(traceId, path, perfBase, SENTRY_BASE, parentSampled)) return null;
    return filterSentryTransaction(event);
  },
  // Enable offline transport for Sentry to work when the user is offline or when page changes before sentry can send the events
  transport: makeBrowserOfflineTransport(makeFetchTransport),
});

// Send Core Web Vitals to the event stream (Superset) at 100% on page hide.
// Hosted here to reuse the sentry SCS that loads on every legacy (.NET) page; it
// does NOT use the Sentry API (a send-hook would be trace-sampled, never 100%).
// Next.js has its own implementation (packages/www-nextjs ReportWebVitals).
reportWebVitals(
  environmentUrls.apiGatewayUrl,
  () => user?.id,
  () => getPageMetaTag()?.dataset.internalPageName,
);

document.addEventListener("DOMContentLoaded", () => {
  setUser({
    id: user?.id?.toString() ?? "-1",
    username: user?.name ?? "unknown",
  });

  // Set initial internal-page-name tag from meta tag
  const pageMetaTag = getPageMetaTag();
  if (pageMetaTag?.dataset.internalPageName) {
    setTag("internal-page-name", pageMetaTag.dataset.internalPageName);
  }

  // Watch for changes to the page-meta tag and update the Sentry tag
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "data-internal-page-name" &&
        mutation.target instanceof HTMLMetaElement
      ) {
        const newValue = mutation.target.dataset.internalPageName;
        if (newValue) {
          setTag("internal-page-name", newValue);
        }
      }
    });
  });

  if (pageMetaTag) {
    observer.observe(pageMetaTag, {
      attributes: true,
      attributeFilter: ["data-internal-page-name"],
    });
  }
});
