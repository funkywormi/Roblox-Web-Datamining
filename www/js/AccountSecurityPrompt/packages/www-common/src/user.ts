import { downcast, SubType } from "@rbx/core-lib/types";
import { parseInt } from "@rbx/core-lib/number";
import { bigIntFromNumber, parseBigInt } from "@rbx/core-lib/bigint";

/**
 * A user ID represented as a string.
 *
 * The ID is guaranteed to be a positive integer (i.e., `> 0`) within the safe integer range (i.e., `<= Number.MAX_SAFE_INTEGER`).
 *
 * User ID strings can be infallibly converted to numbers and bigints, as this is checked at
 * construction. (Of course, this invariant can be broken if unsound casts are used.)
 */
export type UserId = SubType<"UserId", string>;

const isValidId = (id: bigint) => id > 0 && id <= Number.MAX_SAFE_INTEGER;

export const userIdToBigInt = (userId: UserId): bigint => {
  const big = parseBigInt(userId);
  if (big == null) {
    // Should be enforced by type system. A truly exceptional error.
    // eslint-disable-next-line no-restricted-syntax
    throw new Error(`UserId ${userId} was not parsable as a bigint.`);
  }
  return big;
};

export const userIdToNumber = (userId: UserId): number => {
  const num = parseInt(userId);
  if (num == null) {
    // Should be enforced by type system. A truly exceptional error.
    // eslint-disable-next-line no-restricted-syntax
    throw new Error(`UserId ${userId} was not parsable as an integer.`);
  }
  return num;
};

/** Convert a `bigint` into a {@link UserId}. Returns `null` if the bigint is not a positive integer in the safe integer range. */
export const userIdFromBigInt = (big: bigint): UserId | null => {
  return isValidId(big) ? downcast(big.toString()) : null;
};

/**
 * Convert a `number` into a {@link UserId}. Returns `null` if the number is not a positive integer in the safe integer range.
 *
 * Prefer {@link parseUserId} instead of `userIdFromNumber(parseInt(str))`, as the former handles precision issues properly.
 */
export const userIdFromNumber = (num: number): UserId | null => {
  const big = bigIntFromNumber(num);
  return big == null ? null : userIdFromBigInt(big);
};

/** Parse a string into a {@link UserId}. Returns `null` if the string cannot be parsed as a positive integer in the safe integer range. */
export const parseUserId = (str: string): UserId | null => {
  const big = parseBigInt(str);
  return big == null ? null : userIdFromBigInt(big);
};

/** Roblox Plus membership, shared by the .NET meta tag and Next.js `data-user-membership`. */
export const blackbirdMembership = "blackbird" as const;

export type User = {
  id: UserId;
  userName?: string;
  displayName?: string;
  isPremiumUser: boolean;
  membership?: typeof blackbirdMembership;
  isVerified: boolean;
  isUnder13: boolean;
  /**
   * @deprecated Use `id` instead.
   */
  isAuthenticated: true;
};

export const userMetaFromDataset = (dataset: DOMStringMap): User | undefined => {
  const rawUserId = dataset.userid ?? dataset.user;

  const userId = rawUserId == null ? undefined : (parseUserId(rawUserId) ?? undefined);

  if (typeof userId !== "string") {
    return undefined;
  }

  return {
    isAuthenticated: true,
    id: userId,
    userName: dataset.name ?? dataset.userName,
    displayName: dataset.displayname ?? dataset.userDisplayName,
    isPremiumUser: dataset.ispremiumuser === "true" || dataset.userIsPremium === "true",
    membership:
      dataset.membership === blackbirdMembership || dataset.userMembership === blackbirdMembership
        ? blackbirdMembership
        : undefined,
    isVerified: dataset.hasverifiedbadge === "true" || dataset.userHasVerifiedBadge === "true",
    isUnder13: dataset.isunder13 === "true" || dataset.userAgeBracket === "AgeUnder13",
  };
};

export const getCurrentUser = (): User | undefined => {
  if (typeof document === "undefined") {
    return undefined;
  }

  const dataset =
    document.querySelector<HTMLMetaElement>('meta[name="user-data"]')?.dataset ??
    document.documentElement.dataset;

  return userMetaFromDataset(dataset);
};
