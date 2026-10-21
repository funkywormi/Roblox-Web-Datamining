import type { AnalyticsFieldMap, SduiComponentConfig } from "../types";

// TODO: Rename to a more generic name — this applies analytics overlay to any config, not just root.
export function applyRootAnalyticsOverlay(
  rootConfig: SduiComponentConfig | undefined,
  fields: AnalyticsFieldMap,
): void {
  rootConfig?.analyticsContext?.setLocalAnalyticsData?.(fields);
}
