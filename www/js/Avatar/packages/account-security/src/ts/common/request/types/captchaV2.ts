import environmentUrls from "@rbx/environment-urls";
import type { RequestConfig } from "../requestConfig";

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

export const SUBMIT_CAPTCHA_V2_CONFIG: RequestConfig = {
  withCredentials: true,
  url: `${apiGatewayUrl}/v2/captcha`,
  timeout: 10000,
  headers: {
    Accept: "application/json",
  },
};

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
