import type { EntityData } from "../../../types";
import { EntityStore } from "../EntityStore";
import { hydrationTimestampToLocalDateString } from "../derivedFieldHelpers";

/** Content-type key under which badges are registered on the data binder. */
export const BADGE_CONTENT_TYPE = "badge";

/** Implicit `inputData` keys for `badge` specs without an explicit `inputPath`. */
export const BADGE_DEFAULT_PATHS: readonly string[] = ["badge_id", "badgeId"];

/**
 * Camel-cased view of `badge_data.proto` as held in the cache. All
 * fields optional (partial hydration). Hand-rolled, not imported from
 * `@rbx/service-contracts-proto`, because the proto Message types don't
 * match the cache shape: `int64` → string (JSON wire), Timestamp → number,
 * required-with-defaults → optional, camelCase-only → snake-tolerant.
 */
export interface BadgeData extends EntityData {
  id?: string;
  displayName?: string;
  displayIconImageId?: string;
  displayDescription?: string;
  totalAwardedCount?: number;
  pastDayAwardedCount?: number;
  rarity?: string;
  badgeTypeLabel?: string;
  createdTime?: number;
  updatedTime?: number;
  awardedTime?: number;
}

/**
 * Map of derived (virtual) field name → raw timestamp source field(s) on the
 * badge record. Both snake and camel are accepted on input and output to match
 * the wire-format and runtime case tolerance.
 */
const TIMESTAMP_DERIVED_FIELDS: Record<string, readonly [snake: string, camel: string]> = {
  created_time_formatted: ["created_time", "createdTime"],
  createdTimeFormatted: ["created_time", "createdTime"],
  updated_time_formatted: ["updated_time", "updatedTime"],
  updatedTimeFormatted: ["updated_time", "updatedTime"],
  awarded_time_formatted: ["awarded_time", "awardedTime"],
  awardedTimeFormatted: ["awarded_time", "awardedTime"],
};

function calculateBadgeDerivedField(fieldName: string, badgeData: BadgeData): unknown {
  const sourceFields = TIMESTAMP_DERIVED_FIELDS[fieldName];
  if (!sourceFields) return undefined;
  const [snakeKey, camelKey] = sourceFields;
  return hydrationTimestampToLocalDateString(badgeData[snakeKey] ?? badgeData[camelKey]);
}

/**
 *
 * Browser: lazy process singleton — shared across services bundles
 *
 * SSR: fresh instance per call, scoped to the calling
 * `createSduiServices()` request.
 *
 * Provides derived `*_formatted` timestamp fields from the raw record.
 */
export class BadgeStore extends EntityStore<BadgeData> {
  constructor() {
    super({ derivedFieldComputer: calculateBadgeDerivedField });
  }
}
