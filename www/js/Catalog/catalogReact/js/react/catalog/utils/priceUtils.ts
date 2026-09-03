export function convertInputToDisplayPrice(input?: string): number | '' {
  // Check if the input is null, undefined, or empty
  if (!input?.trim()) {
    return '';
  }

  // Try to convert the string to a number
  let number = Number(input);

  // Ensure the number is finite
  if (Number.isNaN(number) || !Number.isFinite(number)) {
    return '';
  }

  // Ensure the number is non-negative
  if (number < 0) {
    return 0;
  }

  // Truncate the number to remove any decimal part
  number = Math.floor(number);

  return number;
}

export function convertDisplayPriceToQueryPrice(priceForDisplay: number | ''): number | undefined {
  return priceForDisplay === '' ? undefined : priceForDisplay;
}
