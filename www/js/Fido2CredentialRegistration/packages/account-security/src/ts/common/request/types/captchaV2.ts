import { UrlConfig } from "@rbx/core-scripts/http";
import environmentUrls from "@rbx/environment-urls";

const { apiGatewayUrl } = environmentUrls;

export enum CaptchaV2Error {
  UNKNOWN = 0,
  INVALID_REQUEST = 1,
  SESSION_NOT_FOUND = 2,
  INTERNAL_ERROR = 3,
}

export const SUBMIT_CAPTCHA_V2_CONFIG: UrlConfig = {
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
