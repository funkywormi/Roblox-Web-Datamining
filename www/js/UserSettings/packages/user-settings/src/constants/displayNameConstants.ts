import { EnvironmentUrls } from "@rbx/core-scripts/legacy/Roblox";
import { DisplayNameErrorCode } from "../enums/displayNameErrorCodes";

export const maxDisplayNameCharacters = 20;

/** Wait after PATCH before refetching profiles so chrome and account-info UIs update together. */
export const displayNameSettleDelayMs = 2000;

export const displayNameErrorCodeToTranslationKey: Record<DisplayNameErrorCode, string> = {
  [DisplayNameErrorCode.TooShort]: "ErrorMessage.NameTooShort",
  [DisplayNameErrorCode.TooLong]: "ErrorMessage.NameTooLong",
  [DisplayNameErrorCode.InvalidCharacters]: "ErrorMessage.NameUnsupportedChars",
  [DisplayNameErrorCode.Moderated]: "ErrorMessage.NameInappropriate",
  [DisplayNameErrorCode.Throttled]: "ErrorMessage.NameHasChanged",
  [DisplayNameErrorCode.InvalidCharacterSetCombination]: "ErrorMessage.NameUnsupportedChars",
  [DisplayNameErrorCode.NameNotAvailable]: "ErrorMessage.NameNotAvailable",
};

export const agedUpDisplayNameErrorCodeToTranslationKey: Record<DisplayNameErrorCode, string> = {
  [DisplayNameErrorCode.TooShort]: "ErrorMessage.AgedUpNameTooShort",
  [DisplayNameErrorCode.TooLong]: "ErrorMessage.AgedUpNameTooLong",
  [DisplayNameErrorCode.InvalidCharacters]: "ErrorMessage.AgedUpNameUnsupportedChars",
  [DisplayNameErrorCode.Moderated]: "ErrorMessage.AgedUpNameInappropriate",
  [DisplayNameErrorCode.Throttled]: "ErrorMessage.AgedUpNameHasChanged",
  [DisplayNameErrorCode.InvalidCharacterSetCombination]:
    "ErrorMessage.NameMoreThanOneCharacterKind",
  [DisplayNameErrorCode.NameNotAvailable]: "ErrorMessage.AgedUpNameNotAvailable",
};

export const unknownErrorTranslationKey = "Message.Error.Default";
export const closeTranslationKey = "Action.Dialog.Close";
export const nameTooShortTranslationKey = "ErrorMessage.NameTooShort";

export const getUpdateDisplayNameUrl = (userId: number): string =>
  `${EnvironmentUrls.usersApi}/v1/users/${userId}/display-names`;

export const getValidateDisplayNameUrl = (userId: number, newDisplayName: string): string => {
  const encodedDisplayName = encodeURIComponent(newDisplayName);
  return `${EnvironmentUrls.usersApi}/v1/users/${userId}/display-names/validate?displayName=${encodedDisplayName}`;
};
