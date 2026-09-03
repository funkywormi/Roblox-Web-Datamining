/**
 * Users API
 */

import { EnvironmentUrls } from "Roblox";
import { UrlConfig } from "core-utilities";

const URL_NOT_FOUND = "URL_NOT_FOUND";

const usersApiUrl = EnvironmentUrls.usersApi ?? URL_NOT_FOUND;

const USERS_API_TIMEOUT = 10000;

export enum UsersApiError {
  UNKNOWN = 0,
}

/**
 * Used as a partial request type.
 */
export type UserInfo = {
  isBanned: boolean;
  hasVerifiedBadge: boolean;
  id: number;
  name: string;
  displayName: string;
};
/**
 * Request Type: `GET`.
 */
export const GET_USER_BY_ID_CONFIG: (userId: string) => UrlConfig = userId => ({
  withCredentials: true,
  url: `${usersApiUrl}/v1/users/${userId}`,
  timeout: USERS_API_TIMEOUT,
});

export type UserInfoListItem = {
  hasVerifiedBadge: boolean;
  id: number;
  name: string;
  displayName: string;
};

export type UserInfoListResponse = {
  data: UserInfoListItem[];
};

/**
 * Request Type: `POST`.
 */
export const GET_USER_BY_USERNAME_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${usersApiUrl}/v1/usernames/users`,
  timeout: USERS_API_TIMEOUT,
};

/**
 * Request Type: `POST`.
 */
export const GET_USERS_BY_IDS_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${usersApiUrl}/v1/users`,
  timeout: USERS_API_TIMEOUT,
};
