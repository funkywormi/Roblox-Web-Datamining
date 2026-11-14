import {
  createFireTelemetryHistogram,
  flushTelemetryHistograms,
} from "@rbx/web-telemetry/v2/histogram";
import type { AppShellHost } from "./appShell/observability/host";
import { getDeviceClient } from "./device/getDeviceClient";
import type { WebVitalMeasurements } from "./webVitals";

const publishHistogram = createFireTelemetryHistogram("WWW_PageTelemetry", {});

/** Share of page loads that publish PagePerf histograms when a page has no override. */
export const DEFAULT_PAGE_PERFORMANCE_SAMPLE_RATE = 0.05;

/**
 * Per-page overrides, from 0 (off) to 1 (every load), keyed by the page segment of the metric
 * name (the internal page name with characters outside [A-Za-z0-9_] replaced by `_`), so keys
 * match the published `PagePerf_<Vital>_<Page>` names.
 *
 * Sized from each page's quietest 30m of LCP samples at the default rate: busy pages keep about
 * 500 samples in that window, and quiet pages are raised so it clears the web-vitals alerts'
 * sample gates (30 for p50, 100 for p90) where traffic allows.
 */
/* eslint-disable @typescript-eslint/naming-convention -- keys are metric-name page segments, which keep underscores. */
export const PAGE_PERFORMANCE_SAMPLE_RATES: Readonly<Record<string, number>> = {
  // Lowered: far above the alert gates at the default rate.
  ServerList: 0.001,
  Home: 0.003,
  Profile: 0.003,
  GameDetail: 0.004,
  Friends: 0.004,
  Settings: 0.006,
  Login: 0.015,
  GroupDetails: 0.015,
  LeanerRobuxRedesignModel: 0.02,
  robuxRedesign: 0.025,
  ConfigurePrivateServer: 0.025,
  Avatar: 0.025,

  // Raised: below the p90 gate in their quietest window at the default rate.
  Support: 0.1,
  GroupSearch: 0.1,
  VerifyEmail: 0.1,
  NotApproved: 0.1,
  PostPurchase: 0.1,
  CrossDeviceLoginConfirmCode: 0.15,
  PreAuthLanding_NonAPAC: 0.15,
  RefundAgreementPage: 0.15,
  MobileAppCreateAccount: 0.15,
  PaymentMethods: 0.15,
  ShopGiftCards: 0.2,
  VirtualEventDetails: 0.2,
  BundleDetail: 0.25,
  SecurityFeedback: 0.25,
  Redeem: 0.25,
  giftCardsLanding: 0.5,
  PreAuthLanding_Three_Sorts: 0.5,
  Create_Community: 0.5,
  SafetySupportPage: 0.5,
  CreditCardVerificationPage: 0.5,

  // Every load: too little traffic to reach the gates at any lower rate.
  ModerationPortalPage: 1,
  Abuse_Report_Platform: 1,
  AccountSwitcherIframe: 1,
  AvatarUpsell: 1,
  BraintreePayment: 1,
  GiftingProducts: 1,
  LoginRedirect: 1,
  LookDetail: 1,
  NativeAdsList: 1,
  NuveiPayment: 1,
  PreAuthLanding: 1,
  PreAuthLanding_APAC: 1,
  ResetPassword: 1,
  SecurityNotification: 1,
  Sitemap: 1,
  SongDetails: 1,
  SupportCenter: 1,
  SupportedBrowsers: 1,
  XsollaPayment: 1,
  SduiLandingPage_action: 1,
  SduiLandingPage_adventure: 1,
  SduiLandingPage_education: 1,
  SduiLandingPage_first_person_shooters: 1,
  SduiLandingPage_horror: 1,
  SduiLandingPage_party_casual: 1,
  SduiLandingPage_puzzle: 1,
  SduiLandingPage_roleplaying_games: 1,
  SduiLandingPage_shooter: 1,
  SduiLandingPage_simulation: 1,
  SduiLandingPage_social: 1,
  SduiLandingPage_sports: 1,
  SduiLandingPage_strategy: 1,
  SduiLandingPage_survival: 1,
  SduiLandingPage_the_hunt_roblox_20: 1,
};
/* eslint-enable @typescript-eslint/naming-convention */

export const UNKNOWN_PAGE_NAME = "Unknown";

// Metric names only allow [A-Za-z0-9_]; anything else would drop the observation.
const INVALID_METRIC_NAME_CHARS = /[^A-Za-z0-9_]/g;

// Measurement key -> histogram name segment. Times are in ms; CLS is unitless.
const PERF_METRICS = {
  ttfb: "TTFB",
  fcp: "FCP",
  lcp: "LCP",
  inp: "INP",
  cls: "CLS",
} as const;

/** Sample rate for a page, looked up by its metric-name page segment (see `toPageSegment`). */
export function getPagePerformanceSampleRate(pageSegment: string): number {
  return PAGE_PERFORMANCE_SAMPLE_RATES[pageSegment] ?? DEFAULT_PAGE_PERFORMANCE_SAMPLE_RATE;
}

/** The page segment of `PagePerf_<Vital>_<Page>`; metric names only allow [A-Za-z0-9_]. */
export function toPageSegment(internalPageName: string): string {
  return internalPageName.replace(INVALID_METRIC_NAME_CHARS, "_");
}

/**
 * Publishes one page load's web vitals as `WWW_PageTelemetry_PagePerf_<Vital>_<Page>`
 * histograms, for a sampled share of loads. The page is part of the metric name
 * rather than a label because the telemetry backend keeps only the top 10 values
 * of each label and folds the rest into `__ALL_OTHERS__`. `appType`, `browser` and
 * `host` stay as labels because each has fewer than 10 values. `host` is the side
 * that rendered the page (`nextjs` or `dotnet`), so a migration's arms can be
 * compared on the same page.
 * Sends immediately because this runs from the page-hide flush.
 */
export function publishPagePerformance(
  measurements: WebVitalMeasurements,
  pageName: string | undefined,
  host: AppShellHost,
): void {
  if (!measurements) {
    return;
  }
  // An empty data-internal-page-name attribute reads as "", not undefined.
  const internalPageName = pageName === undefined || pageName === "" ? UNKNOWN_PAGE_NAME : pageName;
  const pageSegment = toPageSegment(internalPageName);
  if (Math.random() >= getPagePerformanceSampleRate(pageSegment)) {
    return;
  }

  const { appType, browser } = getDeviceClient();
  const attributes = { appType, browser, host };
  let published = false;
  for (const [key, suffix] of Object.entries(PERF_METRICS)) {
    const value = measurements[key]?.value;
    if (typeof value === "number") {
      publishHistogram(`PagePerf_${suffix}_${pageSegment}`, attributes, value);
      published = true;
    }
  }
  if (published) {
    flushTelemetryHistograms();
  }
}
