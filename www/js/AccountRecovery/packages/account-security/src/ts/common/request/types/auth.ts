import EnvironmentUrls from "@rbx/environment-urls";
import { UrlConfig } from "@rbx/core-scripts/http";
import { Fido2Credential } from "./twoStepVerification";

const URL_NOT_FOUND = "URL_NOT_FOUND";
const authApiUrl = EnvironmentUrls.authApi ?? URL_NOT_FOUND;

const AUTH_API_TIMEOUT = 10000;

export enum AuthApiError {
  UNKNOWN = 0,
  EXCEEDED_REGISTERED_KEYS_LIMIT = 1,
  FEATURE_DISABLED = 2,
  INVALID_CREDENTIAL_NICKNAME = 3,
}

export enum PasswordResetError {
  UNKNOWN = 0,
  FEATURE_DISABLED = 1,
  FLOODED = 2,
  INVALID_PASSWORD = 20,
  PASSWORDS_DO_NOT_MATCH = 21,
  TWO_STEP_VERIFICATION_REQUIRED = 24,
}

export type StartRegistrationReturnType = {
  creationOptions: CredentialCreationOptions;
  sessionId: string;
};

/**
 * Request Type: `POST`.
 */
export const START_REGISTRATION_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${authApiUrl}/v1/passkey/StartRegistration`,
  timeout: AUTH_API_TIMEOUT,
};

/**
 * Request Type: `POST`.
 */
export const START_PRE_AUTH_REGISTRATION_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${authApiUrl}/v1/passkey/start-preauth-registration`,
  timeout: AUTH_API_TIMEOUT,
};

export type FinishRegistrationReturnType = void;

/**
 * Request Type: `POST`.
 */
export const FINISH_REGISTRATION_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${authApiUrl}/v1/passkey/FinishRegistration`,
  timeout: AUTH_API_TIMEOUT,
};

export type FinishARPreAuthRegistrationReturnType = void;

/**
 * Request Type: `POST`.
 * Finishes account recovery pre-auth passkey registration and deactivates password.
 */
export const FINISH_AR_PRE_AUTH_REGISTRATION_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${authApiUrl}/v1/passkey/finish-ar-preauth-registration`,
  timeout: AUTH_API_TIMEOUT,
};

export type DeleteCredentialBatchReturnType = void;

export const DELETE_CREDENTIAL_BATCH_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${authApiUrl}/v1/passkey/DeleteCredentialBatch`,
  timeout: AUTH_API_TIMEOUT,
};

export type ListCredentialsReturnType = {
  credentials: Fido2Credential[];
};

export const LIST_CREDENTIALS_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${authApiUrl}/v1/passkey/ListCredentials`,
  timeout: AUTH_API_TIMEOUT,
};

export type ResetPasswordReturnType = {
  shouldUpdateEmail: boolean;
  recoveryEmail: string;
  passkeyRegistrationSucceeded?: boolean;
  shouldPrompt2svRemoval?: boolean;
  shouldPromptPasskeyAddition?: boolean;
  shouldPromptCredentialInvalidation?: boolean;
};

/**
 * Request Type: `POST`.
 */
export const RESET_PASSWORD_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${authApiUrl}/v2/passwords/reset`,
  timeout: AUTH_API_TIMEOUT,
};

export type InvalidateTicketsReturnType = void;

/**
 * Invalidates all account security tickets / revert links for the authenticated user.
 * Request Type: `POST`.
 */
export const INVALIDATE_TICKETS_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${authApiUrl}/v1/revert/invalidate-tickets`,
  timeout: AUTH_API_TIMEOUT,
};
