import type { EntityData, TranslateFunction } from "../../../types";
import { EntityStore } from "../EntityStore";

/** Content-type key under which universes are registered on the data binder. */
export const UNIVERSE_CONTENT_TYPE = "universe";

/** Implicit `inputData` keys for `universe` specs without an explicit `inputPath`. */
export const UNIVERSE_DEFAULT_PATHS: readonly string[] = ["universe_id", "universeId"];

/**
 * Camel-cased view of `universe_data.proto` as held in the cache. All
 * fields optional (partial hydration); `int64` fields land as string,
 * `int32` / small counts as number. Hand-rolled rather than imported
 * from `@rbx/service-contracts-proto` — see `BadgeData` for the full
 * rationale.
 */
export interface UniverseData extends EntityData {
  id?: string;
  name?: string;
  description?: string;
  rootPlaceId?: string;
  /** "User" or "Group". */
  creatorType?: string;
  creatorId?: string;
  playerCount?: number;
  totalUpVotes?: string | number;
  totalDownVotes?: string | number;
  isVoiceSupported?: boolean;
  isCameraSupported?: boolean;
  localizedFiatPrice?: string;
  genreL1?: string;
  genreL2?: string;
  maximumServerSize?: number;
  createdDate?: string;
  updatedDate?: string;
  favoriteCount?: number;
  totalVisits?: string | number;
  canonicalUrlPath?: string;
  gameMinimumAge?: number;
  gameAgeDisplayName?: string;
  contentMaturity?: string;
  isOfficiallyLicensed?: boolean;
  refundPolicyText?: string;
  refundArticleId?: string;
  previewVideoId?: string;
}

const NO_RATING_PLACEHOLDER = "--";

function readNumericField(data: UniverseData, camelKey: string, snakeKey: string): number {
  return Number(data[camelKey] ?? data[snakeKey] ?? 0);
}

function calculateUniverseDerivedField(
  fieldName: string,
  universeData: UniverseData,
  translate?: TranslateFunction,
): unknown {
  const isBrief =
    fieldName === "rating_text_formatted_brief" || fieldName === "ratingTextFormattedBrief";
  const isFull = fieldName === "rating_text_formatted" || fieldName === "ratingTextFormatted";
  if (!isBrief && !isFull) {
    return undefined;
  }

  const upVotes = readNumericField(universeData, "totalUpVotes", "total_up_votes");
  const downVotes = readNumericField(universeData, "totalDownVotes", "total_down_votes");
  const totalVotes = upVotes + downVotes;
  if (totalVotes <= 0) return NO_RATING_PLACEHOLDER;
  const pct = String(Math.floor((upVotes / totalVotes) * 100));

  if (isBrief) {
    return `${pct}%`;
  } else {
    const translated = translate?.("Label.RatingPercentage", { percentRating: pct });
    return translated?.length ? translated : `${pct}% Rating`;
  }
}

/**
 * Store for the `universe` content type. Access via
 * `UniverseStore.getInstance()`.
 *
 * Browser: lazy process singleton — shared across services bundles
 *
 * SSR: fresh instance per call, scoped to the calling
 * `createSduiServices()` request.
 *
 * Provides the derived `rating_text_formatted` field.
 */
export class UniverseStore extends EntityStore<UniverseData> {
  constructor(translate?: TranslateFunction) {
    super({
      derivedFieldComputer: (fieldName, data) =>
        calculateUniverseDerivedField(fieldName, data, translate),
    });
  }
}
