import { AcbAgeRating } from "@rbx/user-settings";
import { acbAgeRatingCopy } from "./acbAgeRatingCopy";

/**
 * Rating authority short names as they appear in IARC ref-data.
 * Phase 1 rolls out to Australia only, so ACB is the only authority enabled.
 * The others are kept here as the known ref-data set.
 */
export enum RatingAuthority {
  Acb = "ACB",
  // ClassInd = "CLASSIND",
  // Esrb = "ESRB",
  // Generic = "Generic",
  // Gmedia = "GMEDIA",
  // Grac = "GRAC",
  // Igrs = "IGRS",
  // Pegi = "PEGI",
  // Russia = "RUSSIA",
  // Tca = "TCA",
  // Usk = "USK",
}

// TODO ACCMAN-4602: Replace hardcoded icon URLs and rating labels with the EGS
// ratings display / IARC ref-data API once it can fetch specific ratings on
// demand.
const ratingsIconBaseUrl = "https://cdn.foundation.roblox.com/current/ratings/thumbnails";

export const buildAgeRatingIconUrl = (authority: RatingAuthority, messageId: string): string =>
  `${ratingsIconBaseUrl}/${encodeURIComponent(authority)}/${encodeURIComponent(messageId)}.png`;

export type TAgeRatingEntry = {
  /** IARC MessageID. This is the value stored on the user setting. */
  messageId: string;
  authority: RatingAuthority;
  /** IARC AgeID, kept for correlation with the ratings APIs. */
  ageId: number;
  /** IARC severity. Ascending within an authority, and the order ratings display in. */
  severity: number;
  label: string;
  description: string;
  iconUrl: string;
};

export type TAgeRatingSystem = {
  authority: RatingAuthority;
  /** Ratings from least to most restrictive. */
  ratings: TAgeRatingEntry[];
};

type TAuthorityRating = Omit<TAgeRatingEntry, "authority" | "iconUrl">;

const buildRatingSystem = (
  authority: RatingAuthority,
  ratings: readonly TAuthorityRating[],
): TAgeRatingSystem => ({
  authority,
  ratings: ratings
    .toSorted((a, b) => a.severity - b.severity)
    .map(rating => ({
      ...rating,
      authority,
      iconUrl: buildAgeRatingIconUrl(authority, rating.messageId),
    })),
});

export const acbRatingSystem = buildRatingSystem(RatingAuthority.Acb, [
  { messageId: AcbAgeRating.G, ageId: 33, severity: 0, ...acbAgeRatingCopy[AcbAgeRating.G] },
  { messageId: AcbAgeRating.PG, ageId: 34, severity: 1, ...acbAgeRatingCopy[AcbAgeRating.PG] },
  { messageId: AcbAgeRating.M, ageId: 35, severity: 2, ...acbAgeRatingCopy[AcbAgeRating.M] },
  { messageId: AcbAgeRating.MA15, ageId: 36, severity: 3, ...acbAgeRatingCopy[AcbAgeRating.MA15] },
  { messageId: AcbAgeRating.R18, ageId: 37, severity: 4, ...acbAgeRatingCopy[AcbAgeRating.R18] },
]);

/**
 * The rating systems this surface can render.
 */
export const ageRatingSystems: Partial<Record<RatingAuthority, TAgeRatingSystem>> = {
  [RatingAuthority.Acb]: acbRatingSystem,
};

const knownRatingSystems = Object.values(ageRatingSystems).filter(
  (system): system is TAgeRatingSystem => system !== undefined,
);

const ratingSystemsByMessageId = new Map<string, TAgeRatingSystem>(
  knownRatingSystems.flatMap(system =>
    system.ratings.map(rating => [rating.messageId, system] as const),
  ),
);

/** The authority that issued a MessageID, derived from the ratings we have mapped. */
export const getRatingSystemForValue = (value: unknown): TAgeRatingSystem | undefined =>
  typeof value === "string" ? ratingSystemsByMessageId.get(value) : undefined;

export const getAgeRatingEntry = (value: unknown): TAgeRatingEntry | undefined =>
  getRatingSystemForValue(value)?.ratings.find(rating => rating.messageId === value);

/**
 * Resolve the rating system from the current value, then the options. Returns undefined when there
 * is nothing to resolve from, or when those values belong to an authority we have not mapped yet:
 * without a value there is no rating to show as current and no authority to trust, so callers are
 * expected to treat that as an error rather than assume one.
 */
export const resolveRatingSystem = (
  currentValue?: unknown,
  optionValues?: readonly unknown[],
): TAgeRatingSystem | undefined =>
  getRatingSystemForValue(currentValue) ??
  (optionValues ?? [])
    .map(value => getRatingSystemForValue(value))
    .find(system => system !== undefined);
