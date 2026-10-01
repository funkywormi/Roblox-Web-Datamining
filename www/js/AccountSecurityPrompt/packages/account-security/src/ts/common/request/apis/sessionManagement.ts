import * as http from "@rbx/core-scripts/http";
import type { TSecureAuthIntent } from "@rbx/core-scripts/auth/crypto";
import { Result } from "../../result";
import { toResult } from "../common";
import * as SessionManagement from "../types/sessionManagement";

export const getSessions = async (
  nextCursor?: string,
  desiredLimit?: string,
): Promise<
  Result<SessionManagement.GetSessionsReturnType, SessionManagement.SessionManagementError | null>
> =>
  toResult(
    http.get(SessionManagement.GET_SESSIONS_CONFIG, { nextCursor, desiredLimit }),
    SessionManagement.SessionManagementError,
  );

export const logoutSession = async (
  token: string,
): Promise<
  Result<SessionManagement.LogoutSessionReturnType, SessionManagement.SessionManagementError | null>
> =>
  toResult(
    http.post(SessionManagement.LOGOUT_SESSION_CONFIG, { token }),
    SessionManagement.SessionManagementError,
  );

export const logoutFromAllSessionsAndReauthenticate = async (
  secureAuthenticationIntent: TSecureAuthIntent | null,
): Promise<
  Result<SessionManagement.LogoutFromAllSessionsReturnType, SessionManagement.AuthError | null>
> =>
  toResult(
    http.post(SessionManagement.LOGOUT_FROM_ALL_SESSIONS_CONFIG, {
      secureAuthenticationIntent,
    }),
    SessionManagement.AuthError,
  );
