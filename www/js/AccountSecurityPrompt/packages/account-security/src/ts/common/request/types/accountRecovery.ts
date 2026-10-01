/**
 * Account Recovery
 */

import EnvironmentUrls from "@rbx/environment-urls";
import { UrlConfig } from "@rbx/core-scripts/http";

const URL_NOT_FOUND = "URL_NOT_FOUND";
const apiGatewayUrl = EnvironmentUrls.apiGatewayUrl ?? URL_NOT_FOUND;

const accountRecoveryServiceUrl = `${apiGatewayUrl}/account-recovery-service`;

export enum AccountRecoveryError {
  UNKNOWN = 1,
  REQUEST_TYPE_WAS_INVALID = 2,
  IDENTIFIER_INVALID = 3,
  TOO_MANY_REQUESTS = 4,
  ACCOUNT_NOT_VERIFIED = 5,
  INVALID_CODE = 6,
  INVALID_USER = 7,
  TWO_STEP_VERIFICATION_REQUIRED = 8,
  TRY_A_DIFFERENT_CONTACT_METHOD = 9,
}

export enum RecoveryState {
  Invalid = "RECOVERY_STATE_INVALID",
  AccountIdentifierRequired = "RECOVERY_STATE_ACCOUNT_IDENTIFIER_REQUIRED",
  ContactMethodVerificationRequired = "RECOVERY_STATE_CONTACT_METHOD_VERIFICATION_REQUIRED",
  AwaitingContactMethodVerification = "RECOVERY_STATE_AWAITING_CONTACT_METHOD_VERIFICATION",
  AccountVerified = "RECOVERY_STATE_ACCOUNT_VERIFIED",
  AwaitingReevaluation = "RECOVERY_STATE_AWAITING_REEVALUATION",
}

export type IdentifierType = "phone" | "email" | "username";

export type RequestedRecoveryType = "twostepverification" | "password";

export type RequestRecoveryMetadata = {
  userID: number;
  shouldResetPassword?: boolean;
  shouldRecover2sv?: boolean;
};

export type RequestRecoveryReturnType = {
  recoveryState: RecoveryState;
  recoverySessionId: string;
  requestRecoveryMetadata: RequestRecoveryMetadata;
};

/**
 * Request Type: `POST`.
 */
export const REQUEST_RECOVERY_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${accountRecoveryServiceUrl}/v1/request-recovery`,
  timeout: 10000,
};

export enum ContactMethodType {
  Email = 2,
  Phone = 3,
  RecoveryAccount = 4,
}

export function contactMethodTypeToString(value: ContactMethodType): string {
  switch (value) {
    case ContactMethodType.Email:
      return "Email";
    case ContactMethodType.Phone:
      return "Phone";
    case ContactMethodType.RecoveryAccount:
      return "RecoveryAccount";
    default:
      return "Unknown";
  }
}

export type SendCodeReturnType = {};

/**
 * Request Type: `POST`
 */
export const SEND_CODE_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${accountRecoveryServiceUrl}/v1/send-code`,
  timeout: 10000,
};

export type ResendCodeReturnType = {};

/**
 * Request Type: `POST`
 */
export const RESEND_CODE_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${accountRecoveryServiceUrl}/v1/resend-code`,
  timeout: 10000,
};

export type VerifyCodeReturnType = {};

/**
 * Request Type: `POST`
 */
export const VERIFY_CODE_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${accountRecoveryServiceUrl}/v1/verify-code`,
  timeout: 10000,
};

export const RecoveryIntentStatus = {
  Pending: "PENDING",
  Approved: "APPROVED",
  Denied: "DENIED",
  Redeemed: "REDEEMED",
  Invalid: "INVALID",
} as const;

export type RecoveryIntentStatus = (typeof RecoveryIntentStatus)[keyof typeof RecoveryIntentStatus];

export type GetRecoveryIntentStatusReturnType = {
  recoveryIntentId: string;
  status: RecoveryIntentStatus;
};

export type RecoveryIntent = {
  recoveryIntentId: string;
  mainAccountUserId: number;
  createdTime: string;
};

export type GetRecoveryIntentsResponse = {
  pendingRecoveryIntents: RecoveryIntent[];
};

export type RecoveryIntentRequest = {
  recoveryIntentId: string;
};

