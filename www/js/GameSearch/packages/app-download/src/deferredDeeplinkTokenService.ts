import * as http from "@rbx/core-lib/http";
import { Url } from "@rbx/core-lib/url";
import environmentUrls from "@rbx/environment-urls";
import { deferredDeeplinkGroupName } from "./deferredDeeplinkConstants";
import sendDeeplinkTokenCreateAttempt from "./deferredDeeplinkEvents";

export type TCreateDeeplinkTokenResponse = {
  token?: string | null;
  expirationTime: string;
};

export type CreateDeeplinkTokenOptions = {
  authTicket?: string;
  btId?: string;
  downloadSource?: string;
};

// Built per call so importing never parses environmentUrls, which test mocks leave as placeholders.
const getCreateDeeplinkTokenUrl = () =>
  Url.parse(environmentUrls.apiGatewayUrl)
    .getOrThrow()
    .withPath("/deferred-deep-link/token-api/create-token");

// CSRF and the bound-auth token come from the host's setClientInterceptors (coreUtilities on .NET,
// instrumentation-client on Next.js).
const createDeeplinkToken = async (
  linkId: string,
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
    linkId,
    group: deferredDeeplinkGroupName,
  };

  // Mirror the backend's IsNullOrEmpty skip on each optional key.
  if (authTicket) {
    createDeeplinkTokenRequestBody.authTicket = authTicket;
  }
  if (btId) {
    createDeeplinkTokenRequestBody.btId = btId;
  }
  if (downloadSource) {
    createDeeplinkTokenRequestBody.downloadSource = downloadSource;
  }

  try {
    const response = await http
      .fetch(getCreateDeeplinkTokenUrl(), {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(createDeeplinkTokenRequestBody),
      })
      .getOrThrow();
    const data: unknown = await response.json();
    const token =
      typeof data === "object" &&
      data !== null &&
      "token" in data &&
      (typeof data.token === "string" || data.token === null)
        ? data.token
        : null;
    sendDeeplinkTokenCreateAttempt(token, linkId, response.status);
    return token;
  } catch {
    return null;
  }
};

export default createDeeplinkToken;
