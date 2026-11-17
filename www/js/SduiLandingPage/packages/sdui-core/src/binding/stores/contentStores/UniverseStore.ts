import type { EntityData, TranslateFunction } from "../../../types";
import { EntityStore, type DerivedFieldComputers } from "../EntityStore";

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

/**
 * Return types of the derived universe fields. They are not stored on
 * `UniverseData`. `getField` stays untyped: a stored field of the same name
 * wins, whatever its type.
 */
export interface UniverseDerivedFields {
  icon: string | undefined;
  largeIcon: string | undefined;
  ratingTextNoPercent: string;
  rating_text_no_percent: string;
  ratingTextFormattedBrief: string;
  rating_text_formatted_brief: string;
  ratingTextFormatted: string;
  rating_text_formatted: string;
}

const NO_RATING_PLACEHOLDER = "--";

function readNumericField(data: UniverseData, camelKey: string, snakeKey: string): number {
  return Number(data[camelKey] ?? data[snakeKey] ?? 0);
}

/** Up-vote percentage as a whole number, or null when the universe has no votes. */
function votePercent(universeData: UniverseData): string | null {
  const upVotes = readNumericField(universeData, "totalUpVotes", "total_up_votes");
  const downVotes = readNumericField(universeData, "totalDownVotes", "total_down_votes");
  const totalVotes = upVotes + downVotes;
  if (totalVotes <= 0) return null;
  return String(Math.floor((upVotes / totalVotes) * 100));
}

/**
 * Templates bind `universe.icon` / `universe.largeIcon`, which are not in the
 * universe payload; Lua resolves them from the game-icon store. A GameIcon
 * rbxthumb URL is the same picture, and the web image parser understands it.
 */
function universeIconId(universeData: UniverseData, entityId: string): string {
  const { id } = universeData;
  if (id == null || id === "") return entityId;
  return id;
}

function gameIconUrl(id: string | undefined, size: number): string | undefined {
  if (id == null || id === "") return undefined;
  return `rbxthumb://type=GameIcon&id=${id}&w=${size}&h=${size}`;
}

function ratingText(
  universeData: UniverseData,
  format: "number" | "brief" | "full",
  translate?: TranslateFunction,
): string {
  const pct = votePercent(universeData);
  if (pct == null) return NO_RATING_PLACEHOLDER;
  // For templates that format it as `{percentRating}% Rating`, so the percent
  // sign stays in the translation instead of this value.
  if (format === "number") return pct;
  if (format === "brief") return `${pct}%`;

  const translated = translate?.("Label.RatingPercentage", { percentRating: pct });
  return translated?.length ? translated : `${pct}% Rating`;
}

function createUniverseDerivedFields(
  translate?: TranslateFunction,
): DerivedFieldComputers<UniverseData, UniverseDerivedFields> {
  return {
    icon: (universeData, entityId) => gameIconUrl(universeIconId(universeData, entityId), 150),
    largeIcon: (universeData, entityId) => gameIconUrl(universeIconId(universeData, entityId), 512),
    ratingTextNoPercent: universeData => ratingText(universeData, "number", translate),
    rating_text_no_percent: universeData => ratingText(universeData, "number", translate),
    ratingTextFormattedBrief: universeData => ratingText(universeData, "brief", translate),
    rating_text_formatted_brief: universeData => ratingText(universeData, "brief", translate),
    ratingTextFormatted: universeData => ratingText(universeData, "full", translate),
    rating_text_formatted: universeData => ratingText(universeData, "full", translate),
  };
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
 * Provides derived icon and rating fields, typed by `UniverseDerivedFields`.
 */
export class UniverseStore extends EntityStore<UniverseData, UniverseDerivedFields> {
  constructor(translate?: TranslateFunction) {
    super({ derivedFieldComputers: createUniverseDerivedFields(translate) });
  }
}
