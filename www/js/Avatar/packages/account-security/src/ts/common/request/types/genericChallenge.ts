import EnvironmentUrls from "@rbx/environment-urls";
import { UrlConfig } from "@rbx/core-scripts/http";

const URL_NOT_FOUND = "URL_NOT_FOUND";
const apiGatewayUrl = EnvironmentUrls.apiGatewayUrl ?? URL_NOT_FOUND;

const genericChallengeServiceUrl = `${apiGatewayUrl}/challenge`;

export enum GenericChallengeError {
  UNKNOWN = 1,
}

/**
 * Request Type: `POST`.
 */
export const CONTINUE_CHALLENGE_CONFIG: UrlConfig = {
  withCredentials: true,
  url: `${genericChallengeServiceUrl}/v1/continue`,
  timeout: 10000,
};

export type ContinueChallengeReturnType = {
  challengeId: string;
  challengeType: string;
  challengeMetadata: string;
};
