import * as http from "@rbx/core-scripts/http";
import environmentUrls from "@rbx/environment-urls";
import { deferredDeeplinkGroupName } from "./deferredDeeplinkConstants";
import sendDeeplinkTokenCreateAttempt from "./deferredDeeplinkEvents";

const deferredDeeplinkTokenServiceUrl = `${environmentUrls.apiGatewayUrl}/deferred-deep-link/token-api`;
export type TCreateDeeplinkTokenResponse = {
  token?: string | null;
  expirationTime: string;
};

export type CreateDeeplinkTokenOptions = {
  authTicket?: string;
  btId?: string;
  downloadSource?: string;
};

const createDeeplinkToken = async (
  experienceAffiliateReferralUrl: string,
  options: CreateDeeplinkTokenOptions = {},
): Promise<string | null> => {
  const { authTicket, btId, downloadSource } = options;
  const createDeeplinkTokenRequestBody: {
    linkId: string;
    group: string;
    authTicket?: string;
    btId?: string;
    downloadSource?: string;
  } = {
    linkId: experienceAffiliateReferralUrl,
    group: deferredDeeplinkGroupName,
  };

  if (authTicket) {
    createDeeplinkTokenRequestBody.authTicket = authTicket;
  }
  if (btId) {
    createDeeplinkTokenRequestBody.btId = btId;
  }
  if (downloadSource) {
    createDeeplinkTokenRequestBody.downloadSource = downloadSource;
  }

  const urlConfig = {
    withCredentials: true,
    url: `${deferredDeeplinkTokenServiceUrl}/create-token`,
  };

  try {
    const res = await http.post<TCreateDeeplinkTokenResponse>(
      urlConfig,
      createDeeplinkTokenRequestBody,
    );
    const token = res.data.token ?? null;
    sendDeeplinkTokenCreateAttempt(token, experienceAffiliateReferralUrl, res.status);
    return token;
  } catch {
    return null;
  }
};

export default createDeeplinkToken;
