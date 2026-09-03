import * as http from "@rbx/core-scripts/http";
import { Result } from "../../result";
import { toResult } from "../common";
import * as AccountRecovery from "../types/accountRecovery";

export const requestRecovery = (
  identifier: string,
  identifierType: AccountRecovery.IdentifierType,
  requestedRecoveryTypes: AccountRecovery.RequestedRecoveryType[],
  recoverySessionId?: string,
): Promise<
  Result<AccountRecovery.RequestRecoveryReturnType, AccountRecovery.AccountRecoveryError | null>
> =>
  toResult(
    http.post(AccountRecovery.REQUEST_RECOVERY_CONFIG, {
      identifier,
      identifierType,
      recoverySessionId,
      requestedRecoveryTypes,
    }),
    AccountRecovery.AccountRecoveryError,
  );

export const sendCode = (
  contactMethod: string,
  contactMethodType: AccountRecovery.ContactMethodType,
  recoverySessionId: string,
  contactMethodNumber?: number,
): Promise<
  Result<AccountRecovery.SendCodeReturnType, AccountRecovery.AccountRecoveryError | null>
> =>
  toResult(
    http.post(AccountRecovery.SEND_CODE_CONFIG, {
      contactMethod,
      contactMethodType,
      recoverySessionId,
      contactMethodNumber,
    }),
    AccountRecovery.AccountRecoveryError,
  );

export const resendCode = (
  recoverySessionId: string,
  contactMethodNumber?: number,
): Promise<
  Result<AccountRecovery.ResendCodeReturnType, AccountRecovery.AccountRecoveryError | null>
> =>
  toResult(
    http.post(AccountRecovery.RESEND_CODE_CONFIG, {
      recoverySessionId,
      contactMethodNumber,
    }),
    AccountRecovery.AccountRecoveryError,
  );

export const verifyCode = (
  recoverySessionId: string,
  code: string,
  contactMethodNumber?: number,
): Promise<
  Result<AccountRecovery.VerifyCodeReturnType, AccountRecovery.AccountRecoveryError | null>
> =>
  toResult(
    http.post(AccountRecovery.VERIFY_CODE_CONFIG, {
      recoverySessionId,
      code,
      contactMethodNumber,
    }),
    AccountRecovery.AccountRecoveryError,
  );

export const getRecoveryIntentStatus = (
  recoverySessionId: string,
): Promise<
  Result<
    AccountRecovery.GetRecoveryIntentStatusReturnType,
    AccountRecovery.AccountRecoveryError | null
  >
> =>
  toResult(
    http.get(AccountRecovery.GET_RECOVERY_INTENT_STATUS_CONFIG, {
      recoveryId: recoverySessionId,
    }),
    AccountRecovery.AccountRecoveryError,
  );

export const verifyRecoveryIntent = (
  recoverySessionId: string,
): Promise<
  Result<
    AccountRecovery.VerifyRecoveryIntentReturnType,
    AccountRecovery.AccountRecoveryError | null
  >
> =>
  toResult(
    http.post(AccountRecovery.VERIFY_RECOVERY_INTENT_CONFIG, {
      recoverySessionId,
    }),
    AccountRecovery.AccountRecoveryError,
  );

export const verifyBackupCode = (
  recoverySessionId: string,
  backupCode: string,
): Promise<
  Result<AccountRecovery.VerifyBackupCodeReturnType, AccountRecovery.AccountRecoveryError | null>
> =>
  toResult(
    http.post(AccountRecovery.VERIFY_BACKUP_CODE_CONFIG, {
      recoverySessionId,
      backupCode,
    }),
    AccountRecovery.AccountRecoveryError,
  );

export const continueRecovery = (
  recoverySessionId: string,
  userId: number,
  recover2sv?: boolean,
  twoStepVerificationToken?: string,
  twoStepVerificationChallengeId?: string,
): Promise<
  Result<AccountRecovery.ContinueRecoveryReturnType, AccountRecovery.AccountRecoveryError | null>
> =>
  toResult(
    http.post(AccountRecovery.CONTINUE_RECOVERY_CONFIG, {
      recoverySessionId,
      userId,
      recover2sv,
      twoStepVerificationToken,
      twoStepVerificationChallengeId,
    }),
    AccountRecovery.AccountRecoveryError,
  );

export const recoverySessionMetadata = (
  recoverySessionId: string,
): Promise<
  Result<
    AccountRecovery.RecoverySessionMetadataReturnType,
    AccountRecovery.AccountRecoveryError | null
  >
> =>
  toResult(
    http.post(AccountRecovery.RECOVERY_SESSION_METADATA_CONFIG, {
      recoverySessionId,
    }),
    AccountRecovery.AccountRecoveryError,
  );

export const setEmail = (
  recoverySessionId: string,
): Promise<
  Result<AccountRecovery.SetEmailReturnType, AccountRecovery.AccountRecoveryError | null>
> =>
  toResult(
    http.post(AccountRecovery.SET_EMAIL_CONFIG, {
      recoverySessionId,
    }),
    AccountRecovery.AccountRecoveryError,
  );

export const getCurrentTwoStepMethod = (
  recoverySessionId: string,
): Promise<
  Result<
    AccountRecovery.GetCurrentTwoStepMethodReturnType,
    AccountRecovery.AccountRecoveryError | null
  >
> =>
  toResult(
    http.get(AccountRecovery.GET_CURRENT_TWO_STEP_METHOD_CONFIG, {
      recoverySessionId,
    }),
    AccountRecovery.AccountRecoveryError,
  );

export const disableTwoStepMethod = (
  recoverySessionId: string,
  twoStepMethod: string,
): Promise<
  Result<
    AccountRecovery.DisableTwoStepMethodReturnType,
    AccountRecovery.AccountRecoveryError | null
  >
> =>
  toResult(
    http.post(AccountRecovery.DISABLE_TWO_STEP_METHOD_CONFIG, {
      recoverySessionId,
      twoStepMethod,
    }),
    AccountRecovery.AccountRecoveryError,
  );

export const getCredentialsToInvalidate = (
  recoverySessionId: string,
): Promise<
  Result<
    AccountRecovery.GetCredentialsToInvalidateReturnType,
    AccountRecovery.AccountRecoveryError | null
  >
> =>
  toResult(
    httpService.get(AccountRecovery.GET_CREDENTIALS_TO_INVALIDATE_CONFIG, {
      recoverySessionId,
    }),
    AccountRecovery.AccountRecoveryError,
  );

export const invalidateCredentials = (
  recoverySessionId: string,
  shouldInvalidateCredentials: boolean,
): Promise<
  Result<
    AccountRecovery.InvalidateCredentialsReturnType,
    AccountRecovery.AccountRecoveryError | null
  >
> =>
  toResult(
    httpService.post(AccountRecovery.INVALIDATE_CREDENTIALS_CONFIG, {
      recoverySessionId,
      shouldInvalidateCredentials,
    }),
    AccountRecovery.AccountRecoveryError,
  );
