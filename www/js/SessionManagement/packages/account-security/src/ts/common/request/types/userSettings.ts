import { UrlConfig } from "core-utilities";
import { EnvironmentUrls } from "Roblox";

export enum UserSettingsApiError {
  UNKNOWN = 0,
  FLAG_OFF = 1,
}

// Based on the source-of-truth here:
// go/epp-enum
export enum EppEnrollmentStatus {
  INVALID = "Invalid",
  KEY_PLAN_ENROLLED = "KeyPlanEnrolled",
  UNENROLLED = "Unenrolled",
}

// Partial. We can add other user settings as needed.
export type UserSettingsReturnType = {
  eppEnrollmentStatus: EppEnrollmentStatus;
};

export const USER_SETTINGS_URL_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${EnvironmentUrls?.userSettingsApi}/v1/user-settings`,
  timeout: 10000,
};
