/**
 * Roblox namespaces and translation keys are period-delimited (`Feature.Messages` /
 * `Heading.Message`), but `use-intl` reads a period as message nesting. Both platforms therefore
 * store messages colon-delimited and convert at the boundary, so call sites keep writing the
 * period-delimited names that appear in the localization service.
 */

export type FromPeriodToColonDelimited<T> = T extends `${infer A}.${infer B}`
  ? `${A}:${FromPeriodToColonDelimited<B>}`
  : T;

export type FromColonToPeriodDelimited<T> = T extends `${infer A}:${infer B}`
  ? `${A}.${FromColonToPeriodDelimited<B>}`
  : T;

export const fromPeriodToColonDelimited = <T extends string>(
  value: T,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
): FromPeriodToColonDelimited<T> => value.replaceAll(".", ":") as FromPeriodToColonDelimited<T>;

export const fromColonToPeriodDelimited = <T extends string>(
  value: T,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
): FromColonToPeriodDelimited<T> => value.replaceAll(":", ".") as FromColonToPeriodDelimited<T>;
