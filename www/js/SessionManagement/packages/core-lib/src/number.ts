/**
 * Parses a string into an integer and returns `null` if the parsing failed.
 *
 * Note that if the integer is outside the safe integer range, then a loss of precision will occur.
 */
export const parseInt = (str: string, radix = 10): number | null => {
  // eslint-disable-next-line no-restricted-properties
  const num = Number.parseInt(str, radix);
  return Number.isNaN(num) ? null : num;
};

/** Parses a string into a float and returns `null` if the parsing failed or was `NaN`. */
export const parseFloat = (str: string): number | null => {
  // eslint-disable-next-line no-restricted-properties
  const num = Number.parseFloat(str);
  return Number.isNaN(num) ? null : num;
};
