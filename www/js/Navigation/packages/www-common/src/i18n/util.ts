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

/**
 * Localization namespaces are two segments (`Feature.Messages`). A backend key appends the
 * message key after that (`Feature.Messages.Heading.Message`).
 *
 * `use-intl` nests on `.` and the stored messages use `:` inside each level, so the lookup path
 * keeps a single `.` between the namespace and the key: `Feature:Messages.Heading:Message`.
 */
const NAMESPACE_SEGMENT_COUNT = 2;

export type FullKeyPath = {
  /** `use-intl` path, e.g. `Feature:Messages.Heading:Message`. */
  path: string;
  /** Period-delimited namespace used for missing-key tracking, e.g. `Feature.Messages`. */
  namespace: string;
  /** Colon-delimited message key used for missing-key tracking, e.g. `Heading:Message`. */
  key: string;
};

/** Returns undefined when `fullKey` has no message key after its namespace. */
export const toFullKeyPath = (fullKey: string): FullKeyPath | undefined => {
  const segments = fullKey.split(".");
  if (
    segments.length <= NAMESPACE_SEGMENT_COUNT ||
    segments.some(segment => segment.length === 0)
  ) {
    return undefined;
  }

  const namespaceSegments = segments.slice(0, NAMESPACE_SEGMENT_COUNT);
  const key = segments.slice(NAMESPACE_SEGMENT_COUNT).join(":");
  const namespace = namespaceSegments.join(":");
  return {
    path: `${namespace}.${key}`,
    namespace: namespaceSegments.join("."),
    key,
  };
};
