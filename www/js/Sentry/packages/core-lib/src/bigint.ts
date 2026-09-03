/* eslint-disable no-restricted-syntax */

/** Converts a `number` to a `bigint`. Returns `null` if the `number` is not an integer. */
export const bigIntFromNumber = (num: number): bigint | null => {
  try {
    return BigInt(num);
  } catch {
    return null;
  }
};

/**
 * Converts a `bigint` to a `number`. Returns `null` if the `bigint` would overflow the safe integer range.
 *
 * See {@link bigIntToNumberLossy} to convert with a potential loss of precision.
 */
export const bigIntToNumber = (big: bigint): number | null =>
  Number.MIN_SAFE_INTEGER <= big && big <= Number.MAX_SAFE_INTEGER ? Number(big) : null;

/**
 * Converts a `bigint` to a `number` with a potential loss of precision.
 *
 * See {@link bigIntToNumber} to ensure a conversion with no loss of precision occurs.
 */
export const bigIntToNumberLossy = (big: bigint): number => Number(big);

/**
 * Parses a string into a `bigint` and returns `null` if the parsing failed.
 *
 * An empty string is parsed as `null`, not `0n`.
 */
export const parseBigInt = (str: string): bigint | null => {
  if (!str.trim()) {
    return null;
  }

  try {
    return BigInt(str);
  } catch {
    return null;
  }
};
