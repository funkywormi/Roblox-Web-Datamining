import * as http from "@rbx/core-scripts/http";
import environmentUrls from "@rbx/environment-urls";
import { getAuthTicket as getAuthTicketNextJs } from "./getAuthTicket.nextjs";

// Legacy Axios transport for .NET pages. The core-scripts http client attaches the bound-auth-token
// per request (see core-scripts/src/http/service.ts), which the authentication-ticket endpoint
// requires. On Next.js the sibling getAuthTicket.nextjs.ts (core-lib fetch) is selected instead,
// where the bound-auth-token is attached by the globally-registered www-common interceptor.
const getAuthTicketLegacy = async (): Promise<string | undefined> => {
  let clientAssertion: unknown;
  try {
    ({ data: clientAssertion } = await http.get({
      url: `${environmentUrls.authApi}/v1/client-assertion/`,
      withCredentials: true,
    }));
  } catch {
    // do nothing
  }

  try {
    const response = await http.post(
      {
        url: `${environmentUrls.authApi}/v1/authentication-ticket/`,
        withCredentials: true,
      },
      clientAssertion ?? {},
    );
    const headers = response.headers as unknown;
    if (headers != null && typeof headers === "object") {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      const authTicket = (headers as Record<string, unknown>)["rbx-authentication-ticket"];
      if (typeof authTicket === "string" && authTicket.length > 0) {
        return authTicket;
      }
    }
    return undefined;
  } catch {
    return undefined;
  }
};

// NEXT_PUBLIC_IS_NEXTJS is inlined at build time by Next.js; it is undefined in the Rspack SCC build
// for .NET, so the Axios transport is used there. The nextjs sibling is statically imported so the
// .NET build resolves it — it never *executes* on the .NET path.
const isNextJs = process.env.NEXT_PUBLIC_IS_NEXTJS === "true";

export const getAuthTicket = isNextJs ? getAuthTicketNextJs : getAuthTicketLegacy;
