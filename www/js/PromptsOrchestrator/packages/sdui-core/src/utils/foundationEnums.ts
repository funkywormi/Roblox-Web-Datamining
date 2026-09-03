import {
  buttonSizes,
  buttonVariants,
  systemBannerSeverities,
  systemBannerVariants,
  feedbackBannerSeverities,
  type TButtonSize,
  type TButtonVariant,
  type TFeedbackBannerSeverity,
  type TSystemBannerSeverity,
  type TSystemBannerVariant,
} from "@rbx/foundation-ui";

/** Coerce a server string to a known member of a Foundation enum tuple (e.g.
 * `buttonVariants`); returns `fallback` for missing/unrecognized values. */
export function coerceToAllowedValue<T extends string>(
  value: string | undefined,
  allowedValues: readonly T[],
  fallback: T,
): T {
  return allowedValues.find(allowed => allowed === value) ?? fallback;
}

/** Coerce a server string to a Foundation `TButtonVariant`, using Foundation's
 * own `buttonVariants` as the allow-list; falls back for unknown values. */
export function toButtonVariant(
  value: string | undefined,
  fallback: TButtonVariant,
): TButtonVariant {
  return coerceToAllowedValue(value, buttonVariants, fallback);
}

/** Coerce a server string to a Foundation `TButtonSize`, using Foundation's own
 * `buttonSizes` as the allow-list; falls back for unknown values. */
export function toButtonSize(value: string | undefined, fallback: TButtonSize): TButtonSize {
  return coerceToAllowedValue(value, buttonSizes, fallback);
}

/**
 * Coerce a server string to a Foundation `TFeedbackBannerSeverity`, using
 * Foundation's own `feedbackBannerSeverities` as the allow-list.
 */
export function toFeedbackBannerSeverity(
  value: string | undefined,
  fallback: TFeedbackBannerSeverity,
): TFeedbackBannerSeverity {
  return coerceToAllowedValue(value, feedbackBannerSeverities, fallback);
}

/**
 * Coerce a server string to a Foundation `TSystemBannerSeverity`, using
 * Foundation's own `systemBannerSeverities` as the allow-list.
 */
export function toSystemBannerSeverity(
  value: string | undefined,
  fallback: TSystemBannerSeverity,
): TSystemBannerSeverity {
  return coerceToAllowedValue(value, systemBannerSeverities, fallback);
}

/**
 * Coerce a server string to a Foundation `TSystemBannerVariant`, using
 * Foundation's own `systemBannerVariants` as the allow-list.
 */
export function toSystemBannerVariant(
  value: string | undefined,
  fallback: TSystemBannerVariant,
): TSystemBannerVariant {
  return coerceToAllowedValue(value, systemBannerVariants, fallback);
}
