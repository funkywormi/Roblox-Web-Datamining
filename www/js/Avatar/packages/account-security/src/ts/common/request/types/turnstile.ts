import { UrlConfig } from "@rbx/core-scripts/http";
import environmentUrls from "@rbx/environment-urls";

const { apiGatewayUrl } = environmentUrls;

export enum TurnstileError {
  UNKNOWN = 0,
}

export type GetTurnstileMetadataReturnType = {
  // eslint-disable-next-line camelcase
  cloudflare_turnstile_site_key: string;
};

/**
 * Request Type: `GET`. Returns the Turnstile site key used to render the
 * widget.
 */
export const GET_TURNSTILE_METADATA_CONFIG: UrlConfig = {
  url: `${apiGatewayUrl}/turnstile-service/v1/metadata`,
  timeout: 10000,
};
