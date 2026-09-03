import * as http from "@rbx/core-scripts/http";
import type { TSecureAuthIntent } from "@rbx/core-scripts/auth/crypto";
import { Result } from "../../result";
import { toResult } from "../common";
import * as AuthApi from "../types/auth";

export {
  startPreAuthPasskeyRegistration,
  startPasskeyRegistration,
  finishPasskeyRegistration,
  finishARPreAuthPasskeyRegistration,
  deletePasskeyBatch,
  PasswordDeletionSource,
} from "@rbx/authentication-common/passkey/api";

export const listAllCredentials = (
  options: { all: boolean } = { all: true },
): Promise<Result<AuthApi.ListCredentialsReturnType, AuthApi.AuthApiError | null>> =>
  toResult(http.post(AuthApi.LIST_CREDENTIALS_CONFIG, options), AuthApi.AuthApiError);

export const resetPassword = (
  targetType: string,
  ticket: string,
  userId: number,
  password: string,
  passwordRepeated: string,
  twoStepVerificationChallengeId?: string,
  twoStepVerificationToken?: string,
  accountBlob?: string,
  secureAuthenticationIntent?: TSecureAuthIntent | null,
  passkeySessionId?: string,
  passkeyRegistrationResponse?: string,
  newEmail?: string,
): Promise<Result<AuthApi.ResetPasswordReturnType, AuthApi.PasswordResetError | null>> =>
  toResult(
    http.post(AuthApi.RESET_PASSWORD_CONFIG, {
      targetType,
      ticket,
      userId,
      password,
      passwordRepeated,
      twoStepVerificationChallengeId,
      twoStepVerificationToken,
      accountBlob,
      secureAuthenticationIntent,
      passkeySessionId,
      passkeyRegistrationResponse,
      newEmail,
    }),
    AuthApi.PasswordResetError,
  );

/**
 * Invalidates all account security tickets / revert links for the authenticated user.
 * This should be called before enrolling in EPP to ensure old revert links cannot be used.
 */
export const invalidateTicketsForEppEnrollment = (): Promise<
  Result<AuthApi.InvalidateTicketsReturnType, AuthApi.AuthApiError | null>
> => toResult(http.post(AuthApi.INVALIDATE_TICKETS_CONFIG, {}), AuthApi.AuthApiError);
