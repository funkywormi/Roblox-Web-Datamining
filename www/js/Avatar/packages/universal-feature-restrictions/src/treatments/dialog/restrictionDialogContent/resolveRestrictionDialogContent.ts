import type { InterventionType } from "../../../types/api";
import { NANOSECONDS_PER_SECOND } from "../../../shared/utils/time";
import { getRegistryEntry } from "./restrictionDialogContentRegistry";

export interface TranslationDescriptor {
  key: string;
  params?: Record<string, string>;
}

export interface DurationUnit {
  unit: "Minute" | "Hour" | "Day";
  number: number;
}

/**
 * Converts nanosecond duration into a human-friendly unit+number pair using
 * cascading round-up logic: seconds → minutes → hours → days.
 */
export function resolveDurationUnit(durationNs: number): DurationUnit {
  const totalSeconds = durationNs / NANOSECONDS_PER_SECOND;

  const minutes = Math.ceil(totalSeconds / 60);
  if (minutes < 60) {
    return { unit: "Minute", number: minutes };
  }

  const hours = Math.ceil(minutes / 60);
  if (hours < 24) {
    return { unit: "Hour", number: hours };
  }

  const days = Math.ceil(hours / 24);
  return { unit: "Day", number: days };
}

/**
 * Full translation keys for the suspended title, keyed by duration unit. Spelling out
 * each key (rather than building it piecewise) keeps every key as a literal string so
 * translation extraction tooling and grep can find them.
 */
const SUSPENDED_TITLE_KEYS: Record<DurationUnit["unit"], { singular: string; plural: string }> = {
  Minute: {
    singular: "Generic.DialogTitle.Suspended.Minute",
    plural: "Generic.DialogTitle.Suspended.Minutes",
  },
  Hour: {
    singular: "Generic.DialogTitle.Suspended.Hour",
    plural: "Generic.DialogTitle.Suspended.Hours",
  },
  Day: {
    singular: "Generic.DialogTitle.Suspended.Day",
    plural: "Generic.DialogTitle.Suspended.Days",
  },
};

/**
 * Resolves the title translation descriptor based on intervention type and duration.
 * Consults the content registry's title keys first, otherwise falls back to the generic titles below.
 */
export function resolveTitleDescriptor({
  interventionType,
  durationNs,
  abuseVector,
}: {
  interventionType: InterventionType;
  durationNs: number;
  abuseVector: string;
}): TranslationDescriptor {
  const registryTitleKey = getRegistryEntry(abuseVector)?.titleKeys?.[interventionType];
  if (registryTitleKey) {
    return { key: registryTitleKey };
  }

  if (interventionType === "Nudge") {
    return { key: "Generic.DialogTitle.Nudge" };
  }

  if (interventionType === "Banned") {
    return { key: "Generic.DialogTitle.Banned" };
  }

  const { unit, number } = resolveDurationUnit(durationNs);
  const keys = SUSPENDED_TITLE_KEYS[unit];

  return number === 1
    ? { key: keys.singular }
    : { key: keys.plural, params: { number: String(number) } };
}

/**
 * Resolves the body translation descriptor based on intervention type and abuse vector.
 * Uses the content registry's body key when the entry defines one for this intervention type,
 * otherwise falls back to the generic key.
 */
export function resolveBodyDescriptor({
  interventionType,
  abuseVector,
}: {
  interventionType: InterventionType;
  abuseVector: string;
}): TranslationDescriptor {
  const bodyKey = getRegistryEntry(abuseVector)?.bodyKeys?.[interventionType];

  if (bodyKey) {
    return { key: bodyKey };
  }

  return { key: `Generic.DialogBody.${interventionType}` };
}

/**
 * Resolves the human-readable label for an abuse vector, in priority order:
 *   1. the content registry label key (translated), when the vector is registered;
 *   2. the consumer-supplied override label, when provided;
 *   3. a humanized form of the snake_case vector.
 *
 * Example: "experience_chat" → "Experience Chat"
 */
export function resolveAbuseVectorLabel(
  abuseVector: string,
  translate: (key: string) => string,
  overrideLabel?: string,
): string {
  const entry = getRegistryEntry(abuseVector);

  if (entry) {
    return translate(entry.labelKey);
  }

  if (overrideLabel) {
    return overrideLabel;
  }

  return abuseVector
    .split("_")
    .map(word => (word.length > 0 ? `${word.charAt(0).toUpperCase()}${word.slice(1)}` : word))
    .join(" ");
}
