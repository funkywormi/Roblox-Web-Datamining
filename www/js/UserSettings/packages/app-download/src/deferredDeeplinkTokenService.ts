import * as http from "@rbx/core-scripts/http";
import environmentUrls from "@rbx/environment-urls";
import { deferredDeeplinkGroupName } from "./deferredDeeplinkConstants";
import createDeeplinkTokenNextJs from "./deferredDeeplinkTokenService.nextjs";
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

// Legacy Axios transport for .NET pages. The core-scripts http client attaches the bound-auth-token
// per request; on Next.js the sibling deferredDeeplinkTokenService.nextjs.ts (core-lib fetch) is
// selected instead.
const deferredDeeplinkTokenServiceUrl = `${environmentUrls.apiGatewayUrl}/deferred-deep-link/token-api`;

const createDeeplinkTokenLegacy = async (
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
    sendDeeplinkTokenCreateAttempt(token, linkId, res.status);
    return token;
  } catch {
    return null;
  }
};

// NEXT_PUBLIC_IS_NEXTJS is inlined at build time by Next.js; it is undefined in the Rspack SCC build
// for .NET, so the Axios transport is used there. The nextjs sibling is statically imported so the
// .NET build resolves it — it never *executes* on the .NET path.
const isNextJs = process.env.NEXT_PUBLIC_IS_NEXTJS === "true";

const createDeeplinkToken = isNextJs ? createDeeplinkTokenNextJs : createDeeplinkTokenLegacy;

export default createDeeplinkToken;
