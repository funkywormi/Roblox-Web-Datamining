import { abbreviateNumber } from 'core-utilities';

const { suffixNames, suffixes } = abbreviateNumber;

const ABBREVIATION_THRESHOLD = 1000;
const DIGITS_AFTER_DECIMAL = 1;

const truncateAbbreviateNumbers = (
  abbreviatedValue: string,
  truncateLength = 3,
  suffixType = suffixNames.withoutPlus
): string => {
  const suffix = suffixType ? suffixes[suffixType] : suffixes[suffixNames.withPlus];
  let currentSuffix = '';
  let value = abbreviatedValue;

  // Extract the suffix if it exists
  const foundSuffix = suffix.find(s => s && s !== '' && abbreviatedValue.endsWith(s));
  if (foundSuffix) {
    currentSuffix = foundSuffix;
    value = abbreviatedValue.slice(0, -foundSuffix.length);
  }

  // Truncate the value
  if (value.length > truncateLength) {
    value = value.slice(0, truncateLength);
  }

  // Remove trailing period if it exists
  if (value.endsWith('.')) {
    value = value.slice(0, -1);
  }

  return value + currentSuffix;
};

const abbreviateNumberWithTruncateLength = (
  value: number,
  truncateLength = 3,
  suffixType = suffixNames.withoutPlus
): string => {
  const abbreviatedValue = abbreviateNumber.getAbbreviatedValue(value, suffixType);
  return truncateAbbreviateNumbers(abbreviatedValue, truncateLength, suffixType);
};

/**
 * Abbreviate number with truncate to max 4 digits. Example (abbreviationThreshold = 10000, digitsAfterDecimalPoint = 1)
 * 1001 -> 1001, 10000 -> 10K, 11111 -> 11.1K, 109999 -> 109.9K
 * @param value
 * @param abbreviationThreshold
 * @param suffixType
 * @param digitsAfterDecimalPoint
 * @returns Abbreviated number with truncate
 */
const truncateAndAbbreviateNumber = (
  value: number,
  abbreviationThreshold = ABBREVIATION_THRESHOLD,
  suffixType = suffixNames.withoutPlus,
  digitsAfterDecimalPoint = DIGITS_AFTER_DECIMAL
): string => {
  let truncatedNumber = abbreviateNumber.getTruncValue(
    value,
    abbreviationThreshold,
    suffixType,
    digitsAfterDecimalPoint
  );

  // Remove decimal part if it's .0
  // Example 1.0K -> 1K
  const truncatedNumberHasDecimal = truncatedNumber.indexOf('.0');
  if (truncatedNumberHasDecimal !== -1) {
    truncatedNumber =
      truncatedNumber.substring(0, truncatedNumberHasDecimal) +
      truncatedNumber.substring(truncatedNumberHasDecimal + 2);
  }
  return truncatedNumber;
};

export { abbreviateNumberWithTruncateLength, truncateAndAbbreviateNumber, suffixNames };