export const GET_RECOVERY_INTENT_STATUS_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${accountRecoveryServiceUrl}/v1/get-recovery-intent-status`,
  timeout: 10000,
};

export const GET_RECOVERY_INTENTS_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${accountRecoveryServiceUrl}/v1/get-recovery-intents`,
  timeout: 10000,
};

export const APPROVE_RECOVERY_INTENT_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${accountRecoveryServiceUrl}/v1/approve-recovery-intent`,
  timeout: 10000,
};

export const DENY_RECOVERY_INTENT_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${accountRecoveryServiceUrl}/v1/deny-recovery-intent`,
  timeout: 10000,
};

export type VerifyRecoveryIntentReturnType = {
  status: typeof RecoveryIntentStatus.Pending | typeof RecoveryIntentStatus.Redeemed;
};

export const VERIFY_RECOVERY_INTENT_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${accountRecoveryServiceUrl}/v1/verify-recovery-intent`,
  timeout: 10000,
};

export type VerifyBackupCodeReturnType = {};

/**
 * Request Type: `POST`
 */
export const VERIFY_BACKUP_CODE_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${accountRecoveryServiceUrl}/v1/verify-backup-code`,
  timeout: 10000,
};

export enum RecoveryMethodType {
  Invalid = 0,
  CurrentEmail = 1,
  BillingEmail = 2,
  HistoricalEmail = 3,
  Phone = 4,
  BackupCode = 10,
  RecoveryAccount = 11,
}

export type ContinueRecoveryReturnType = {
  recoveryState: RecoveryState;
  previousRecoveryMethod?: string;
  previousRecoveryMethodTypes?: RecoveryMethodType[];
  nextRecoveryMethodTypes?: RecoveryMethodType[];
};

/**
 * Request Type: `POST`
 */
export const CONTINUE_RECOVERY_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${accountRecoveryServiceUrl}/v1/continue-recovery`,
  timeout: 10000,
};

export type RecoverySessionMetadataReturnType = {
  eligibleUserIDsToRecover: number[];
  shouldAddContactMethod: boolean;
};

/**
 * Request Type: `POST`
 */
export const RECOVERY_SESSION_METADATA_CONFIG: UrlConfig = {
  url: `${accountRecoveryServiceUrl}/v1/recovery-session-metadata`,
  timeout: 10000,
};

export type SetEmailReturnType = {};

/**
 * Request Type: `POST`
 */
export const SET_EMAIL_CONFIG: UrlConfig = {
  url: `${accountRecoveryServiceUrl}/v1/set-email`,
  timeout: 10000,
};

export type GetCurrentTwoStepMethodReturnType = {
  twoStepMethod: string;
};

/**
 * Request Type: `GET`
 */
export const GET_CURRENT_TWO_STEP_METHOD_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${accountRecoveryServiceUrl}/v1/get-current-two-step-method`,
  timeout: 10000,
};

export type DisableTwoStepMethodReturnType = {
  success: boolean;
};

/**
 * Request Type: `POST`
 */
export const DISABLE_TWO_STEP_METHOD_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${accountRecoveryServiceUrl}/v1/disable-two-step-method`,
  timeout: 10000,
};

export enum CredentialCategory {
  Email = "EMAIL",
  TwoStepVerification = "TWO_STEP_VERIFICATION",
  EnhancedProtectionProgram = "ENHANCED_PROTECTION_PROGRAM",
  Passkey = "PASSKEY",
  BackupCodes = "BACKUP_CODES",
  BillingEmail = "BILLING_EMAIL",
  PhoneNumber = "PHONE_NUMBER",
}

export type CredentialToInvalidate = {
  timeAdded: number;
  value: string;
};

export type CredentialCategoryGroup = {
  category: CredentialCategory;
  credentials: CredentialToInvalidate[];
};

export type GetCredentialsToInvalidateReturnType = {
  credentialsToInvalidate: CredentialCategoryGroup[];
};

/**
 * Request Type: `GET`
 */
export const GET_CREDENTIALS_TO_INVALIDATE_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${accountRecoveryServiceUrl}/v1/get-credentials-to-invalidate`,
  timeout: 10000,
};

export type InvalidateCredentialsReturnType = {};

/**
 * Request Type: `POST`
 */
export const INVALIDATE_CREDENTIALS_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${accountRecoveryServiceUrl}/v1/invalidate-credentials`,
  timeout: 10000,
};
