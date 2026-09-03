import environmentUrls from "@rbx/environment-urls";
import { UrlConfig } from "@rbx/core-scripts/http";

const authApiUrl = environmentUrls.authApi;

const AUTH_API_TIMEOUT = 10000;

export enum AuthApiError {
  UNKNOWN = 0,
  EXCEEDED_REGISTERED_KEYS_LIMIT = 1,
  FEATURE_DISABLED = 2,
  INVALID_CREDENTIAL_NICKNAME = 3,
}

export type StartRegistrationReturnType = {
  creationOptions: CredentialCreationOptions;
  sessionId: string;
};

export const START_REGISTRATION_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${authApiUrl}/v1/passkey/StartRegistration`,
  timeout: AUTH_API_TIMEOUT,
};

export const START_PRE_AUTH_REGISTRATION_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${authApiUrl}/v1/passkey/start-preauth-registration`,
  timeout: AUTH_API_TIMEOUT,
};

export type FinishRegistrationReturnType = undefined;

export const FINISH_REGISTRATION_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${authApiUrl}/v1/passkey/FinishRegistration`,
  timeout: AUTH_API_TIMEOUT,
};

export type FinishARPreAuthRegistrationReturnType = undefined;

export const FINISH_AR_PRE_AUTH_REGISTRATION_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${authApiUrl}/v1/passkey/finish-ar-preauth-registration`,
  timeout: AUTH_API_TIMEOUT,
};

export type DeleteCredentialBatchReturnType = undefined;

export const DELETE_CREDENTIAL_BATCH_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${authApiUrl}/v1/passkey/DeleteCredentialBatch`,
  timeout: AUTH_API_TIMEOUT,
};

/**
 * Wire values recognized by authentication-api for the optional `source`
 * field on FinishARPreAuthPasskeyRegistration. Unrecognized values are
 * silently dropped from the emitted passwordDeletionEvent.
 */
export const PasswordDeletionSource = {
  AccountRecoveryPasskeyOnly: "accountRecoveryPasskeyOnly",
  AccountRecoveryPasswordAndPasskey: "accountRecoveryPasswordAndPasskey",
} as const;
export type PasswordDeletionSource =
  (typeof PasswordDeletionSource)[keyof typeof PasswordDeletionSource];
