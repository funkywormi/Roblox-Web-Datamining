import type { AnalyticsContext } from "@rbx/sdui-core";

import type { AnalyticsFieldValue } from "./filterInvalidEventParams";

export function findAnalyticsFieldInAncestors(
  fieldKey: string,
  analyticsContext: AnalyticsContext | undefined,
  defaultValue: AnalyticsFieldValue,
): AnalyticsFieldValue {
  if (!analyticsContext) {
    return defaultValue;
  }

  const localValue = analyticsContext.analyticsData?.[fieldKey];
  if (localValue !== undefined && localValue !== null) {
    return localValue;
  }

  const ancestorValue = analyticsContext.ancestorAnalyticsData?.[fieldKey];
  if (ancestorValue !== undefined && ancestorValue !== null) {
    return ancestorValue;
  }

  return defaultValue;
}
