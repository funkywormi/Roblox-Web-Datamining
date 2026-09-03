import { httpService } from "@rbx/core-scripts/legacy/core-utilities";
import {
  getUpdateDisplayNameUrl,
  getValidateDisplayNameUrl,
  displayNameErrorCodeToTranslationKey,
  agedUpDisplayNameErrorCodeToTranslationKey,
  unknownErrorTranslationKey,
} from "../constants/displayNameConstants";
import { DisplayNameErrorCode } from "../enums/displayNameErrorCodes";

export type TDisplayNameParams = {
  userId: number;
  newDisplayName: string;
  showAgedUpDisplayName: boolean;
};

/**
 * Get the translation key for a display name error code.
 */
const getErrorTranslationKey = (
  errorCode: number | null,
  showAgedUpDisplayName: boolean,
): string => {
  if (errorCode === null) {
    return unknownErrorTranslationKey;
  }

  const mapping = showAgedUpDisplayName
    ? agedUpDisplayNameErrorCodeToTranslationKey
    : displayNameErrorCodeToTranslationKey;

  return mapping[errorCode as DisplayNameErrorCode] || unknownErrorTranslationKey;
};

/**
 * Validate a display name before updating.
 * @throws Translation key string if validation fails
 */
export const validateDisplayName = async (params: TDisplayNameParams): Promise<void> => {
  const url = getValidateDisplayNameUrl(params.userId, params.newDisplayName);

  try {
    await httpService.get({ url, withCredentials: true });
  } catch (error: unknown) {
    const errorCode = httpService.parseErrorCode(error);
    const translationKey = getErrorTranslationKey(errorCode, params.showAgedUpDisplayName);
    throw new Error(translationKey, { cause: error });
  }
};

/**
 * Update a user's display name.
 * @throws Translation key string if update fails
 */
export const updateDisplayName = async (params: TDisplayNameParams): Promise<void> => {
  const url = getUpdateDisplayNameUrl(params.userId);

  try {
    await httpService.patch(
      { url, withCredentials: true },
      { newDisplayName: params.newDisplayName },
    );
  } catch (error: unknown) {
    const errorCode = httpService.parseErrorCode(error);
    const translationKey = getErrorTranslationKey(errorCode, params.showAgedUpDisplayName);
    throw new Error(translationKey, { cause: error });
  }
};
