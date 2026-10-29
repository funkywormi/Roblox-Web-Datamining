import { sendEvent } from "@rbx/core-scripts/event-stream";
import { window } from "@rbx/core-lib/browser";
import eventStreamConstants, {
  type TSafetyResourceBanner,
} from "../constants/eventStreamConstants";

export enum SafetyResourceBannerAction {
  Impression = "impression",
  LinkTapped = "link_tapped",
}

// Matches RobloxAppEnums.SearchTypes values used by the app clients.
export enum SafetyResourceBannerSurface {
  Games = "Games",
}

export type TSafetyResourceBannerEventParams = Omit<TSafetyResourceBanner, "action"> & {
  action: SafetyResourceBannerAction;
};

const isValidSafetyResourceBannerParams = (params: TSafetyResourceBannerEventParams): boolean => {
  const { action, moderationCategory, url, surface, textFilterRequestId } = params;
  return (
    (action === SafetyResourceBannerAction.Impression ||
      action === SafetyResourceBannerAction.LinkTapped) &&
    typeof moderationCategory === "string" &&
    typeof url === "string" &&
    typeof surface === "string" &&
    typeof textFilterRequestId === "string"
  );
};

export const sendSafetyResourceBannerEvent = (params: TSafetyResourceBannerEventParams): void => {
  if (!isValidSafetyResourceBannerParams(params)) {
    console.error("SafetyResourceBannerEventInvalidInterface");
    return;
  }
  sendEvent(...eventStreamConstants.safetyResourceBanner(params));
};

const impressedKeys = new Set<string>();

/**
 * Impressions are reported externally, so they are deduped per search instead of per mount:
 * the banner can remount (re-renders) within one search. The text filter request ID is unique
 * per search, and each web search is a page load, which resets this set.
 */
export const sendSafetyResourceBannerImpressionOnce = (
  params: Omit<TSafetyResourceBannerEventParams, "action">,
): void => {
  const key = `${params.textFilterRequestId}:${params.surface}`;
  if (impressedKeys.has(key)) {
    return;
  }
  impressedKeys.add(key);
  sendSafetyResourceBannerEvent({ ...params, action: SafetyResourceBannerAction.Impression });
};

/** Test helper: the dedupe set is module state. */
export const resetSafetyResourceBannerImpressions = (): void => {
  impressedKeys.clear();
};

export const extractFirstLinkUrl = (html: string): string | undefined => {
  if (!window) {
    return undefined;
  }
  const doc = new window.DOMParser().parseFromString(html, "text/html");
  return doc.querySelector("a[href]")?.getAttribute("href") ?? undefined;
};
