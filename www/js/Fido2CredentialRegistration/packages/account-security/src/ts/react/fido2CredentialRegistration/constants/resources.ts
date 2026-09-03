import { TranslateFunction } from "react-utilities";
import { AuthApiError } from "@rbx/authentication-common/passkey/api";
import * as TwoStepVerificationApiTypes from "../../../common/request/types/twoStepVerification";

export const mapAuthApiErrorToResource = (
  translate: TranslateFunction,
  error: AuthApiError | null,
): string => {
  switch (error) {
    case AuthApiError.INVALID_CREDENTIAL_NICKNAME:
      return translate("Message.Error.InvalidCredentialNickname");

    case AuthApiError.EXCEEDED_REGISTERED_KEYS_LIMIT:
      return translate("Message.Error.ExceededRegisteredKeysLimit");

    case AuthApiError.FEATURE_DISABLED:
      return translate("Response.FeatureDisabled");

    default:
      return translate("MessageUnknownError");
  }
};

export const mapTwoStepVerificationErrorToResource = (
  translate: TranslateFunction,
  error: TwoStepVerificationApiTypes.TwoStepVerificationError | null,
): string => {
  switch (error) {
    case TwoStepVerificationApiTypes.TwoStepVerificationError.INVALID_EMAIL:
      return translate("Message.Error.NoVerifiedEmail");

    case TwoStepVerificationApiTypes.TwoStepVerificationError.INVALID_PASSWORD:
      return translate("Message.Error.Email.IncorrectPassword");

    case TwoStepVerificationApiTypes.TwoStepVerificationError.TOO_MANY_REQUESTS:
      return translate("Message.Error.TooManyRequests");

    case TwoStepVerificationApiTypes.TwoStepVerificationError.PIN_LOCKED:
      return translate("Message.Error.Email.PinLocked");

    case TwoStepVerificationApiTypes.TwoStepVerificationError.FEATURE_DISABLED:
      return translate("Response.FeatureDisabled");

    case TwoStepVerificationApiTypes.TwoStepVerificationError.INVALID_CODE:
      return translate("Response.Dialog.InvalidCodeError");

    case TwoStepVerificationApiTypes.TwoStepVerificationError.CONFIGURATION_ALREADY_ENABLED:
      return translate("Message.Error.AlreadyEnabled");

    case TwoStepVerificationApiTypes.TwoStepVerificationError.INVALID_SETUP_TOKEN:
      return translate("Response.Dialog.AuthenticatorSessionExpired");

    case TwoStepVerificationApiTypes.TwoStepVerificationError.REAUTHENTICATION_REQUIRED:
      return translate("Message.Error.ReauthenticationRequired");

    case TwoStepVerificationApiTypes.TwoStepVerificationError.INVALID_PHONE_NUMBER:
      return translate("Message.Error.InvalidPhoneNumber");

    case TwoStepVerificationApiTypes.TwoStepVerificationError.EXCEEDED_REGISTERED_KEYS_LIMIT:
      return translate("Message.Error.ExceededRegisteredKeysLimit");

    case TwoStepVerificationApiTypes.TwoStepVerificationError.INVALID_CREDENTIAL_NICKNAME:
      return translate("Message.Error.InvalidCredentialNickname");

    default:
      return translate("MessageUnknownError");
  }
};
