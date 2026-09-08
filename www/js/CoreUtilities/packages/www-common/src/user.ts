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
