import { UrlConfig } from "@rbx/core-scripts/http";

export const LegacyAccountInfoUrlConfig: UrlConfig = {
  url: "/my/settings/json",
  withCredentials: true,
};

/**
 * Unfortunately this has no swagger doc so we're forced to continue manually typing the responses.
 */

export enum LegacyAccountInfoError {
  UNKNOWN = 0,
}

export type LegacyAccountInfoResponse = {
  // There are more fields but we only need UserEmail and U13 status for now.
  UserEmail: string;
  UserAbove13: boolean;
};
