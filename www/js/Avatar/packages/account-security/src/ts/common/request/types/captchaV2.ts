import { UrlConfig } from "@rbx/core-scripts/http";
import environmentUrls from "@rbx/environment-urls";

const { apiGatewayUrl } = environmentUrls;

export enum CaptchaV2Error {
  UNKNOWN = 0,
  INVALID_REQUEST = 1,
  SESSION_NOT_FOUND = 2,
  INTERNAL_ERROR = 3,
}

/**
 * The optional captcha "mode" surfaced by GCS on the CaptchaV2 challenge
 * parameters. May be absent.
 */
export enum CaptchaMode {
  MONITOR = "CAPTCHA_MODE_MONITOR",
}

export const SUBMIT_CAPTCHA_V2_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${apiGatewayUrl}/v2/captcha`,
  timeout: 10000,
  headers: {
    Accept: "application/json",
  },
};

/**
 * Alternate verification endpoint. Same request/response shape as
 * `SUBMIT_CAPTCHA_V2_CONFIG`.
 */
export const SUBMIT_ALT_CAPTCHA_V2_CONFIG: UrlConfig = {
  ...SUBMIT_CAPTCHA_V2_CONFIG,
  url: `${apiGatewayUrl}/v2/alt-captcha`,
};

/**
 * Selects the verification endpoint for a CaptchaV2 challenge. The optional
 * `mode` selects the alternate config when set to `MONITOR`; otherwise
 * (including when absent) the default config is used.
 */
export const getSubmitCaptchaV2Config = (mode?: CaptchaMode): UrlConfig =>
  mode === CaptchaMode.MONITOR ? SUBMIT_ALT_CAPTCHA_V2_CONFIG : SUBMIT_CAPTCHA_V2_CONFIG;

export type SubmitCaptchaV2Request = {
  // eslint-disable-next-line camelcase
  challenge_id: string;
};

export type SubmitCaptchaV2ReturnType = {
  // eslint-disable-next-line camelcase
  redemption_token: string;
};

// Block response parameters returned by v2/captcha on visible challenge.
export type CaptchaV2BlockResponse = {
  appId: string;
  jsClientSrc: string;
  firstPartyEnabled: boolean;
  vid: string;
  uuid: string;
  hostUrl: string;
  blockScript: string;
  blockedUrl?: string;
};
