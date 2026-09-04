import type { SduiEventDescriptor, SduiPageContext } from "../types";

// ─── Event names ───
//
// Mirror the eventName fields on lua's `SduiPageAnalytics` event configs
// (`SduiPageAnalytics.lua`). Renaming requires a coordinated dashboard /
// EventIngest pipeline change — keep these stable.

export const SDUI_LOAD_MORE_EVENT_NAME = "Sdui_LoadMoreFromApi";
export const SDUI_PAGE_STATUS_EVENT_NAME = "Sdui_PageStatus";
export const SDUI_PAGE_PAYLOAD_SIZE_EVENT_NAME = "Sdui_PagePayloadSize";

/**
 * Builds an `SduiEventDescriptor` for a page-level telemetry event.
 * Matches the `csrErrorReporter` / `reportActionAnalytics` pattern:
 * `name === type` and `context` is the `appPage` so dashboards can
 * group by surface.
 */
export function buildSduiPageEventDescriptor(
  eventName: string,
  pageContext?: SduiPageContext,
): SduiEventDescriptor {
  return {
    name: eventName,
    type: eventName,
    context: pageContext?.appPage ?? "unknown",
  };
}
