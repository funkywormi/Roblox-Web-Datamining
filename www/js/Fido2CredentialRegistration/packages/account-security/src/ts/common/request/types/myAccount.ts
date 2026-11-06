/**
 * My Account
 */

import type { RequestConfig } from "../requestConfig";

const mySettingsUrl = "/my/settings/json";

export enum GetMySettingsInfoError {
  UNKNOWN = 0,
}

export type GetMySettingsInfoReturnType = {
  IsEmailOnFile: boolean;
  IsEmailVerified: boolean;
  UserEmail: string;
  IsDisconnectXboxEnabled: boolean;
  HasValidPasswordSet: boolean;
};

/**
 * Request Type: `GET`.
 */
export const GET_MY_SETTINGS_INFO_CONFIG: RequestConfig = {
  withCredentials: true,
  url: mySettingsUrl,
  timeout: 10000,
};
