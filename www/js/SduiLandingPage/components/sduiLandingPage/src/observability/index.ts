import { reportError } from "@rbx/core-scripts/sentry";
import { PageContext } from "@rbx/discovery-common/telemetry";
import type { RegistryInput } from "@rbx/observability-framework/schema";
import type { MakeObservabilityTypes } from "@rbx/observability-framework/types";
import { createTrackers, type PublishFn } from "@rbx/observability-framework/trackers";
import { createFireTelemetryCounter } from "@rbx/web-telemetry/v2/fire";

export const observabilityRegistry = {
  featureName: "Spotlight",
  team: "Growth > User Lifecycle > Discovery UX",
  description:
    "Web Vitals: pick a slug in the Page dropdown. A new Spotlight slug isn't listed until it's added to `internalPageName` in `components/sduiLandingPage/src/observability/index.ts`.",
  // The Web Vitals tab's Page dropdown and its alerts, matched exactly. Page Layout Manager names each
  // page SduiLandingPage_{slug} (LIVEOPS-610), so add a new Spotlight slug here when it launches.
  // The first entry is the default.
  internalPageName: [
    "SduiLandingPage_shooter",
    "SduiLandingPage_action",
    "SduiLandingPage_adventure",
    "SduiLandingPage_education",
    "SduiLandingPage_first-person-shooters",
    "SduiLandingPage_horror",
    "SduiLandingPage_musinsa-my-life-with-roblox",
    "SduiLandingPage_obby-platformer",
    "SduiLandingPage_party-casual",
    "SduiLandingPage_puzzle",
    "SduiLandingPage_roleplay-avatar-sim",
    "SduiLandingPage_roleplaying-games",
    "SduiLandingPage_simulation",
    "SduiLandingPage_social",
    "SduiLandingPage_sports",
    "SduiLandingPage_strategy",
    "SduiLandingPage_survival",
    "SduiLandingPage_the-hunt-roblox-20",
  ],

  features: {
    health: {
      counters: [{ name: "PageView", dimensions: ["host", "slug"] }],
      criticalErrors: [{ name: "DataLoadFailed", dimensions: ["host"] }],
    },
    content: {
      // source: "ssr" when seeded from the page HTML, "client" when fetched or already cached.
      counters: [{ name: "DataLoaded", dimensions: ["host", "source"] }],
    },
  },
} as const satisfies RegistryInput;

type Obs = MakeObservabilityTypes<typeof observabilityRegistry>;

export type CounterName = Obs["CounterName"];
export type ErrorName = Obs["ErrorName"];
export type CriticalErrorName = Obs["CriticalErrorName"];

export type DataSource = "ssr" | "client";

// Inlined by Next.js; undefined in the Rspack SCS build.
export const host = process.env.NEXT_PUBLIC_IS_NEXTJS === "true" ? "nextjs" : "dotnet";

const fireTelemetryCounter = createFireTelemetryCounter(observabilityRegistry.featureName);

// Every event carries `host` so .NET and Next.js traffic can be compared during the cutover.
export const publishMetric: PublishFn = (name, dimensions) => {
  fireTelemetryCounter(name, { ...dimensions, host });
};

export const { trackCounter, trackError, trackCriticalError } = createTrackers(
  observabilityRegistry,
  {
    publish: publishMetric,
    // On Next.js the island's ErrorPage already reports the error with its `error-source` tag, and
    // Sentry drops a second capture of the same error, so only .NET reports it from here.
    captureException: host === "nextjs" ? undefined : reportError,
    featureName: observabilityRegistry.featureName,
  },
);

// The landing page container also serves PreAuthLandingPage; only Spotlight is tracked here.
const isSpotlight = (appPage: PageContext): boolean => appPage === PageContext.SpotlightPage;

// The slug is the raw URL path segment on .NET (decoded on Next.js), so decode and lowercase it to
// count `/spotlight/%73ports` and `/spotlight/Sports` as `sports`, and cap its length.
const MAX_SLUG_LENGTH = 64;
const toSlugDimension = (pageSlug: string): string => {
  let slug = pageSlug;
  try {
    slug = decodeURIComponent(pageSlug);
  } catch {
    // Keep the raw slug when it isn't valid percent-encoding.
  }
  return slug.toLowerCase().slice(0, MAX_SLUG_LENGTH);
};

export const trackPageView = (appPage: PageContext, pageSlug: string): void => {
  if (isSpotlight(appPage)) {
    trackCounter("PageView", { host, slug: toSlugDimension(pageSlug) });
  }
};

export const trackDataLoaded = (appPage: PageContext, source: DataSource): void => {
  if (isSpotlight(appPage)) {
    trackCounter("DataLoaded", { host, source });
  }
};

export const trackDataLoadFailed = (appPage: PageContext, error: unknown): void => {
  if (isSpotlight(appPage)) {
    trackCriticalError("DataLoadFailed", { host }, error);
  }
};
