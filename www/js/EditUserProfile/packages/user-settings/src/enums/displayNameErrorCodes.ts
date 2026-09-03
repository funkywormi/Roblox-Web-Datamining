/**
 * Error codes returned by the display name validation/update API.
 */
export enum DisplayNameErrorCode {
  TooShort = 1,
  TooLong = 2,
  InvalidCharacters = 3,
  Moderated = 4,
  Throttled = 5,
  InvalidCharacterSetCombination = 8,
  NameNotAvailable = 9,
}
