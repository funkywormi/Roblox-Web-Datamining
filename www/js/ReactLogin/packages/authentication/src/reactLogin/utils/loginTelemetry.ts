import { CredentialType } from "@rbx/authentication-common/types/loginTypes";
import { errorCodes } from "../constants/loginConstants";
import {
  authFailureReason,
  authFlow,
  authMethod,
  authSource,
  AuthFailureReason,
  AuthMethod,
  createAuthFlowTelemetry,
} from "../../shared/telemetry/authFlowTelemetry";

export const legacyLoginTelemetry = createAuthFlowTelemetry({
  flow: authFlow.login,
  source: authSource.legacy,
});

export const getLoginTelemetryMethod = (credentialType: CredentialType): AuthMethod => {
  switch (credentialType) {
    case CredentialType.EmailOtpSessionToken:
      return authMethod.otp;
    case CredentialType.Passkey:
      return authMethod.passkey;
    case CredentialType.AuthToken:
      return authMethod.authToken;
    case CredentialType.MagicLink:
      return authMethod.magicLink;
    default:
      return authMethod.password;
  }
};

const getHttpStatus = (error: unknown): number | undefined => {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }
  const record = error as {
    status?: unknown;
    response?: { status?: unknown };
  };
  if (typeof record.response?.status === "number") {
    return record.response.status;
  }
  return typeof record.status === "number" ? record.status : undefined;
};

export const getLoginTelemetryFailureReason = (
  errorCode: number | null,
  error: unknown,
  credentialType?: CredentialType,
): AuthFailureReason => {
  switch (errorCode) {
    case errorCodes.badCredentials:
    case errorCodes.accountNotFound:
    case errorCodes.noPassword:
    case errorCodes.unverifiedCredentials:
    case errorCodes.passkeyOnlyAccount:
      return authFailureReason.credentials;
    case errorCodes.captcha:
    case errorCodes.captchaLoadFailed:
    case errorCodes.captchaVerifyFailed:
    case errorCodes.captchaUnknownError:
      return authFailureReason.captcha;
    case errorCodes.passwordResetRequired:
    case errorCodes.defaultLoginRequired:
    case errorCodes.securityQuestionRequired:
    case errorCodes.securityQuestionFailed:
    case errorCodes.multipleUsersPerCredential:
    case errorCodes.emptyAccountSwitchBlobRequired:
    case errorCodes.parentEmptyAccountSwitchBlobRequired:
      return authFailureReason.challenge;
    case errorCodes.accountIssue:
    case errorCodes.luoBuUserDenied:
    case errorCodes.screentimeRestricted:
    case errorCodes.credentialsNotAllowed:
    case errorCodes.loginBlocked:
    case errorCodes.maxLoggedInAccountsLimitReached:
      return authFailureReason.accountRestriction;
    case errorCodes.tooManyAttempts:
      return authFailureReason.rateLimited;
    default: {
      const status = getHttpStatus(error);
      if (status === 429) {
        return authFailureReason.rateLimited;
      }
      if (status !== undefined && status >= 500) {
        return authFailureReason.server;
      }
      if (
        errorCode !== null &&
        (credentialType === CredentialType.MagicLink ||
          credentialType === CredentialType.AuthToken ||
          credentialType === CredentialType.Passkey)
      ) {
        return authFailureReason.credentials;
      }
      return error === undefined ? authFailureReason.network : authFailureReason.unknown;
    }
  }
};
