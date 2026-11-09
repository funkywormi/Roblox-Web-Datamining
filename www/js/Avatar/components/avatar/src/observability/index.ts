import type { RegistryInput } from "@rbx/observability-framework/schema";
import type { MakeObservabilityTypes } from "@rbx/observability-framework/types";
import { createTrackers, type PublishFn } from "@rbx/observability-framework/trackers";
import { createFireTelemetryCounter } from "@rbx/web-telemetry/v2/fire";
import { createFireTelemetryHistogram } from "@rbx/web-telemetry/v2/histogram";
import { getStatusCode } from "../utils/getStatusCode";

export const observabilityRegistry = {
  featureName: "Avatar",
  team: "Economy > Marketplace",
  // Matches .NET PageNameProvider.Avatar and the Next.js route's pageName.
  internalPageName: "Avatar",

  features: {
    health: {
      counters: [{ name: "PageView", dimensions: ["host"] }],
      // step: which page-load request failed; pageHidden: whether the user had already left.
      criticalErrors: [
        { name: "EditorLoadFailed", dimensions: ["host", "statusCode", "step", "pageHidden"] },
      ],
    },
    editor: {
      counters: [
        { name: "OpenTab", dimensions: ["tab"] },
        "GetMoreClicked",
        { name: "EditAttempted", dimensions: ["action"] },
        { name: "EditSucceeded", dimensions: ["action"] },
        { name: "ItemsLoadRequested", dimensions: ["request"] },
        { name: "ItemsLoaded", dimensions: ["request"] },
      ],
      errors: [
        // statusCode is "refused" when a 2xx response still lists assets the server would not wear.
        { name: "EditFailed", dimensions: ["action", "statusCode"] },
        { name: "ItemsLoadFailed", dimensions: ["request", "statusCode"] },
        { name: "ThumbnailLoadFailed", dimensions: ["type"] },
      ],
      flows: [
        {
          id: "avatar_edit",
          title: "Avatar edits (succeeded & failed vs attempted)",
          steps: [
            { counter: "EditAttempted", role: "start", title: "Attempted", dimensions: ["action"] },
            {
              counter: "EditSucceeded",
              role: "success",
              title: "Succeeded",
              dimensions: ["action"],
            },
            { counter: "EditFailed", role: "error", title: "Failed", dimensions: ["action"] },
          ],
        },
        {
          id: "avatar_items_load",
          title: "Item list loads (loaded & failed vs requested)",
          steps: [
            {
              counter: "ItemsLoadRequested",
              role: "start",
              title: "Requested",
              dimensions: ["request"],
            },
            { counter: "ItemsLoaded", role: "success", title: "Loaded", dimensions: ["request"] },
            { counter: "ItemsLoadFailed", role: "error", title: "Failed", dimensions: ["request"] },
          ],
        },
      ],
    },
    batchBuy: {
      counters: ["BatchBuyOpened"],
      errors: ["BatchBuyFailed"],
    },
  },
} as const satisfies RegistryInput;

type Obs = MakeObservabilityTypes<typeof observabilityRegistry>;

export type CounterName = Obs["CounterName"];
export type ErrorName = Obs["ErrorName"];
export type CriticalErrorName = Obs["CriticalErrorName"];

export type EditAction =
  | "wear"
  | "wearOutfit"
  | "wearPackage"
  | "background"
  | "emoteEquip"
  | "emoteUnequip"
  | "scale"
  | "bodyColor"
  | "avatarType"
  | "outfitCreate"
  | "outfitUpdate"
  | "outfitRename"
  | "outfitDelete"
  | "redraw";

export type ItemsRequest = "firstPage" | "nextPage";

// "setup" covers anything thrown after the requests resolve.
export type EditorLoadStep = "rules" | "avatar" | "catalogMetadata" | "setup";

// Same inlining as the HTTP transport switch; the Rspack SCS build leaves it undefined.
export const host = process.env.NEXT_PUBLIC_IS_NEXTJS === "true" ? "nextjs" : "dotnet";

const fireTelemetryCounter = createFireTelemetryCounter(observabilityRegistry.featureName);

// Every event carries `host` so .NET and Next.js traffic can be compared during the cutover.
export const publishMetric: PublishFn = (name, dimensions) => {
  fireTelemetryCounter(name, { ...dimensions, host });
};

export const { trackCounter, trackError, trackCriticalError } = createTrackers(
  observabilityRegistry,
  { publish: publishMetric, featureName: observabilityRegistry.featureName },
);

export const trackEditAttempted = (action: EditAction): void => {
  trackCounter("EditAttempted", { action });
};

export const trackEditSucceeded = (action: EditAction): void => {
  trackCounter("EditSucceeded", { action });
};

export const trackEditFailed = (
  action: EditAction,
  error: unknown,
  statusCode = getStatusCode(error),
): void => {
  trackError("EditFailed", { action, statusCode }, error);
};

export const trackItemsLoadRequested = (request: ItemsRequest): void => {
  trackCounter("ItemsLoadRequested", { request });
};

export const trackItemsLoaded = (request: ItemsRequest): void => {
  trackCounter("ItemsLoaded", { request });
};

export const trackItemsLoadFailed = (request: ItemsRequest, error: unknown): void => {
  trackError("ItemsLoadFailed", { request, statusCode: getStatusCode(error) }, error);
};

const fireTelemetryHistogram = createFireTelemetryHistogram(observabilityRegistry.featureName, {});

// False after a client-side navigation.
const isInitialPageLoad = (): boolean => {
  const [navigation] = performance.getEntriesByType("navigation");
  return navigation !== undefined && new URL(navigation.name).pathname === window.location.pathname;
};

let editorLoadReported = false;

/** Navigation start to editor data loaded, on the first editor load of an initial page load. */
export const trackEditorLoaded = (prefetched: boolean): void => {
  // A later remount (client-side nav back to the editor) would measure from the original load.
  if (editorLoadReported || !isInitialPageLoad()) {
    return;
  }
  editorLoadReported = true;
  fireTelemetryHistogram(
    "EditorLoadedMs",
    { host, prefetched: String(prefetched) },
    performance.now(),
  );
};

export const trackEditorLoadFailed = (step: EditorLoadStep, error: unknown): void => {
  trackCriticalError(
    "EditorLoadFailed",
    {
      host,
      statusCode: getStatusCode(error),
      step,
      pageHidden: String(document.visibilityState === "hidden"),
    },
    error,
  );
};
