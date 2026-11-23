import type { EntityData } from "../../../types";
import { EntityStore, type DerivedFieldComputers } from "../EntityStore";
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
/** Virtual timestamp strings. They are not stored on `BadgeData`. */
export interface BadgeDerivedFields {
  created_time_formatted: string | undefined;
  createdTimeFormatted: string | undefined;
  updated_time_formatted: string | undefined;
  updatedTimeFormatted: string | undefined;
  awarded_time_formatted: string | undefined;
  awardedTimeFormatted: string | undefined;
}

function formattedTimestamp(
  badgeData: BadgeData,
  snakeKey: string,
  camelKey: string,
): string | undefined {
  return hydrationTimestampToLocalDateString(badgeData[snakeKey] ?? badgeData[camelKey]);
}

function createBadgeDerivedFields(): DerivedFieldComputers<BadgeData, BadgeDerivedFields> {
  return {
    created_time_formatted: data => formattedTimestamp(data, "created_time", "createdTime"),
    createdTimeFormatted: data => formattedTimestamp(data, "created_time", "createdTime"),
    updated_time_formatted: data => formattedTimestamp(data, "updated_time", "updatedTime"),
    updatedTimeFormatted: data => formattedTimestamp(data, "updated_time", "updatedTime"),
    awarded_time_formatted: data => formattedTimestamp(data, "awarded_time", "awardedTime"),
    awardedTimeFormatted: data => formattedTimestamp(data, "awarded_time", "awardedTime"),
  };
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
export class BadgeStore extends EntityStore<BadgeData, BadgeDerivedFields> {
  constructor() {
    super({ derivedFieldComputers: createBadgeDerivedFields() });
  }
}
