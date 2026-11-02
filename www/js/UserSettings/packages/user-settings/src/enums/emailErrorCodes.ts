/**
 * Error codes returned by the account settings email API.
 */
export enum EmailErrorCode {
  Unknown = 0,
  PinLocked = 1,
  FeatureDisabled = 2,
  TooManyAccounts = 3,
  SameEmail = 4,
  AlreadyVerified = 5,
  TooManyUpdates = 6,
  TooManyVerify = 7,
  IncorrectPassword = 8,
  InvalidEmail = 9,
  NoEmailAssociated = 10,
  RequiresCorpNetwork = 11,
}
