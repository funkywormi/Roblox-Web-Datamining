/**
 * Parse a number field from a string, number, or boolean input.
 * Returns the default value if the input is not a valid number or undefined.
 */
export const parseMaybeStringNumberField = (
  input: string | number | boolean | undefined,
  defaultValue: number,
): number => {
  if (typeof input === "number") {
    return input;
  }

  if (typeof input === "string") {
    const parsed = parseInt(input, 10);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return defaultValue;
};
