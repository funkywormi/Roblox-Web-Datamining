/**
 * Captcha
 */

import EnvironmentUrls from "@rbx/environment-urls";
import type { RequestConfig } from "../requestConfig";

const URL_NOT_FOUND = "URL_NOT_FOUND";
const apiGatewayUrl = EnvironmentUrls.apiGatewayCdnUrl ?? URL_NOT_FOUND;

const captchaServiceUrl = `${apiGatewayUrl}/captcha`;

// Placeholder type:
export enum CaptchaError {
  UNKNOWN = 0,
}

export type GetMetadataReturnType = {
  funCaptchaPublicKeys: Record<string, string>;
  disableCaptchaVersionExperiment?: boolean;
};

/**
 * Request Type: `GET`.
 */
export const GET_METADATA_CONFIG: RequestConfig = {
  url: `${captchaServiceUrl}/v1/metadata`,
  timeout: 60000,
};
