/**
 * Phone
 */

import { EnvironmentUrls } from "Roblox";
import { UrlConfig } from "core-utilities";

const URL_NOT_FOUND = "URL_NOT_FOUND";
const accountInformationApiUrl = EnvironmentUrls.accountInformationApi ?? URL_NOT_FOUND;
const apiGateWayUrl = EnvironmentUrls.apiGatewayUrl ?? URL_NOT_FOUND;

export enum PhoneError {
  UNKNOWN = 0,
}

export type GetPhoneConfigurationReturnType = {
  phone: string;
  isVerified: boolean;
};

/**
 * Request Type: `GET`.
 */
export const GET_PHONE_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${accountInformationApiUrl}/v1/phone`,
  timeout: 10000,
};

/**
 * Request Type: `POST` (duplicated in case we want to separately configure the timeout).
 */
export const POST_PHONE_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${accountInformationApiUrl}/v1/phone`,
  timeout: 10000,
};

/**
 * Request Type: POST
 */
export const VERIFY_CODE_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${accountInformationApiUrl}/v1/phone/verify`,
  timeout: 10000,
};

/**
 * Request Type: POST
 */
export const RESEND_CODE_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${accountInformationApiUrl}/v1/phone/resend`,
  timeout: 10000,
};

export type UpdatePhoneParameters = {
  // No clue why this isn't consistent with the result of list phone prefixes, otherwise I would
  // just compose the type from the below existing types.
  countryCode: string;
  prefix: string;
  phone: string;
};

export type UpdatePhoneReturnType = {
  // No idea what these are for but I've left them up for now so we can use them.
  verificationChannel: string;
  data: unknown;
};

export enum UpdatePhoneError {
  UNKNOWN = 0,
  INVALID = 2,
}

export type VerifyCodeParameters = {
  code: string;
};

// Empty body.
export type VerifyCodeReturnType = {};

// TODO: add to these as we perform a testing party and understand the failure modes.
export enum VerifyCodeError {
  UNKNOWN = 0,
  INVALID = 7,
}

// Empty body.
export type ResendCodeParameters = {};

// Empty body.
export type ResendCodeReturnType = {};

// TODO: add to these as we perform a testing party and understand the failure modes.
export enum ResendCodeError {
  UNKNOWN = 0,
}

export type PhonePrefix = {
  name: string;
  code: string;
  prefix: string;
  localizedName: string;
  isDefault: boolean;
};

export type GetPhonePrefixesListReturnType = PhonePrefix[];

/**
 * Request Type: `GET`.
 */
export const GET_PHONE_PREFIXES_LIST_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${apiGateWayUrl}/phone-number-api/v1/phone-prefix-list`,
  timeout: 10000,
};
