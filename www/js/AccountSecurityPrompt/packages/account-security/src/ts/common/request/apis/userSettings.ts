import * as http from "@rbx/core-scripts/http";
import { Result } from "../../result";
import { toResult } from "../common";
import {
  USER_SETTINGS_URL_CONFIG,
  UserSettingsApiError,
  UserSettingsReturnType,
  EppEnrollmentStatus,
} from "../types/userSettings";

export const userSettings = (): Promise<
  Result<UserSettingsReturnType, UserSettingsApiError | null>
> => toResult(http.get(USER_SETTINGS_URL_CONFIG), UserSettingsApiError);

export const changeEppStatus = (
  status: EppEnrollmentStatus,
  isEppUIEnabled?: boolean,
): Promise<Result<UserSettingsReturnType, UserSettingsApiError | null>> => {
  if (isEppUIEnabled === false) {
    return Promise.resolve(
      Result.error<UserSettingsReturnType, UserSettingsApiError | null>(
        UserSettingsApiError.FLAG_OFF,
        null,
        null,
      ),
    );
  }

  return toResult(
    http.post(USER_SETTINGS_URL_CONFIG, {
      eppEnrollmentStatus: status,
    }),
    UserSettingsApiError,
  );
};
