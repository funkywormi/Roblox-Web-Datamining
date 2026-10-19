import environmentUrls from "@rbx/environment-urls";
import { post } from "../http";
import {
  ShareLinksType,
  type ResolveShareLinksResponse,
  type ResolveShareLinksV2Response,
} from "@rbx/www-common/deep-link";

export type { ResolveShareLinksResponse, ResolveShareLinksV2Response };

const ResolveShareLinksUrlConfig = {
  url: `${environmentUrls.shareLinksApi}/v1/resolve-link`,
  withCredentials: true,
};

const ResolveShareLinksUrlV2Config = {
  url: `${environmentUrls.shareLinksApiV2}/v2/resolve`,
  withCredentials: true,
};

export const resolveShareLinks = (
  linkId: string,
  linkType: ShareLinksType,
): Promise<{ data: ResolveShareLinksResponse }> =>
  post<ResolveShareLinksResponse>(ResolveShareLinksUrlConfig, {
    linkId,
    linkType,
  });

export const resolveShareLinksV2 = (
  linkId: string,
): Promise<{ data: ResolveShareLinksV2Response }> =>
  post<ResolveShareLinksV2Response>(ResolveShareLinksUrlV2Config, {
    linkId,
  });
