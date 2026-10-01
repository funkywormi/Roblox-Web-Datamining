import * as http from "@rbx/core-scripts/http";
import { Result } from "../../result";
import { toEnum, toResult } from "../common";
import * as Password from "../types/passwords";

export const changeForCurrentUser = (
  currentPassword: string,
  newPassword: string,
): Promise<Result<Password.ChangeForCurrentUserReturnType, Password.PasswordsError | null>> =>
  toResult(
    http.post(Password.CHANGE_FOR_CURRENT_USER_CONFIG, {
      currentPassword,
      newPassword,
    }),
    Password.PasswordsError,
  );

export const resetSendPrompted = (): Promise<Result<void, Password.ResetError | null>> =>
  toResult(http.post(Password.RESET_SEND_PROMPTED_CONFIG), Password.ResetError);

export const validate = async (
  username: string,
  password: string,
): Promise<Result<Password.ValidationStatus | null, null>> =>
  toResult<Password.ValidateReturnType, null>(
    http.post(Password.VALIDATE_CONFIG, { username, password }),
    null,
  ).then(result => Result.map(result, data => toEnum(Password.ValidationStatus, data.code)));
