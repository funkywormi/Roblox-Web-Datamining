import * as http from "@rbx/core-lib/http";
import { serialize } from "@rbx/core-lib/json";
import { Url } from "@rbx/core-lib/url";
import environmentUrls from "@rbx/environment-urls";

// Next.js (core-lib fetch) transport. CSRF, bound-auth-token, locale, and Sentry are wired globally
// by www-common setClientInterceptors() (called in www-nextjs instrumentation-client before any
// component runs), so this needs no manual auth wiring. On .NET the sibling getAuthTicket.ts picks
// the Axios transport instead, which attaches the bound-auth-token per request.

// Trim a trailing slash so withPath does not drop authApi's base path on Next hosts.
const apiUrl = (path: string) =>
  Url.parse(`${environmentUrls.authApi.replace(/\/+$/, "")}${path}`).getOrThrow();

export const getAuthTicket = async (): Promise<string | undefined> => {
  const assertion = await http.getUntyped(apiUrl("/v1/client-assertion/"), {
    credentials: "include",
  });
  const response = await http.fetch(apiUrl("/v1/authentication-ticket/"), {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: serialize((assertion.isOk() ? assertion.value : null) ?? {}).getOrThrow(),
  });
  if (response.isErr()) {
    return undefined;
  }
  const ticket = response.value.headers.get("rbx-authentication-ticket");
  if (!ticket) {
    return undefined;
  }
  return ticket;
};
