import { AccountIntegrityChallengeService } from "@rbx/legacy-webapp-types/Roblox";
import { httpService } from "@rbx/core-scripts/legacy/core-utilities";
import { userSettingsV2Url } from "../constants/urlConstants";
import { EnabledStatusValue, UserSetting } from "../enums/userSettingsEnums";
import {
  emailErrorCodeToTranslationKey,
  getUpdateEmailUrl,
  unknownErrorTranslationKey,
} from "../constants/emailConstants";
import { EmailErrorCode } from "../enums/emailErrorCodes";
import { ChallengeAbandonedError } from "../enums/errorCodes";

/**
 * Get the translation key for an email error code.
 */
const getErrorTranslationKey = (errorCode: number | null): string => {
  if (errorCode === null) {
    return unknownErrorTranslationKey;
  }

  return emailErrorCodeToTranslationKey[errorCode as EmailErrorCode] || unknownErrorTranslationKey;
};

/**
 * Add or change the current user's email address.
 * @throws Translation key string if the update fails
 */
export const updateEmailAddress = async (emailAddress: string): Promise<void> => {
  try {
    await httpService.post({ url: getUpdateEmailUrl(), withCredentials: true }, { emailAddress });
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- untyped legacy global
    if (AccountIntegrityChallengeService.Generic.ChallengeError.matchAbandoned(error)) {
      throw new Error(ChallengeAbandonedError, { cause: error });
    }
    const errorCode = httpService.parseErrorCode(error);
    throw new Error(getErrorTranslationKey(errorCode), { cause: error });
  }
};

/**
 * Opt the current user into promotional offer emails.
 * @param auditHeader Legally sensitive content audit header for the consent shown to the user
 */
export const optIntoPromotionalOffersEmails = async (auditHeader: string): Promise<void> => {
  await httpService.post(
    { url: userSettingsV2Url, withCredentials: true, headers: { "rbx-audit-data": auditHeader } },
    {
      [UserSetting.AllowPromotionalOffersNotifications]: {
        channelSettings: [{ channelName: "Email", setting: EnabledStatusValue.Enabled }],
      },
    },
  );
};
