export type AnalyticsFieldValue = string | number | boolean;

export function filterInvalidEventParams(
  params: Record<string, unknown>,
): Record<string, AnalyticsFieldValue> {
  const validParams: Record<string, AnalyticsFieldValue> = {};

  for (const [key, value] of Object.entries(params)) {
    if (
      value !== undefined &&
      value !== null &&
      (typeof value === "string" || typeof value === "number" || typeof value === "boolean")
    ) {
      validParams[key] = value;
    }
  }

  return validParams;
}
